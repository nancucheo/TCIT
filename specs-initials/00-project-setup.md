# Spec 00: Project Setup — Monorepo, Backend, Frontend, Docker, Base de Datos

## Objetivo

Inicializar toda la infraestructura base del proyecto: monorepo con workspaces, backend Express + TypeScript, frontend React + Vite, Docker Compose con PostgreSQL, y todos los archivos de configuración. Al finalizar esta spec, `docker compose up` levanta los 3 servicios y el servidor responde (aunque sin rutas aún).

---

## 1. Monorepo Root

### `package.json`

```json
{
  "name": "tcit-posts-manager",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["backend", "frontend"],
  "scripts": {
    "dev": "docker compose up",
    "build": "npm run build --workspaces",
    "test": "npm test --workspaces",
    "lint": "npm run lint --workspaces"
  },
  "engines": { "node": ">=20.0.0" }
}
```

---

## 2. Backend Setup

### Dependencias

**Producción:** express, @prisma/client, pino, pino-pretty, cors, helmet, compression, dotenv
**Desarrollo:** typescript, ts-node-dev, prisma, jest, ts-jest, supertest, @types/\* (express, cors, compression, jest, supertest), eslint, @typescript-eslint/\*

### `backend/tsconfig.json`

- `strict: true`, target ES2022, module commonjs
- Path aliases: `@domain/*`, `@application/*`, `@presentation/*`, `@infrastructure/*`, `@shared/*`, `@routes/*`, `@middleware/*`

### `backend/jest.config.js`

- Preset: ts-jest, environment: node
- moduleNameMapper para path aliases
- Coverage: 90% threshold (branches, functions, lines, statements)

### Estructura de carpetas

```
backend/
├── src/
│   ├── domain/models/
│   ├── domain/repositories/
│   ├── application/services/
│   ├── application/validators/
│   ├── presentation/controllers/
│   ├── infrastructure/repositories/
│   ├── shared/
│   ├── routes/
│   ├── middleware/
│   └── index.ts              ← Bootstrap: express + middleware + listen
├── __tests__/unit/
├── __tests__/integration/
├── test-utils/builders/
├── test-utils/mocks/
├── prisma/schema.prisma
├── .env.example
└── package.json
```

### `backend/src/index.ts` (Bootstrap)

- Carga dotenv
- Crea app Express
- Registra middleware: cors, helmet, compression, express.json(), request logger
- Registra rutas bajo `/api/v1` (vacías por ahora)
- Registra error handler (último)
- Escucha en `PORT` (default 3000)

### `.env.example`

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tcit_posts?schema=public
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
```

---

## 3. Shared Utilities (Base)

### `src/shared/Result.ts`

```typescript
export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly data?: T,
    public readonly error?: { code: string; message: string; details?: any[] }
  ) {}

  static success<T>(data: T): Result<T> {
    return new Result<T>(true, data);
  }

  static failure<T>(code: string, message: string, details?: any[]): Result<T> {
    return new Result<T>(false, undefined, { code, message, details });
  }
}
```

### `src/shared/errorCodes.ts`

```typescript
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  POST_ALREADY_EXISTS: 'POST_ALREADY_EXISTS',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
```

### `src/middleware/errorHandler.ts`

Atrapa errores no manejados → responde 500 con formato estándar.

### `src/middleware/requestLogger.ts`

Logea method, URL, status code, response time con Pino.

### `src/infrastructure/logger.ts`

Pino: JSON en producción, pretty en desarrollo.

### `src/infrastructure/prismaClient.ts`

Singleton de PrismaClient.

---

## 4. Modelo de Datos (Prisma)

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Post {
  id          Int      @id @default(autoincrement())
  name        String   @unique @db.VarChar(255)
  description String   @db.VarChar(2000)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("posts")
  @@index([name])
  @@index([createdAt])
}
```

### Migración inicial

`npx prisma migrate dev --name init` → crea tabla `posts`.

### Seed (`prisma/seed.ts`)

5 posts de ejemplo, usa `upsert` para ser idempotente.

---

## 5. Dominio Base

### `src/domain/models/Post.ts`

```typescript
export interface CreatePostDto {
  name: string;
  description: string;
}

export class Post {
  readonly id?: number;
  readonly name: string;
  readonly description: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(data: {
    name: string;
    description: string;
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
```

### `src/domain/repositories/IPostRepository.ts`

```typescript
export interface IPostRepository {
  findAll(): Promise<Post[]>;
  findById(id: number): Promise<Post | null>;
  findByName(name: string): Promise<Post | null>;
  save(post: Post): Promise<Post>;
  delete(id: number): Promise<Post | null>;
}
```

### `src/infrastructure/repositories/PrismaPostRepository.ts`

Implementación concreta de `IPostRepository` usando Prisma.

---

## 6. Frontend Setup

### Dependencias

