## 1. Health Controller

- [x] 1.1 Create `backend/src/presentation/controllers/healthController.ts` with `HealthController` class and `check()` method that probes DB via `prisma.$queryRaw\`SELECT 1\`` and returns flat `HealthResponse` JSON (200 ok / 503 degraded)

## 2. Route Registration

- [x] 2.1 Create `backend/src/routes/healthRoutes.ts` with Express Router mounting `GET /` to `healthController.check`
- [x] 2.2 Modify `backend/src/routes/index.ts` to import and register `healthRoutes` at `/health`

## 3. Unit Tests

- [x] 3.1 Create `backend/__tests__/unit/controllers/healthController.test.ts` with mocked Prisma client covering: 200 when DB connected, 503 when DB down, all required fields present, valid ISO 8601 timestamp, uptime is non-negative number

## 4. Integration Tests

- [x] 4.1 Create `backend/__tests__/integration/health.test.ts` using supertest with real DB covering: GET /api/v1/health returns 200, correct content-type, response body matches HealthResponse schema

## 5. Verification

- [x] 5.1 Run `npx tsc --noEmit` to verify type-checking passes
- [x] 5.2 Run `npm run lint` to verify no lint errors
- [x] 5.3 Run `npm test` to verify all tests pass with 90%+ coverage on new files
