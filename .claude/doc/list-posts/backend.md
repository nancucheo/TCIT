# Backend Implementation Plan: List Posts Feature

## Overview

This plan covers the full implementation of the `GET /api/v1/posts` endpoint following the
DDD Layered Architecture already established by the health check feature.

**Endpoint:** `GET /api/v1/posts`
**Response:** `{ success: true, data: Post[], meta: { total: number } }`
**Error:** `{ success: false, error: { code: "INTERNAL_ERROR", message: string } }` → HTTP 500

---

## Files to Create

### 1. `backend/src/application/services/postService.ts`

**Purpose:** Application service that orchestrates the "get all posts" use case. Delegates to
`IPostRepository`, wraps the result in `Result<T>`, and logs errors.

**Content:**

```typescript
import { IPostRepository } from '@domain/repositories/IPostRepository';
import { Post } from '@domain/models/Post';
import { Result } from '@shared/Result';
import logger from '@infrastructure/logger';

export class PostService {
  constructor(private readonly postRepository: IPostRepository) {}

  async getAll(): Promise<Result<Post[]>> {
    try {
      const posts = await this.postRepository.findAll();
      return Result.success(posts);
    } catch (error) {
      logger.error({ error }, 'Failed to retrieve posts');
      return Result.failure('INTERNAL_ERROR', 'Failed to retrieve posts');
    }
  }
}
```

**Key notes:**
- Constructor receives `IPostRepository` (domain interface), not a concrete implementation —
  enables dependency injection and testability.
- No Prisma import here. This is Application layer; Prisma lives in Infrastructure.
- `Result.failure` uses error code `INTERNAL_ERROR` (maps to HTTP 500 in the controller).
- Logger call includes the raw `error` object under the `error` key — do not log `error.message`
  alone; structured logging captures the full object.

---

### 2. `backend/src/presentation/controllers/postController.ts`

**Purpose:** Thin Express controller. Wires infrastructure (PrismaPostRepository + prisma client)
to the service, calls `postService.getAll()`, and maps the `Result<T>` to an HTTP response.

**Content:**

```typescript
import { Request, Response } from 'express';
import { PostService } from '@application/services/postService';
import { PrismaPostRepository } from '@infrastructure/repositories/PrismaPostRepository';
import prisma from '@infrastructure/prismaClient';

const postRepository = new PrismaPostRepository(prisma);
const postService = new PostService(postRepository);

export class PostController {
  async getAll(_req: Request, res: Response): Promise<void> {
    const result = await postService.getAll();

    if (!result.isSuccess) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.data,
      meta: { total: result.data!.length },
    });
  }
}
```

**Key notes:**
- Repository and service are instantiated at module scope (module-level singletons), mirroring
  the `HealthController` pattern in the codebase.
- The controller does NOT contain business logic — only: receive request → call service →
  map result → send response.
- `result.data!` is safe here because we only reach that line when `result.isSuccess === true`,
  which by `Result<T>` contract guarantees `data` is defined.
- No try/catch in the controller. If an unexpected error escapes, the global `errorHandler`
  middleware in `src/middleware/errorHandler.ts` catches it.
- `_req` prefix signals the parameter is intentionally unused (TypeScript strict mode).

---

### 3. `backend/src/routes/postRoutes.ts`

**Purpose:** Express router for the `/posts` resource. Follows the exact structure of
`healthRoutes.ts`.

**Content:**

```typescript
import { Router } from 'express';
import { PostController } from '@presentation/controllers/postController';

const router = Router();
const postController = new PostController();

router.get('/', (req, res) => postController.getAll(req, res));

export default router;
```

**Key notes:**
- The arrow function wrapper `(req, res) => postController.getAll(req, res)` preserves `this`
  context, matching the established health routes pattern.

---

### 4. `backend/src/routes/index.ts` (MODIFY)

**Purpose:** Mount the new post routes alongside the existing health routes.

**Current content (lines 1–11):**
```typescript
import { Router } from 'express';
import healthRoutes from '@routes/healthRoutes';

const router = Router();

router.use('/health', healthRoutes);

// Post routes will be mounted here once the PostController is implemented
// Example: router.use('/posts', postRoutes);

export default router;
```

**Replace with:**
```typescript
import { Router } from 'express';
import healthRoutes from '@routes/healthRoutes';
import postRoutes from '@routes/postRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/posts', postRoutes);

export default router;
```

**Changes:** Remove the two comment lines; add `import postRoutes` and `router.use('/posts', postRoutes)`.

---

### 5. `backend/test-utils/builders/postBuilder.ts`

**Purpose:** Test data builder (fluent API) for creating `Post` domain instances in tests.
Centralizes test data creation so changes to the `Post` constructor propagate from one place.

**Content:**

