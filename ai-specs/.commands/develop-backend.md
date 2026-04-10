Implement the backend task: $ARGUMENTS

Follow these steps:

1. **Understand the task** described in the argument (task ID, description, or spec reference)
2. **Check for an existing spec** in `openspec/specs/` — if one exists, read it. If not, create one first using the spec-driven process.
3. **Read the backend developer agent** at `ai-specs/.agents/backend-developer.md` for architecture patterns and conventions
4. **Read backend standards** at `ai-specs/specs/backend-standards.md`
5. **Create a feature branch**: `git checkout -b feature/$ARGUMENTS-backend`
6. **Implement** following DDD Layered Architecture:
   - Domain entities and repository interfaces
   - Application services returning `Result<T>` (never throw for business errors)
   - Centralized validators in `application/validators/`
   - Thin Express controllers that map Result to HTTP status
   - Infrastructure: Prisma repositories, Pino logger
7. **Write tests** (Jest, 90% coverage target):
   - Unit tests in `__tests__/unit/` (mock Prisma, test services and validators)
   - Integration tests in `__tests__/integration/` (supertest with test DB)
   - Use AAA pattern (Arrange-Act-Assert)
   - Test data builders in `test-utils/builders/`
8. **Lint and type check**: `npm run lint && npx tsc --noEmit`
9. **Build and test**: `npm run build && npm test`
10. **Stage only affected files** and create a descriptive commit in English
11. **Push and create a PR** using `gh pr create`

Key references:
- Architecture patterns: `ai-specs/.agents/backend-developer.md`
- Backend standards: `ai-specs/specs/backend-standards.md`
- API specification: `ai-specs/specs/api-spec.yml`
- Feature specs: `openspec/specs/`
- CLAUDE.md: Project-wide conventions
