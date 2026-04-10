# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TCIT Posts Manager — a Post CRUD web application for the TCIT Cloud Solutions developer challenge. Monorepo with npm workspaces: `backend/` and `frontend/`.

## Commands

### Full stack
```bash
docker compose up                    # Start db + backend + frontend
npm run build --workspaces           # Build both projects
npm test --workspaces                # Test both projects
npm run lint --workspaces            # Lint both projects
```

### Backend (`cd backend`)
```bash
npm run dev                          # Dev server (ts-node-dev, hot reload)
npm test                             # Jest
npm run test:coverage                # Jest with 90% coverage threshold
npm run lint                         # ESLint
npx tsc --noEmit                     # Type-check only
npx prisma migrate dev --name <name> # Create migration
npx prisma generate                  # Regenerate Prisma client
npx prisma db seed                   # Seed 5 example posts
npx prisma studio                    # DB browser
# Run a single test file:
npx jest __tests__/unit/services/postService.test.ts
# Run tests matching a pattern:
npx jest --testNamePattern="create"
```

### Frontend (`cd frontend`)
```bash
npm run dev                          # Vite dev server (port 5173)
npm test                             # Vitest (single run)
npm run test:watch                   # Vitest (watch mode)
npm run test:coverage                # Vitest with 90% coverage threshold
npm run test:e2e                     # Playwright
npm run lint                         # ESLint
# Run a single test file:
npx vitest run src/features/posts/components/PostList.test.tsx
```

## Architecture

### Backend: DDD Layered (Express + Prisma + PostgreSQL)

```
Domain (pure TS, no deps)  →  Application (services, validators)  →  Presentation (controllers)  →  Infrastructure (Prisma, Pino)
```

**Data flow:** Route → Controller (thin, maps HTTP) → Service (returns `Result<T>`) → Repository interface → PrismaRepository implementation

**Key patterns:**
- **`Result<T>`** (`src/shared/Result.ts`): Services return `Result.success(data)` or `Result.failure(code, message)` — never throw for business errors.
- **Error code → HTTP status mapping:** `VALIDATION_ERROR` → 400, `POST_NOT_FOUND` → 404, `POST_ALREADY_EXISTS` → 409, `INTERNAL_ERROR` → 500.
- **Domain entity:** `Post` is a class (not interface) with readonly fields. `CreatePostDto` is the input interface.
- **Repository:** `IPostRepository` defined in domain, `PrismaPostRepository` implements it in infrastructure. Constructor-injected `PrismaClient` for testability.
- **Validators** live in `application/validators/`, called by controllers before service invocation.

**Path aliases** (configured in tsconfig + jest.config):
`@domain/*`, `@application/*`, `@presentation/*`, `@infrastructure/*`, `@shared/*`, `@routes/*`, `@middleware/*`

### Frontend: Feature-Based (React 18 + Redux Toolkit + Vite)

- **State:** Redux Toolkit store (`src/app/store.ts`), RTK Query for API calls
- **Forms:** React Hook Form + Zod validation
- **UI:** React Bootstrap
- **Path aliases:** `@app/*`, `@features/*`, `@shared/*` (configured in tsconfig + vite.config)
- **Dev proxy:** Vite proxies `/api` → `http://localhost:3000`

### API Contract

All endpoints under `/api/v1`. Responses follow:
- Success: `{ success: true, data, meta? }`
- Error: `{ success: false, error: { code, message, details? } }`

Endpoints: `GET /posts`, `POST /posts`, `DELETE /posts/:id`, `GET /health`

### Database

PostgreSQL 16 via Prisma. Single `Post` model: `id` (PK auto-increment), `name` (unique, varchar 255), `description` (varchar 2000), `created_at`, `updated_at`. Schema at `backend/prisma/schema.prisma`.

## Conventions

- **Language:** ALL code, comments, commits, and docs in English
- **TypeScript strict mode** in both projects
- **Testing:** TDD approach, 90% coverage threshold, AAA pattern (Arrange/Act/Assert)
- **Backend tests:** `__tests__/unit/` (mock Prisma), `__tests__/integration/` (supertest + real DB)
- **Frontend tests:** Vitest + React Testing Library; E2E with Playwright in `e2e/`
- **Test utilities:** Builders in `test-utils/builders/`, mocks in `test-utils/mocks/`
- **Naming:** Components PascalCase, files PascalCase for components / camelCase for utilities, DB columns snake_case, JSON API camelCase

## Key References

- OpenAPI spec: `ai-specs/specs/api-spec.yml`
- Backend standards: `ai-specs/specs/backend-standards.md`
- Frontend standards: `ai-specs/specs/frontend-standards.md`
- Data model: `ai-specs/specs/data-model.md`
