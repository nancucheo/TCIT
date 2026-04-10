# TCIT Posts Manager

Aplicacion web full-stack para gestion de publicaciones (CRUD), desarrollada como desafio tecnico para TCIT Cloud Solutions.

Monorepo con npm workspaces: backend en Express.js + Prisma, frontend en React + Redux Toolkit, infraestructura en Terraform (AWS), CI/CD con GitHub Actions.

---

## Metricas del Proyecto

| Metrica | Valor |
|---------|-------|
| Tests unitarios backend | **69 passed** / 69 total |
| Tests unitarios frontend | **59 passed** / 59 total |
| Tests E2E (Playwright) | **18 casos** en 4 suites |
| **Total de tests** | **146** |
| Cobertura backend (statements) | **100%** |
| Cobertura backend (branches) | **94.87%** |
| Cobertura frontend (statements) | **99.17%** |
| Cobertura frontend (branches) | **97.29%** |
| Threshold minimo exigido | **90%** (statements, branches, functions, lines) |
| Lineas de codigo backend | ~507 |
| Lineas de codigo frontend | ~558 |
| Lineas de infra (Terraform) | ~1019 |
| Archivos de test | 25 (7 backend + 14 frontend + 4 E2E) |

### Cobertura detallada por capa (Backend)

```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |     100 |    94.87 |     100 |     100 |
 application/services     |     100 |      100 |     100 |     100 |
 application/validators   |     100 |      100 |     100 |     100 |
 domain/models            |     100 |      100 |     100 |     100 |
 infrastructure           |     100 |      100 |     100 |     100 |
 middleware               |     100 |      100 |     100 |     100 |
 presentation/controllers |     100 |    71.42 |     100 |     100 |
 routes                   |     100 |      100 |     100 |     100 |
 shared                   |     100 |      100 |     100 |     100 |
--------------------------|---------|----------|---------|---------|
```

### Cobertura detallada por capa (Frontend)

```
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   99.17 |    97.29 |   96.29 |   99.17 |
 App.tsx               |     100 |      100 |     100 |     100 |
 app (hooks, store)    |     100 |      100 |     100 |     100 |
 posts/components      |     100 |      100 |     100 |     100 |
 posts/hooks           |     100 |      100 |     100 |     100 |
 posts/slices          |     100 |      100 |     100 |     100 |
 shared/components     |   97.41 |    92.30 |   91.66 |   97.41 |
-----------------------|---------|----------|---------|---------|
```

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 18, TypeScript strict, Redux Toolkit, RTK Query, Vite, React Bootstrap |
| Backend | Express.js, TypeScript strict, Prisma ORM, PostgreSQL 16 |
| Testing | Jest (backend), Vitest + React Testing Library (frontend), Playwright (E2E) |
| Infraestructura | Docker, Docker Compose, Terraform (AWS), GitHub Actions |
| Logging | Pino (JSON estructurado) |
| Validacion | Zod (frontend), validadores centralizados (backend) |

---

## Arquitectura

### Backend: DDD Layered

```
Request
  |
  v
Route --> Controller (thin, mapea HTTP)
            |
            v
          Service (logica de negocio, retorna Result<T>)
            |
            v
          Repository Interface (dominio)
            |
            v
          PrismaRepository (infraestructura) --> PostgreSQL
```

**Capas:**

| Capa | Directorio | Responsabilidad |
|------|-----------|----------------|
| Domain | `src/domain/` | Entidad `Post`, interfaz `IPostRepository` |
| Application | `src/application/` | `PostService` (Result\<T\>), validadores |
| Presentation | `src/presentation/` | Controllers HTTP (thin) |
| Infrastructure | `src/infrastructure/` | Prisma client, Pino logger, repositorio concreto |

**Patron Result\<T\>:** Los servicios nunca lanzan excepciones para errores de negocio. Retornan `Result.success(data)` o `Result.failure(code, message)`. El controller mapea el codigo de error a HTTP status.

### Frontend: Feature-Based

```
App
 |-- ErrorBoundary
 |-- ToastProvider
 |-- Layout
      |-- PostFilter  (input de busqueda, filtra client-side)
      |-- PostForm    (React Hook Form + Zod)
      |-- PostList    (tabla con estados loading/error/empty)
           |-- PostItem (fila con accion eliminar)
```

**Estado:** Redux Toolkit store con RTK Query para llamadas API y cache automatico. Slice local para filtro de texto.

---

## Modelo de Datos

**Tabla: `posts`** (PostgreSQL 16)

| Columna | Tipo | Constraints |
|---------|------|------------|
| `id` | `SERIAL` | PK, autoincrement |
| `name` | `VARCHAR(255)` | UNIQUE, NOT NULL, indice |
| `description` | `VARCHAR(2000)` | NOT NULL |
| `created_at` | `TIMESTAMP` | DEFAULT now(), indice |
| `updated_at` | `TIMESTAMP` | Auto-update via Prisma |

Schema Prisma: `backend/prisma/schema.prisma`

---

## API REST

Base path: `/api/v1`