**Producción:** react, react-dom, @reduxjs/toolkit, react-redux, react-hook-form, @hookform/resolvers, zod, react-bootstrap, bootstrap
**Desarrollo:** typescript, @types/react, @types/react-dom, vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, @playwright/test, eslint, eslint-plugin-react-hooks, @typescript-eslint/\*

### `frontend/tsconfig.json`

- `strict: true`, jsx: react-jsx, module: ESNext
- Path aliases: `@app/*`, `@features/*`, `@shared/*`

### `frontend/vite.config.ts`

- Plugin react, alias resolution, proxy `/api` → `http://localhost:3000`

### `frontend/vitest.config.ts`

- Environment jsdom, globals true, coverage 90% threshold

### Estructura de carpetas

```
frontend/src/
├── app/store.ts               ← Redux store (vacío por ahora)
├── app/hooks.ts               ← useAppDispatch, useAppSelector
├── features/posts/api/
├── features/posts/components/
├── features/posts/hooks/
├── features/posts/slices/
├── features/posts/types/
├── shared/components/
├── shared/hooks/
├── shared/utils/
├── App.tsx                    ← Layout base
├── main.tsx                   ← Entry point con Provider
├── index.css
└── test-setup.ts
```

### `src/main.tsx`

React.StrictMode + Redux Provider + Bootstrap CSS import.

### `src/App.tsx`

Layout base con título "TCIT Posts Manager" (sin componentes de posts aún).

---

## 7. Docker Compose

### `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tcit_posts
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: { context: ./backend, target: builder }
    command: npm run dev
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/tcit_posts?schema=public
      PORT: 3000
      NODE_ENV: development
    ports: ["3000:3000"]
    volumes: [./backend/src:/app/src, ./backend/prisma:/app/prisma]
    depends_on: { db: { condition: service_healthy } }

  frontend:
    build: { context: ./frontend, target: builder }
    command: npm run dev -- --host 0.0.0.0
    ports: ["5173:5173"]
    volumes: [./frontend/src:/app/src]
    depends_on: [backend]

volumes:
  pgdata:
```

### Dockerfiles

- `backend/Dockerfile`: Multi-stage (builder + production)
- `frontend/Dockerfile`: Multi-stage (builder + nginx production)

---

## Criterios de Aceptación

- [ ] `docker compose up` levanta db, backend y frontend sin errores
- [ ] `npx tsc --noEmit` compila sin errores en backend y frontend
- [ ] Backend responde en `http://localhost:3000` (puede ser 404, pero el servidor está arriba)
- [ ] Frontend muestra "TCIT Posts Manager" en `http://localhost:5173`
- [ ] `npx prisma migrate dev` crea la tabla `posts` correctamente
- [ ] `npx prisma db seed` inserta 5 posts de ejemplo
- [ ] `Result<T>` funciona con `success()` y `failure()`
- [ ] Clase `Post` se instancia correctamente
- [ ] `PrismaPostRepository` implementa `IPostRepository`
- [ ] Path aliases resuelven en ambos proyectos

---

## Archivos a crear

| Archivo | Propósito |
|---------|-----------|
| `package.json` (root) | Monorepo workspaces |
| `docker-compose.yml` | Orquestación local |
| `backend/package.json` | Dependencias backend |
| `backend/tsconfig.json` | TypeScript config |
| `backend/jest.config.js` | Jest config |
| `backend/.env.example` | Variables de entorno |
| `backend/Dockerfile` | Multi-stage build |
| `backend/src/index.ts` | Bootstrap Express |
| `backend/src/shared/Result.ts` | Patrón Result\<T\> |
| `backend/src/shared/errorCodes.ts` | Códigos de error |
| `backend/src/domain/models/Post.ts` | Entidad Post + CreatePostDto |
| `backend/src/domain/repositories/IPostRepository.ts` | Interfaz repositorio |
| `backend/src/infrastructure/prismaClient.ts` | Singleton Prisma |
| `backend/src/infrastructure/logger.ts` | Logger Pino |
| `backend/src/infrastructure/repositories/PrismaPostRepository.ts` | Implementación Prisma |
| `backend/src/middleware/errorHandler.ts` | Error handler global |
| `backend/src/middleware/requestLogger.ts` | Request logger |
| `backend/prisma/schema.prisma` | Modelo de datos |
| `backend/prisma/seed.ts` | Datos de ejemplo |
| `frontend/package.json` | Dependencias frontend |
| `frontend/tsconfig.json` | TypeScript config |
| `frontend/vite.config.ts` | Vite config |
| `frontend/vitest.config.ts` | Vitest config |
| `frontend/Dockerfile` | Multi-stage build |
| `frontend/src/main.tsx` | Entry point |
| `frontend/src/App.tsx` | Layout base |
| `frontend/src/app/store.ts` | Redux store (base) |
| `frontend/src/app/hooks.ts` | Typed hooks |
| `frontend/src/test-setup.ts` | Test setup |
