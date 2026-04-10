# Spec 06: Infraestructura — Terraform (AWS) + CI/CD (GitHub Actions)

## Objetivo

Definir la infraestructura de producción en AWS con Terraform y los pipelines de CI/CD con GitHub Actions. Esta spec se ejecuta después de que toda la funcionalidad está completa y testeada.

**Prerequisito:** Specs 00–05 completadas (aplicación funcional con todos los tests pasando).

---

## 1. Terraform — Infraestructura AWS

### Arquitectura

```
Internet → CloudFront (CDN) → S3 (Frontend estático)
                            → ALB → ECS Fargate (Backend) → RDS PostgreSQL
```

### Estructura de carpetas

```
terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars.example
└── modules/
    ├── vpc/          (VPC, subnets, IGW, NAT)
    ├── ecr/          (Container registry)
    ├── ecs/          (Cluster, task, service, auto-scaling)
    ├── rds/          (PostgreSQL 16)
    ├── alb/          (Load balancer, target group, health check)
    └── cdn/          (S3 bucket, CloudFront distribution)
```

### Módulo VPC

- CIDR: `10.0.0.0/16`
- 2 subnets públicas (AZ a, b) — para ALB
- 2 subnets privadas (AZ a, b) — para ECS y RDS
- Internet Gateway, NAT Gateway, route tables
- Tags: `Project = "tcit-posts"`, `Environment = var.environment`

### Módulo ECR

- Repositorio: `tcit-posts-backend`
- Lifecycle: mantener últimas 10 imágenes

### Módulo ECS

- Cluster: `tcit-posts-cluster`
- Task Definition: Fargate, 256 CPU, 512 MB, puerto 3000
- Service: desired 2, subnets privadas, SG permite 3000 desde ALB
- Auto-scaling: min 1, max 4, target 70% CPU
- Logs: CloudWatch via awslogs driver
- Environment: `DATABASE_URL`, `NODE_ENV`, `PORT`

### Módulo RDS

- Engine: PostgreSQL 16, instance `db.t3.micro`
- Storage: 20 GB gp3
- DB name: `tcit_posts`
- Subnet group: subnets privadas
- SG: permite 5432 solo desde ECS SG
- Backup: 7 días, deletion protection en prod
- Credentials: AWS Secrets Manager

### Módulo ALB

- ALB en subnets públicas
- Listener HTTP 80
- Target group: ECS puerto 3000
- Health check: `GET /api/v1/health` cada 30s
- SG: permite 80/443 desde cualquier lugar

### Módulo CDN

- S3 bucket para frontend estático
- CloudFront:
  - Default → S3 (frontend)
  - `/api/*` → ALB (backend)
  - Error pages: 403/404 → `/index.html` (SPA routing)
  - Cache: 1h HTML, 1y assets estáticos

### Root Config

```hcl
terraform {
  required_version = ">= 1.5"
  backend "s3" {
    bucket = "tcit-posts-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}
```

**Variables:** aws_region, environment, db_username (sensitive), db_password (sensitive), backend_image
**Outputs:** alb_dns_name, cloudfront_domain, rds_endpoint, ecr_repository_url

---

## 2. GitHub Actions — CI

### `.github/workflows/ci.yml`

**Trigger:** push a cualquier branch, PR a main.

**Jobs (en paralelo donde sea posible):**

```
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│ backend-lint    │  │ backend-test     │  │ backend-build   │
│ (npm run lint)  │  │ (jest + postgres)│  │ (tsc build)     │
└─────────────────┘  └──────────────────┘  └─────────────────┘

┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│ frontend-lint   │  │ frontend-test    │  │ frontend-build  │
│ (npm run lint)  │  │ (vitest)         │  │ (vite build)    │
└─────────────────┘  └──────────────────┘  └─────────────────┘

                     ┌──────────────────┐
                     │ e2e-tests        │  ← Depende de backend-build + frontend-build
                     │ (playwright)     │
                     └──────────────────┘
```

**Backend tests** usan PostgreSQL como service container:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tcit_posts_test
    ports: ["5432:5432"]
    options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
```

**E2E tests:** levantan backend + frontend, ejecutan Playwright.

---

## 3. GitHub Actions — CD

### `.github/workflows/cd.yml`

**Trigger:** push a `main` (después de CI).

**Job: deploy-backend**
1. Checkout
2. Configure AWS credentials (OIDC)
3. Login ECR
4. Build + push Docker image (tag: `git sha` + `latest`)
5. Update ECS service → force new deployment

**Job: deploy-frontend**
1. Checkout
2. npm ci + npm run build
3. Configure AWS credentials (OIDC)
4. `aws s3 sync dist/ s3://bucket --delete`
5. `aws cloudfront create-invalidation --paths "/*"`

### Secrets requeridos

| Secret | Descripción |
|--------|-------------|
| `AWS_ROLE_ARN` | IAM role para GitHub OIDC |
| `API_URL` | URL base del API en producción |
| `S3_BUCKET` | Nombre del bucket S3 para frontend |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID de distribución CloudFront |

---

## 4. Branch Protection

Configurar para `main`:
- Requiere PR con 1 aprobación
- Status checks obligatorios: todos los jobs de CI
- Branch actualizado antes de merge
- No force push

---

## 5. Dockerfiles de Producción

### `backend/Dockerfile` (ya existe desde spec 00, verificar stage production)

```dockerfile
# Production stage
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

### `frontend/Dockerfile` (ya existe, verificar stage production con nginx)

```dockerfile
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### `frontend/nginx.conf`

- SPA fallback: `try_files $uri $uri/ /index.html`
- Proxy `/api/` → `http://backend:3000`
- Cache assets estáticos: 1 año

---

## Criterios de Aceptación

- [ ] `terraform init` y `terraform plan` ejecutan sin errores
- [ ] VPC tiene subnets públicas y privadas en 2 AZs
- [ ] ECS Fargate corre containers del backend
- [ ] RDS solo accesible desde SG de ECS
- [ ] ALB health check apunta a `/api/v1/health`
- [ ] CloudFront sirve frontend y proxea `/api/*` al ALB
- [ ] CI se ejecuta en push y PR, todos los jobs pasan
- [ ] E2E tests corren después de builds
- [ ] CD despliega backend a ECS y frontend a S3 al pushear a main
- [ ] Branch protection configurada en main

---

## Archivos a crear

| Archivo | Propósito |
|---------|-----------|
| `terraform/main.tf` | Provider, backend S3 |
| `terraform/variables.tf` | Variables de input |
| `terraform/outputs.tf` | Outputs |
| `terraform/terraform.tfvars.example` | Ejemplo de variables |
| `terraform/modules/vpc/main.tf` | VPC, subnets, gateways |
| `terraform/modules/ecr/main.tf` | Container registry |
| `terraform/modules/ecs/main.tf` | Cluster, task, service |
| `terraform/modules/rds/main.tf` | PostgreSQL |
| `terraform/modules/alb/main.tf` | Load balancer |
| `terraform/modules/cdn/main.tf` | S3 + CloudFront |
| Cada módulo: `variables.tf` + `outputs.tf` | Inputs/outputs |
| `.github/workflows/ci.yml` | Pipeline CI |
| `.github/workflows/cd.yml` | Pipeline CD |
| `frontend/nginx.conf` | Nginx config producción |
