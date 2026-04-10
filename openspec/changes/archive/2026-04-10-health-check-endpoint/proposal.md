## Why

The backend has no functional endpoints yet. A health check endpoint (`GET /api/v1/health`) is needed as the first end-to-end feature to validate that the Express app serves responses correctly and can reach PostgreSQL. It will be consumed by ALB target groups, monitoring systems, and Docker health checks.

## What Changes

- Add `GET /api/v1/health` endpoint that probes database connectivity via `SELECT 1`
- Returns 200 with `status: "ok"` when DB is reachable, 503 with `status: "degraded"` when not
- Response is a flat object matching the OpenAPI `HealthResponse` schema (not wrapped in `{ success, data }`)
- Create health controller in the Presentation layer
- Create health route and register it in the route index
- Add unit tests (mocked Prisma) and integration tests (real DB via supertest)

## Capabilities

### New Capabilities

- `health-check`: Service health check endpoint with database connectivity probe, used by infrastructure monitoring and load balancers

### Modified Capabilities

<!-- None - this is the first functional endpoint -->

## Impact

- **Backend code**: New controller (`healthController.ts`), new route file (`healthRoutes.ts`), modified route index (`routes/index.ts`)
- **API**: New endpoint `GET /api/v1/health` as defined in `ai-specs/specs/api-spec.yml`
- **Infrastructure**: No Prisma schema changes; uses existing `prismaClient.ts` singleton
- **Testing**: New unit and integration test files under `__tests__/`
