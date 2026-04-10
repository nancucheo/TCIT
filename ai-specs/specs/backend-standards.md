---
description: Backend development standards for TCIT Posts Manager — Express.js, TypeScript, Prisma, PostgreSQL, DDD Layered Architecture, Result<T> pattern, testing
globs: ["backend/src/**/*.ts", "backend/prisma/**/*.{prisma,ts}", "backend/jest.config.js", "backend/tsconfig.json", "backend/package.json"]
alwaysApply: true
---

# Backend Standards — TCIT Posts Manager

## Table of Contents

- [Technology Stack](#technology-stack)
- [Architecture: DDD Layered](#architecture-ddd-layered)
- [Project Structure](#project-structure)
- [Domain-Driven Design Principles](#domain-driven-design-principles)
- [Result<T> Pattern](#resultt-pattern)
- [Controller Pattern](#controller-pattern)
- [Validation Pattern](#validation-pattern)
- [Error Handling](#error-handling)
- [Logging Standards](#logging-standards)
- [Database Patterns (Prisma)](#database-patterns-prisma)
- [API Design Standards](#api-design-standards)
- [Testing Standards](#testing-standards)
- [Security Best Practices](#security-best-practices)
- [Performance Best Practices](#performance-best-practices)
- [Development Workflow](#development-workflow)

---

## Technology Stack

| Component    | Technology           |
|-------------|---------------------|
| Runtime     | Node.js 20          |
| Language    | TypeScript (strict)  |
| Framework   | Express.js           |
| ORM         | Prisma               |
| Database    | PostgreSQL 16        |
| Logging     | Pino (structured JSON) |
| Testing     | Jest (90% coverage)  |
| Validation  | Centralized validator|

## Architecture: DDD Layered

```
Presentation (controllers) → Application (services) → Domain (models) → Infrastructure (prisma)
```

### Layer Rules

- **Domain**: Entities with identity, business methods (`save()`, `findById()`, `findAll()`, `delete()`). Repository interfaces. ZERO framework dependencies.
- **Application**: Services that orchestrate business logic. Return `Result<T>`, never throw. Use validators for input validation.
- **Presentation**: Express controllers — THIN. Validate route params, call service, map Result to HTTP status.
- **Infrastructure**: Prisma client, Pino logger, concrete repository implementations.

## Project Structure

```
backend/
├── src/
│   ├── domain/
│   │   ├── models/Post.ts              # Entity with persistence methods
│   │   └── repositories/IPostRepository.ts
│   ├── application/
│   │   ├── services/postService.ts     # Business logic → Result<T>
│   │   └── validators/postValidator.ts
│   ├── presentation/
│   │   └── controllers/
│   │       ├── postController.ts
│   │       └── healthController.ts
│   ├── infrastructure/
│   │   ├── prismaClient.ts
│   │   ├── logger.ts                   # Pino
│   │   └── repositories/PrismaPostRepository.ts
│   ├── shared/
│   │   ├── Result.ts                   # Result<T> class
│   │   └── errorCodes.ts
│   ├── routes/
│   ├── middleware/
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── __tests__/
│   ├── unit/
│   └── integration/
├── test-utils/
│   ├── builders/
│   └── mocks/
├── jest.config.js
├── tsconfig.json
└── package.json
```

## Domain-Driven Design Principles

### Entities

Entities are objects with a distinct identity that persists over time. They encapsulate business logic related to their domain concept:

```typescript
export class Post {
  id?: number;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: { name: string; description: string; id?: number; createdAt?: Date; updatedAt?: Date }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
```

**Rules:**
- Entities encapsulate business logic and maintain invariants
- Constructors validate required fields
- Static factory methods for retrieval (e.g., `findById()`)
- `save()` methods encapsulate persistence logic

### Repository Interfaces

Defined in the domain layer, implemented in infrastructure:

```typescript
// domain/repositories/IPostRepository.ts
export interface IPostRepository {
  findById(id: number): Promise<Post | null>;
  findAll(): Promise<Post[]>;
  save(post: Post): Promise<Post>;
  delete(id: number): Promise<Post | null>;
  findByName(name: string): Promise<Post | null>;
}
```

### Repository Implementations

Infrastructure layer satisfies domain interfaces using Prisma:

```typescript
// infrastructure/repositories/PrismaPostRepository.ts
export class PrismaPostRepository implements IPostRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<Post | null> {
    const data = await this.prisma.post.findUnique({ where: { id } });
    return data ? new Post(data) : null;
  }

  async save(post: Post): Promise<Post> {
    const data = await this.prisma.post.create({
      data: { name: post.name, description: post.description }
    });
    return new Post(data);
  }
}
```

## Result<T> Pattern

Services NEVER throw exceptions for business errors. They return Result<T>:

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

### Service Example

```typescript
export class PostService {
  constructor(private postRepository: IPostRepository) {}

  async create(data: { name: string; description: string }): Promise<Result<Post>> {
    const existing = await this.postRepository.findByName(data.name);
    if (existing) {
      return Result.failure('CONFLICT', `A post with name '${data.name}' already exists`);
    }

    const post = new Post(data);
    const saved = await this.postRepository.save(post);
    return Result.success(saved);
  }
}
```

## Controller Pattern

Controllers are thin — delegate to service, map Result to HTTP:

```typescript
export const createPost = async (req: Request, res: Response): Promise<void> => {
  const validation = validateCreatePost(req.body);
  if (!validation.isValid) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: validation.errors }
    });
    return;
  }

  const result = await postService.create(req.body);

  if (!result.isSuccess) {
    const statusMap: Record<string, number> = {
      VALIDATION_ERROR: 400, NOT_FOUND: 404, CONFLICT: 409, INTERNAL_ERROR: 500
    };
    res.status(statusMap[result.error!.code] || 500).json({ success: false, error: result.error });
    return;
  }

  res.status(201).json({ success: true, data: result.data });
};
```

**Rules:**
- Controllers are THIN — delegate to services, never contain business logic
- Validate input at controller level before calling service
- Translate `Result<T>` error codes to HTTP status codes
- All responses follow `{ success, data }` or `{ success, error }` format

## Validation Pattern

Centralized validators in `application/validators/`:

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string; constraint: string }>;
}

export function validateCreatePost(data: unknown): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: [{ field: 'body', message: 'Request body is required', constraint: 'isNotEmpty' }] };
  }

  const { name, description } = data as any;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name cannot be empty', constraint: 'isNotEmpty' });
  } else if (name.length > 255) {
    errors.push({ field: 'name', message: 'Name cannot exceed 255 characters', constraint: 'maxLength' });
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Description cannot be empty', constraint: 'isNotEmpty' });
  } else if (description.length > 2000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 2000 characters', constraint: 'maxLength' });
  }

  return { isValid: errors.length === 0, errors };
}
```

## Error Handling

- Services: `Result.failure(code, message)` — never throw for business errors
- Middleware `errorHandler.ts`: catches unhandled exceptions → generic 500, never expose internals
- Error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`
- All error responses: `{ success: false, error: { code, message, details? } }`

### Error Code to HTTP Status Mapping

```typescript
const ERROR_STATUS_MAP: Record<string, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};
```

## Logging Standards

- **Use Pino**: Structured JSON logging from `infrastructure/logger.ts`
- **Log Levels**: Use appropriate levels (info, error, warn, debug)
- **Structured Context**: Include relevant data in log entries
- **Never log sensitive data**: No passwords, tokens, or PII in logs

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});

// Usage
logger.info({ postId: post.id }, 'Post created successfully');
logger.error({ error: error.message, postId: id }, 'Failed to delete post');
```

## Database Patterns (Prisma)

### Schema Conventions

- Model names: PascalCase (`Post`)
- Table names: snake_case via `@@map("posts")`
- Column names: snake_case via `@map("created_at")`
- Fields in TypeScript: camelCase (`createdAt`)
- JSON API: camelCase (automatic via Prisma)

### Migrations

- Version-controlled through Prisma migrations
- Use descriptive migration names: `npx prisma migrate dev --name add_post_table`
- Review migration SQL before applying
- Deploy with: `npx prisma migrate deploy`

### Prisma Client

- Singleton instance in `infrastructure/prismaClient.ts`
- Inject via constructor for testability
- Use `include` for eager loading relations (avoid N+1)
- Use `select` for partial loading when appropriate

## API Design Standards

### REST Endpoints

```
GET    /api/v1/posts          # List all posts
POST   /api/v1/posts          # Create new post
DELETE /api/v1/posts/:id       # Delete post by ID
GET    /api/v1/health          # Service health check
```

### Response Format

```typescript
// Success (single)
{ "success": true, "data": { ... } }

// Success (list)
{ "success": true, "data": [ ... ], "meta": { "total": 5 } }

// Error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Post with id 999 not found" } }
```

### CORS Configuration

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## Testing Standards

### Framework and Coverage

- **Framework**: Jest with ts-jest
- **Coverage target**: 90% branches, functions, lines, statements
- **TDD**: Write failing test first, then implement

### Test Organization

```
__tests__/
├── unit/
│   ├── services/postService.test.ts
│   └── validators/postValidator.test.ts
└── integration/
    └── controllers/postController.test.ts
test-utils/
├── builders/postBuilder.ts
└── mocks/prismaClient.mock.ts
```

### Test Pattern (AAA)

```typescript
describe('PostService - create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create post successfully when valid data provided', async () => {
    // Arrange
    const input = { name: 'Test Post', description: 'A test description' };
    mockPostRepository.findByName.mockResolvedValue(null);
    mockPostRepository.save.mockResolvedValue(new Post({ ...input, id: 1 }));

    // Act
    const result = await postService.create(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.data?.name).toBe('Test Post');
    expect(mockPostRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should return failure when post name already exists', async () => {
    // Arrange
    const input = { name: 'Existing Post', description: 'Description' };
    mockPostRepository.findByName.mockResolvedValue(new Post({ ...input, id: 1 }));

    // Act
    const result = await postService.create(input);

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.error?.code).toBe('CONFLICT');
  });
});
```

### Mocking Standards

- Mock Prisma client for unit tests
- Mock service layer for controller tests
- Use `jest.mock()` at module level
- Clear mocks in `beforeEach()` for test isolation
- Use `test-utils/builders/` for test data factories

### Test Categories

1. **Happy Path**: Valid inputs producing expected outputs
2. **Error Handling**: Invalid inputs, missing data, database errors
3. **Edge Cases**: Boundary values, null/undefined, empty data
4. **Validation**: Input validation and business rules
5. **Integration**: Complete request flows with supertest

## Security Best Practices

- **Validate All Inputs**: Validator layer before business logic
- **Never Commit Secrets**: Use `.env` files excluded from git
- **Validate Environment**: Check required env vars at startup
- **Sanitize Errors**: Never expose internal details to clients
- **Use Helmet**: HTTP security headers

```typescript
const requiredEnvVars = ['DATABASE_URL', 'PORT'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

## Performance Best Practices

- **Select Specific Fields**: Only select needed fields with Prisma `select`
- **Use Database Indexes**: Ensure indexes on frequently queried fields
- **Async/Await**: Always use async/await, never callback patterns
- **Early Returns**: Return early to avoid unnecessary processing
- **Parallel Operations**: Use `Promise.all()` when appropriate

## Development Workflow

1. Create feature branch: `git checkout -b feature/<name>`
2. Write failing tests (TDD)
3. Implement following DDD layers (Domain → Application → Presentation)
4. Ensure 90% coverage: `npm run test:coverage`
5. Lint: `npm run lint`
6. Build: `npm run build`
7. Commit descriptively in English
8. Push and create PR to `main`

### Development Scripts

```bash
npm run dev           # Development server with hot reload
npm run build         # Build for production
npm test              # Run tests
npm run test:coverage # Run tests with coverage
npm run lint          # ESLint check
npx prisma migrate dev    # Create and apply migration
npx prisma db seed        # Seed database
npx prisma studio         # Open Prisma Studio
```