```typescript
import { Post } from '@domain/models/Post';

export class PostBuilder {
  private data = {
    id: 1,
    name: 'Test Post',
    description: 'A test description',
    createdAt: new Date('2026-04-10T10:00:00.000Z'),
    updatedAt: new Date('2026-04-10T10:00:00.000Z'),
  };

  withId(id: number): this {
    this.data.id = id;
    return this;
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  withCreatedAt(date: Date): this {
    this.data.createdAt = date;
    return this;
  }

  withUpdatedAt(date: Date): this {
    this.data.updatedAt = date;
    return this;
  }

  build(): Post {
    return new Post({ ...this.data });
  }
}
```

**Key notes:**
- Defaults are valid, complete objects — every `build()` call without customization produces a
  usable `Post`.
- Uses path alias `@domain/models/Post` for consistency with source files. The jest
  `moduleNameMapper` in `jest.config.js` already maps `@domain/*` so this works in tests.
- Place this file in `backend/test-utils/builders/` (directory already exists).

---

### 6. `backend/test-utils/mocks/prismaClient.mock.ts`

**Purpose:** Centralised mock for the Prisma client used in unit tests that need to mock
`@infrastructure/prismaClient`.

**Content:**

```typescript
export const mockPrismaClient = {
  post: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  $queryRaw: jest.fn(),
};
```

**Key notes:**
- This file is imported into unit tests that call `jest.mock('@infrastructure/prismaClient', ...)`
  and need to assert on specific Prisma calls.
- Includes `$queryRaw` so the health controller tests can also use this mock if refactored later.
- Place in `backend/test-utils/mocks/` (directory already exists).

---

### 7. `backend/__tests__/unit/services/postService.test.ts`

**Purpose:** Unit tests for `PostService.getAll()`. Repository is mocked via a plain object
satisfying `IPostRepository`. Logger is silenced.

**Content:**

```typescript
import { PostService } from '@application/services/postService';
import { IPostRepository } from '@domain/repositories/IPostRepository';
import { PostBuilder } from '../../../test-utils/builders/postBuilder';

// Silence logger output during tests
jest.mock('@infrastructure/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('PostService', () => {
  let postService: PostService;
  let mockRepository: jest.Mocked<IPostRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    postService = new PostService(mockRepository);
  });

  describe('getAll()', () => {
    describe('U-1: Returns posts successfully', () => {
      it('should return Result.success with a list of posts when repository resolves', async () => {
        // Arrange
        const posts = [
          new PostBuilder().withId(1).withName('Post One').build(),
          new PostBuilder().withId(2).withName('Post Two').build(),
          new PostBuilder().withId(3).withName('Post Three').build(),
        ];
        mockRepository.findAll.mockResolvedValueOnce(posts);

        // Act
        const result = await postService.getAll();

        // Assert
        expect(result.isSuccess).toBe(true);
        expect(result.data).toHaveLength(3);
        expect(result.data).toEqual(posts);
      });
    });

    describe('U-2: Returns empty array', () => {
      it('should return Result.success with an empty array when no posts exist', async () => {
        // Arrange
        mockRepository.findAll.mockResolvedValueOnce([]);

        // Act
        const result = await postService.getAll();

        // Assert
        expect(result.isSuccess).toBe(true);
        expect(result.data).toEqual([]);
      });
    });

    describe('U-3: Repository throws an Error instance', () => {
      it('should return Result.failure with INTERNAL_ERROR when repository rejects with Error', async () => {
        // Arrange
        mockRepository.findAll.mockRejectedValueOnce(new Error('DB connection lost'));

        // Act
        const result = await postService.getAll();

        // Assert
        expect(result.isSuccess).toBe(false);
        expect(result.error?.code).toBe('INTERNAL_ERROR');
        expect(result.error?.message).toBe('Failed to retrieve posts');
      });
    });

    describe('U-4: Repository throws a non-Error value', () => {
      it('should return Result.failure with INTERNAL_ERROR when repository rejects with a string', async () => {
        // Arrange
        mockRepository.findAll.mockRejectedValueOnce('unexpected string rejection');

        // Act
        const result = await postService.getAll();

        // Assert
        expect(result.isSuccess).toBe(false);
        expect(result.error?.code).toBe('INTERNAL_ERROR');
        expect(result.error?.message).toBe('Failed to retrieve posts');
      });
    });
  });
});
```

**Key notes:**
- `PostBuilder` is imported via a relative path (`../../../test-utils/builders/postBuilder`)
  because `test-utils/` is not under `src/` and has no path alias in `moduleNameMapper`.
- The logger mock uses `__esModule: true` and `default:` because `logger.ts` uses
  `export default logger`.
- `jest.Mocked<IPostRepository>` gives full type-safe mock with `jest.fn()` typed methods.
- Tests cover: happy path with data, happy path empty, Error rejection, non-Error rejection.
  These four cases achieve branch and statement coverage for the `try/catch` in `getAll()`.

---

### 8. `backend/__tests__/integration/posts.test.ts`

**Purpose:** Integration tests hitting the real Express app via supertest. Uses the actual
Prisma client to seed and truncate data. Validates the full HTTP request-response cycle.

**Content:**