| Metodo | Ruta | Descripcion | Codigos |
|--------|------|------------|---------|
| `GET` | `/health` | Health check (status + DB connectivity) | 200, 503 |
| `GET` | `/posts` | Listar todos los posts (orden: createdAt DESC) | 200, 500 |
| `POST` | `/posts` | Crear post | 201, 400, 409, 500 |
| `DELETE` | `/posts/:id` | Eliminar post por ID | 200, 400, 404, 500 |

**Formato de respuesta:**

```json
// Exito
{ "success": true, "data": { ... }, "meta": { "total": 10 } }

// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }
```

**Mapeo de codigos de error:**

| Codigo | HTTP Status |
|--------|------------|
| `VALIDATION_ERROR` | 400 |
| `POST_NOT_FOUND` | 404 |
| `POST_ALREADY_EXISTS` | 409 |
| `INTERNAL_ERROR` | 500 |

Especificacion completa: `ai-specs/specs/api-spec.yml` (OpenAPI 3.1)

---

## Estructura del Proyecto

```
TCIT/
├── backend/
│   ├── src/
│   │   ├── domain/          # Entidades, interfaces de repositorio
│   │   ├── application/     # Servicios (Result<T>), validadores
│   │   ├── presentation/    # Controllers HTTP
│   │   ├── infrastructure/  # Prisma, Pino, repositorios concretos
│   │   ├── routes/          # Definicion de rutas Express
│   │   ├── middleware/      # Error handler, request logger
│   │   └── shared/          # Result<T>, error codes
│   ├── __tests__/
│   │   ├── unit/            # 50 tests unitarios
│   │   └── integration/     # 19 tests de integracion
│   ├── prisma/              # Schema, migraciones, seed
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Redux store, typed hooks
│   │   ├── features/posts/  # Componentes, API (RTK Query), slices, hooks
│   │   ├── shared/          # Layout, ErrorBoundary, Toast, LoadingSpinner
│   │   └── test-utils/      # MSW handlers, renderWithProviders
│   ├── e2e/                 # 4 suites Playwright (18 casos)
│   └── Dockerfile
├── terraform/
│   ├── main.tf              # Modulos: VPC, ECR, ALB, ECS, RDS, CDN
│   ├── modules/             # 6 modulos Terraform
│   └── variables.tf
├── .github/workflows/
│   ├── ci.yml               # Lint + Test + Build + E2E
│   └── cd.yml               # Deploy backend (ECS) + frontend (S3/CloudFront)
├── docker-compose.yml
└── package.json             # Workspaces: backend, frontend
```

---

## Requisitos Previos

- Node.js >= 20
- Docker y Docker Compose
- (Opcional) Terraform >= 1.0 para gestionar infraestructura AWS

---

## Instalacion y Ejecucion

### Con Docker (recomendado)

```bash
# Levantar todo: PostgreSQL + Backend + Frontend
docker compose up

# Backend disponible en http://localhost:3001
# Frontend disponible en http://localhost:5173
# PostgreSQL en localhost:5432
```

### Sin Docker (desarrollo manual)

```bash
# Instalar dependencias
npm install --workspaces

# Backend
cd backend
cp .env.example .env          # Configurar DATABASE_URL
npx prisma migrate dev        # Crear tablas
npx prisma db seed            # Seed con 5 posts de ejemplo
npm run dev                   # http://localhost:3000

# Frontend (otra terminal)
cd frontend
npm run dev                   # http://localhost:5173 (proxy a backend)
```

---

## Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripcion | Default (Docker) |
|----------|------------|-----------------|
| `NODE_ENV` | Entorno de ejecucion | `development` |
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://postgres:postgres@db:5432/tcit_posts?schema=public` |
| `LOG_LEVEL` | Nivel de log Pino | `debug` |
| `CORS_ORIGIN` | Origen permitido CORS | `http://localhost:5173` |

### Frontend

| Variable | Descripcion | Default |
|----------|------------|---------|
| `VITE_PROXY_TARGET` | URL del backend (dev) | `http://backend:3000` |
| `VITE_API_URL` | URL de API (produccion) | Configurado en CD |

---

## Testing

### Comandos

```bash
# Todo el monorepo
npm test --workspaces

# Backend - unit + integration
cd backend && npm test

# Backend - con reporte de cobertura
cd backend && npm run test:coverage

# Backend - un archivo especifico
cd backend && npx jest __tests__/unit/services/postService.test.ts

# Frontend - unit
cd frontend && npm test

# Frontend - watch mode
cd frontend && npm run test:watch

# Frontend - con cobertura
cd frontend && npm run test:coverage

# E2E (requiere backend + frontend corriendo)
cd frontend && npm run test:e2e
```

### Estrategia de Testing

| Tipo | Herramienta | Ubicacion | Cantidad |
|------|------------|-----------|----------|
| Unit (backend) | Jest + ts-jest | `backend/__tests__/unit/` | 50 tests |
| Integration (backend) | Jest + Supertest | `backend/__tests__/integration/` | 19 tests |
| Unit (frontend) | Vitest + RTL | `frontend/src/**/*.test.*` | 59 tests |
| E2E | Playwright (Chromium) | `frontend/e2e/` | 18 tests |

