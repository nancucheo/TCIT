# TCIT Posts Manager — Specs por Funcionalidad

## Orden de ejecución

Cada spec es un **vertical slice** completo: modelo, backend, frontend y tests de esa funcionalidad.
Se ejecutan secuencialmente — cada una depende de la anterior.

```
00 → 01 → 02 → 03 → 04 → 05 → 06
```

| # | Spec | Qué incluye | Depende de |
|---|------|-------------|------------|
| 00 | [Project Setup](./00-project-setup.md) | Monorepo, Docker Compose, PostgreSQL, Prisma schema, Express bootstrap, React + Vite, Redux store base, clase Post, IPostRepository, PrismaPostRepository, Result\<T\>, error codes, logger, middleware | — |
| 01 | [Health Check](./01-health-check.md) | `GET /api/v1/health`, controller, ruta, tests unit + integration | 00 |
| 02 | [Listar Posts](./02-listar-posts.md) | `GET /api/v1/posts`, PostService.getAll, PostController, RTK Query getPosts, PostList, Layout, ErrorBoundary, tests unit + integration + E2E | 01 |
| 03 | [Crear Post](./03-crear-post.md) | `POST /api/v1/posts`, validateCreatePost, PostService.create, PostController, RTK Query createPost, PostForm (RHF + Zod), Toast, tests unit + integration + E2E | 02 |
| 04 | [Eliminar Post](./04-eliminar-post.md) | `DELETE /api/v1/posts/:id`, validatePostId, PostService.delete, PostController, RTK Query deletePost, PostItem, tests unit + integration + E2E | 03 |
| 05 | [Filtrar Posts](./05-filtrar-posts.md) | PostFilter, usePostFilter hook, postsSlice (filterText), layout final, tests unit + E2E. Sin cambios en backend. | 04 |
| 06 | [Infraestructura + CI/CD](./06-infraestructura-cicd.md) | Terraform AWS (VPC, ECS, RDS, ALB, CloudFront, ECR), GitHub Actions CI + CD, Dockerfiles producción, nginx, branch protection | 05 |

## Resultado final

Al completar las 7 specs en orden, se tiene:

- CRUD completo de Posts (crear, listar, eliminar) + filtro client-side
- Backend DDD con Result\<T\>, validadores, tests al 90%
- Frontend React + Redux Toolkit + RTK Query, tests al 90%
- Docker Compose para desarrollo local
- Terraform para deploy en AWS
- CI/CD con GitHub Actions
