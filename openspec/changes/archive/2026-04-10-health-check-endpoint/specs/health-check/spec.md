## ADDED Requirements

### Requirement: Health endpoint returns service status
The system SHALL expose a `GET /api/v1/health` endpoint that returns the current service status and database connectivity state.

#### Scenario: Database is connected
- **WHEN** the client sends `GET /api/v1/health` and PostgreSQL is reachable
- **THEN** the response status code SHALL be `200` and the body SHALL contain `{ status: "ok", timestamp: <ISO 8601>, uptime: <number>, dependencies: { database: "connected" } }`

#### Scenario: Database is unreachable
- **WHEN** the client sends `GET /api/v1/health` and PostgreSQL is unreachable
- **THEN** the response status code SHALL be `503` and the body SHALL contain `{ status: "degraded", timestamp: <ISO 8601>, uptime: <number>, dependencies: { database: "disconnected" } }`

### Requirement: Health response matches HealthResponse schema
The response body SHALL conform to the `HealthResponse` schema defined in the OpenAPI spec. It is a flat object (not wrapped in `{ success, data }`).

#### Scenario: Response includes all required fields
- **WHEN** the client receives any response from `GET /api/v1/health`
- **THEN** the body SHALL contain exactly four top-level fields: `status` (string, "ok" or "degraded"), `timestamp` (ISO 8601 string), `uptime` (number, seconds), and `dependencies` (object with `database` field)

#### Scenario: Timestamp is valid ISO 8601
- **WHEN** the client inspects the `timestamp` field
- **THEN** it SHALL be a valid ISO 8601 date-time string

#### Scenario: Uptime is a non-negative number
- **WHEN** the client inspects the `uptime` field
- **THEN** it SHALL be a number greater than or equal to zero, representing seconds since server start

### Requirement: Health check probes database with SELECT 1
The controller SHALL verify database connectivity by executing `SELECT 1` via `prisma.$queryRaw`. No application tables are queried.

#### Scenario: Probe succeeds
- **WHEN** `prisma.$queryRaw\`SELECT 1\`` resolves successfully
- **THEN** the endpoint SHALL return status `"ok"` with database `"connected"`

#### Scenario: Probe fails
- **WHEN** `prisma.$queryRaw\`SELECT 1\`` throws any error (connection refused, timeout, auth failure)
- **THEN** the endpoint SHALL catch the error and return status `"degraded"` with database `"disconnected"`