**Patron:** AAA (Arrange/Act/Assert). Mocks centralizados en `test-utils/mocks/` (MSW para frontend, Prisma mock para backend).

---

## CI/CD

### Pipeline CI (`.github/workflows/ci.yml`)

Se ejecuta en push a cualquier branch y PRs a main.

```
┌─────────────┐  ┌──────────────┐  ┌───────────────┐
│ Backend Lint │  │ Frontend Lint│  │               │
└──────┬──────┘  └──────┬───────┘  │               │
       v                v          │               │
┌─────────────┐  ┌──────────────┐  │               │
│ Backend Test│  │ Frontend Test│  │               │
│ (PostgreSQL)│  │ (Vitest)     │  │               │
└──────┬──────┘  └──────┬───────┘  │               │
       v                v          │               │
┌─────────────┐  ┌──────────────┐  │               │
│ Backend     │  │ Frontend     │  │               │
│ Build       │  │ Build        │  │               │
└──────┬──────┘  └──────┬───────┘  │               │
       └────────┬───────┘          │               │
                v                  │               │
        ┌──────────────┐           │               │
        │   E2E Tests  │           │               │
        │ (Playwright) │           │               │
        └──────────────┘           │               │
```

### Pipeline CD (`.github/workflows/cd.yml`)

Se ejecuta en push a main (post-merge).

| Componente | Proceso |
|-----------|---------|
| Backend | Docker build -> Push a ECR -> Update ECS Fargate (force new deployment) |
| Frontend | Vite build -> Sync a S3 -> Invalidar CloudFront |

Autenticacion AWS via OIDC (sin access keys almacenadas).

---

## Infraestructura (Terraform)

Infraestructura en AWS gestionada con Terraform. Estado remoto en S3.

```
                    ┌─────────────────────────┐
                    │       CloudFront        │
                    │    (CDN + S3 origin)    │
                    │     Frontend SPA        │
                    └────────────┬────────────┘
                                 │
                    ┌────────────v────────────┐
Internet ──────>   │          ALB            │
                    │  (Application Load      │
                    │   Balancer, HTTPS opt.) │
                    └────────────┬────────────┘
                                 │
                    ┌────────────v────────────┐
                    │      ECS Fargate        │
                    │   (Backend container)   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────v────────────┐
                    │     RDS PostgreSQL 16   │
                    │   (Private subnet)      │
                    └─────────────────────────┘
```

**Modulos Terraform:**

| Modulo | Recurso AWS | Descripcion |
|--------|------------|-------------|
| `vpc` | VPC, Subnets, NAT | Red con 2 AZs, subnets publicas y privadas |
| `ecr` | Elastic Container Registry | Registro de imagenes Docker |
| `alb` | Application Load Balancer | Balanceador HTTP/HTTPS |
| `ecs` | ECS Fargate | Orquestacion de contenedores serverless |
| `rds` | RDS PostgreSQL | Base de datos gestionada en subnet privada |
| `cdn` | CloudFront + S3 | CDN para frontend estatico |

```bash
# Desplegar infraestructura
cd terraform
cp terraform.tfvars.example terraform.tfvars  # Configurar variables
terraform init
terraform plan
terraform apply
```

---

## Decisiones de Diseno

| Decision | Justificacion |
|----------|--------------|
| **Result\<T\> en servicios** | Evita excepciones para errores de negocio. El flujo de error es explicito y tipado, no se depende de try/catch. |
| **DDD Layered (backend)** | Separacion clara de responsabilidades. El dominio no depende de infraestructura. Los repositorios se inyectan por constructor. |
| **RTK Query (frontend)** | Cache automatico, invalidacion, estados de loading/error integrados. Elimina boilerplate de Redux para llamadas API. |
| **Zod + React Hook Form** | Validacion declarativa con inferencia de tipos TypeScript. Un solo schema define tipos y reglas. |
| **Controllers thin** | Los controllers solo mapean HTTP a servicios y viceversa. Cero logica de negocio en la capa de presentacion. |
| **Feature-based (frontend)** | Cada feature es autocontenida (componentes, API, slices, hooks). Facilita agregar features sin tocar codigo existente. |
| **Terraform modular** | Cada recurso AWS es un modulo independiente. Permite reusar, testear y reemplazar componentes de infra por separado. |
| **OIDC para CI/CD** | Autenticacion sin secretos de larga duracion. El runner de GitHub asume un rol AWS temporal. |
| **Threshold 90% cobertura** | Forzado en CI. Previene merges que degraden la cobertura por debajo del minimo aceptable. |

---

## Comandos Utiles

```bash
# Lint completo
npm run lint --workspaces

# Build completo
npm run build --workspaces

# Prisma Studio (browser de DB)
cd backend && npx prisma studio

# Regenerar Prisma Client
cd backend && npx prisma generate

# Crear migracion
cd backend && npx prisma migrate dev --name <nombre>

# Type-check sin compilar
cd backend && npx tsc --noEmit
```
