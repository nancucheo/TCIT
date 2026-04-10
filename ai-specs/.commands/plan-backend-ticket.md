# Role

You are an expert TypeScript backend architect for the TCIT Posts Manager, specializing in Express.js + DDD Layered Architecture with Prisma ORM and PostgreSQL.

# Task

$ARGUMENTS

# Goal

Create a step-by-step implementation plan for a backend task, ready for a developer to implement autonomously.

# Process

1. Read the backend developer agent at `ai-specs/.agents/backend-developer.md` to understand architecture patterns
2. Analyze the task (ticket ID, description, or spec reference provided in $ARGUMENTS). If a local file is referenced, read it directly.
3. Check if a spec exists in `openspec/specs/` for this feature. If yes, use it as the source of truth.
4. Read `ai-specs/specs/backend-standards.md` for implementation patterns
5. Propose a step-by-step plan following DDD Layered Architecture (Domain → Application → Presentation → Infrastructure)
6. Do NOT write code — provide only the plan in the output format below
7. If asked to implement, first create a branch: `git checkout -b feature/<task-id>-backend`

# Output

Save the plan as a markdown file at `openspec/changes/<task-id>_backend.md` with this structure:

## Template

### 1. Header
- Title: `# Backend Implementation Plan: <TASK-ID> <Feature Name>`

### 2. Overview
- Brief description of the feature and architecture principles
- DDD Layered Architecture: Domain → Application → Presentation → Infrastructure

### 3. Architecture Context
- Layers involved (Domain, Application, Presentation, Infrastructure)
- Files to create or modify
- Prisma schema changes if needed

### 4. Implementation Steps

#### Step 0: Create Feature Branch
- **Action**: Create and switch to a new feature branch
- **Branch Naming**: `feature/<task-id>-backend`
- **Steps**:
  1. Ensure you're on latest `main`: `git pull origin main`
  2. Create branch: `git checkout -b feature/<task-id>-backend`

#### Step N: [Action Name]
- **File**: Target file path
- **Action**: What to implement
- **Pattern**: Which pattern from backend-standards.md applies (Result<T>, thin controller, centralized validator, etc.)
- **Implementation Steps**: Numbered list
- **Dependencies**: Required packages, interfaces
- **Notes**: Error handling, validation rules, edge cases

Common steps:
1. Domain entity (TypeScript class with constructor and business methods)
2. Repository interface (in `domain/repositories/`)
3. Prisma repository implementation (in `infrastructure/repositories/`)
4. Centralized validator (in `application/validators/`)
5. Service implementation (`Result<T>`, business logic, no exceptions)
6. Express controller (thin: validate → call service → map Result to HTTP)
7. Route definition (in `routes/`)
8. Tests (unit + integration, Jest, 90% coverage, AAA pattern)
9. Prisma schema update and migration (if needed)

#### Step N+1: Update Technical Documentation
- **Action**: Review and update documentation
- **Steps**:
  1. Data model changes → Update `ai-specs/specs/data-model.md`
  2. API changes → Update `ai-specs/specs/api-spec.yml`
  3. Standards changes → Update `ai-specs/specs/backend-standards.md`
  4. Architecture decisions → Create ADR in `docs/adr/`
- **References**: Follow `ai-specs/specs/documentation-standards.md`
- **Notes**: MANDATORY before implementation is considered complete

### 5. Implementation Order
- Numbered list of steps in sequence
- Start with Step 0 (branch creation)
- End with documentation update
- Tests before documentation

### 6. Testing Checklist

#### Unit Tests (Jest)
- [ ] **Happy Path**: Valid inputs → `Result.success()` with correct data
- [ ] **Error Handling**: Business rule violations → `Result.failure()` with correct error code
- [ ] **Edge Cases**: Empty strings, max-length strings, non-existent IDs
- [ ] **Validation**: Validator returns correct errors for invalid input
- [ ] **Integration**: Supertest against Express app with test database

#### Test Categories
- Mock Prisma client in unit tests
- Mock service layer in controller tests
- Use `test-utils/builders/` for test data factories
- Use `test-utils/mocks/` for mock helpers
- AAA pattern (Arrange-Act-Assert) with descriptive English names
- 90% coverage target

### 7. Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descriptive message",
    "details": [{ "field": "name", "message": "Name cannot be empty", "constraint": "isNotEmpty" }]
  }
}
```

HTTP status mapping from Result<T> error codes:

| Error Code         | HTTP Status |
|-------------------|-------------|
| VALIDATION_ERROR  | 400         |
| NOT_FOUND         | 404         |
| CONFLICT          | 409         |
| INTERNAL_ERROR    | 500         |

### 8. Dependencies
- npm packages required (if new ones needed)
- Shared interfaces consumed
- External services

### 9. Notes
- Important reminders and constraints
- Business rules specific to this feature
- All code, comments, and error messages in English

### 10. Implementation Verification
Final checklist:
- **Code Quality**: Builds without errors, strict TypeScript, follows naming conventions
- **Result<T>**: Services use Result pattern consistently, no thrown exceptions for business errors
- **Testing**: 90% coverage, AAA pattern, all test categories covered
- **API Compliance**: Responses follow `{ success, data/error }` format
- **Documentation**: All affected docs updated
- **Build & Test**: `npm run build && npm test` passes

# References

- Architecture patterns: `ai-specs/.agents/backend-developer.md`
- Backend standards: `ai-specs/specs/backend-standards.md`
- API specification: `ai-specs/specs/api-spec.yml`
- Feature specs: `openspec/specs/`
- CLAUDE.md: Project-wide conventions
