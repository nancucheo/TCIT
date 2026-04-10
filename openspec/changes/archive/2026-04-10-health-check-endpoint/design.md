## Context

The backend project has its foundational structure in place (Express app, Prisma client, middleware, route index) but no functional endpoints yet. The health check is the first endpoint to implement, validating the full request pipeline: route registration → controller → infrastructure (Prisma) → JSON response.

The OpenAPI spec already defines `HealthResponse` as a flat object (`{ status, timestamp, uptime, dependencies }`) — distinct from the `{ success, data }` wrapper used by resource endpoints like `/posts`.

## Goals / Non-Goals

**Goals:**
- Validate end-to-end Express request handling through the DDD layered architecture
- Provide a database connectivity probe usable by ALB health checks and monitoring
- Establish the pattern for controller + route registration that subsequent endpoints will follow
- Achieve 90%+ test coverage on new files with both unit and integration tests

**Non-Goals:**
- Adding a service layer or `Result<T>` for health checks (no business logic to encapsulate)
- Checking additional dependencies beyond PostgreSQL (e.g., Redis, external APIs)
- Adding authentication or rate limiting to the health endpoint
- Frontend components — health check is backend-only infrastructure

## Decisions

### 1. Controller directly uses Prisma client (no service layer)

Health checks are infrastructure probes with no business logic. Introducing a service layer and `Result<T>` pattern would add indirection without value. The controller imports the Prisma singleton and calls `$queryRaw\`SELECT 1\`` directly.

**Alternative considered:** Wrapping in a HealthService — rejected because it would be a pass-through with no logic, violating YAGNI.

### 2. Flat response format (not wrapped in `{ success, data }`)

The OpenAPI `HealthResponse` schema is a flat object. Health endpoints serve infrastructure consumers (load balancers, monitoring) that expect a simple status payload, not the resource-oriented wrapper.

**Alternative considered:** Using the standard `{ success, data }` wrapper — rejected because it contradicts the OpenAPI spec and adds unnecessary nesting for infrastructure consumers.

### 3. `SELECT 1` as the database probe

A minimal query that validates connectivity without touching any tables. It's fast, side-effect-free, and works regardless of schema state.

**Alternative considered:** `prisma.post.count()` — rejected because it couples the health check to the Post model and is slower.

### 4. Class-based controller with instance method

Using `HealthController` class with a `check()` method, consistent with the project's controller pattern (`healthController.ts` is already listed in the backend standards project structure).

## Risks / Trade-offs

- **[Risk] `SELECT 1` doesn't validate schema integrity** → Acceptable: health checks probe connectivity, not schema correctness. Schema issues surface in integration tests and migrations.
- **[Risk] No timeout on the DB probe** → Mitigation: Prisma's default connection timeout applies. If needed later, a `Promise.race` with a timeout can be added.
- **[Trade-off] No caching of health status** → Acceptable for current scale. Each request hits the DB. At high check frequency, a TTL cache could be added.