```typescript
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/infrastructure/prismaClient';

describe('GET /api/v1/posts', () => {
  beforeEach(async () => {
    // Clean state before each test
    await prisma.post.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('I-1: Returns 200 with seeded posts', () => {
    it('should return HTTP 200 with data array and meta.total matching seeded count', async () => {
      // Arrange
      await prisma.post.createMany({
        data: [
          { name: 'Post Alpha', description: 'Description Alpha' },
          { name: 'Post Beta', description: 'Description Beta' },
        ],
      });

      // Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
    });
  });

  describe('I-2: Returns 200 with empty data when no posts exist', () => {
    it('should return success true with an empty data array and meta.total of 0', async () => {
      // Arrange — table already empty from beforeEach

      // Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });
  });

  describe('I-3: Posts are returned in descending createdAt order', () => {
    it('should return the most recently created post first', async () => {
      // Arrange — create posts with explicit timestamps via raw Prisma
      const older = await prisma.post.create({
        data: {
          name: 'Older Post',
          description: 'Created first',
          createdAt: new Date('2026-04-10T08:00:00.000Z'),
        },
      });
      const newer = await prisma.post.create({
        data: {
          name: 'Newer Post',
          description: 'Created second',
          createdAt: new Date('2026-04-10T12:00:00.000Z'),
        },
      });

      // Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBe(newer.id);
      expect(response.body.data[1].id).toBe(older.id);
    });
  });

  describe('I-4: Response has correct schema', () => {
    it('should return a response with success boolean, data array, and meta.total number', async () => {
      // Arrange & Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      expect(typeof response.body.success).toBe('boolean');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.meta.total).toBe('number');
    });
  });

  describe('I-5: Each post has all required fields', () => {
    it('should include id, name, description, createdAt, and updatedAt on every post', async () => {
      // Arrange
      await prisma.post.create({
        data: { name: 'Field Check Post', description: 'Checking fields' },
      });

      // Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      const post = response.body.data[0];
      expect(post).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        description: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
});
```

**Key notes:**
- Imports use relative paths (`../../src/app`, `../../src/infrastructure/prismaClient`) because
  `test-utils/` and `__tests__/` are outside `src/` and the aliases only map `src/` directories.
  However, the jest `moduleNameMapper` maps `@infrastructure/*` → `src/infrastructure/*`, so
  using `@infrastructure/prismaClient` would also work; relative paths are equally valid here.
- `beforeEach` calls `prisma.post.deleteMany()` to guarantee test isolation.
- `afterAll` disconnects Prisma to avoid open handle warnings from Jest.
- Test I-3 seeds with explicit `createdAt` values. Note: if the Prisma schema marks `createdAt`
  with `@default(now())` and blocks manual override, use two sequential creates with a small
  delay, or verify that the Prisma schema allows the `createdAt` field in `create` input.
  Check `backend/prisma/schema.prisma` — if `createdAt` has `@updatedAt` or is auto-only,
  adjust the seeding strategy to use `prisma.$executeRaw` with an explicit SQL INSERT.
- Content-type assertion is optional but recommended: `expect(response.headers['content-type']).toMatch(/application\/json/)`.

---

## Implementation Order

Execute in this order to keep tests green at each step:

1. `test-utils/builders/postBuilder.ts` — no dependencies, safe to create first
2. `test-utils/mocks/prismaClient.mock.ts` — no dependencies
3. `src/application/services/postService.ts` — depends on domain interfaces (already exist)
4. `__tests__/unit/services/postService.test.ts` — write test, run it (expect failure), implement service, run again (expect pass)
5. `src/presentation/controllers/postController.ts` — depends on service
6. `src/routes/postRoutes.ts` — depends on controller
7. `src/routes/index.ts` (modify) — mount postRoutes
8. `__tests__/integration/posts.test.ts` — write last; requires full stack to be wired

---

## Acceptance Criteria

| # | Check | Expected |
|---|-------|----------|
| 1 | `GET /api/v1/posts` with 2 seeded posts | HTTP 200, `data.length === 2`, `meta.total === 2` |
| 2 | `GET /api/v1/posts` with no posts | HTTP 200, `data === []`, `meta.total === 0` |
| 3 | Posts order | Descending by `createdAt` |
| 4 | Response shape | `{ success: true, data: Post[], meta: { total: number } }` |
| 5 | Each post fields | `id`, `name`, `description`, `createdAt`, `updatedAt` all present |
| 6 | Unit test coverage | `PostService.getAll()` — 4 cases cover all branches |
| 7 | Repository throws | Returns `Result.failure('INTERNAL_ERROR', ...)`, HTTP 500 |
| 8 | TypeScript strict | No `any`, no implicit `any`, no type errors via `npx tsc --noEmit` |

---

## Files NOT to Modify

- `backend/src/infrastructure/repositories/PrismaPostRepository.ts` — already has `findAll()` with `orderBy: { createdAt: 'desc' }`. Do not touch.
- `backend/src/domain/models/Post.ts` — entity is complete.
- `backend/src/domain/repositories/IPostRepository.ts` — interface is complete.
- `backend/src/shared/Result.ts` — Result pattern is complete.
- `backend/src/app.ts` — no changes needed; it already mounts `/api/v1` routes via `routes/index.ts`.
