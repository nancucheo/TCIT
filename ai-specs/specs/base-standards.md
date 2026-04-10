---
description: Core development rules and guidelines for TCIT Posts Manager, applicable to all AI agents and developers.
alwaysApply: true
---

## 1. Core Principles

- **Small tasks, one at a time**: Work in baby steps. Never go forward more than one step.
- **Spec-Driven Development**: No code without an approved spec in `openspec/specs/`.
- **Test-Driven Development**: Start with failing tests for any new functionality (TDD). Target 90% coverage.
- **Type Safety**: All code must be fully typed (TypeScript strict mode).
- **Clear Naming**: Use clear, descriptive English names for all variables and functions.
- **Incremental Changes**: Prefer incremental, focused changes over large, complex modifications.
- **Question Assumptions**: Always question assumptions and inferences.
- **Pattern Detection**: Detect and highlight repeated code patterns.

## 2. Language Standards

- **English Only**: All technical artifacts must use English:
    - Code (variables, functions, classes, comments, error messages, log messages)
    - Documentation (README, guides, API docs)
    - Git commit messages
    - Data schemas and database names
    - Configuration files and scripts
    - Test names and descriptions

## 3. Specific Standards

- [Backend Standards](./backend-standards.md) — Express.js, DDD Layered, Prisma, PostgreSQL, Result<T>, testing
- [Frontend Standards](./frontend-standards.md) — React 18, Redux Toolkit, RTK Query, Vite, React Bootstrap, testing
- [Documentation Standards](./documentation-standards.md) — Technical documentation structure and maintenance
- [Data Model](./data-model.md) — Post entity and Prisma schema
- [API Specification](./api-spec.yml) — OpenAPI 3.1 for Posts CRUD + health check

## 4. Key References

- `CLAUDE.md` — Project-wide conventions and commands
- `docs/openapi.yaml` — Full OpenAPI specification
- `docs/adr/` — Architecture Decision Records
- `openspec/specs/` — Feature specifications
- `openspec/config.yaml` — Spec creation rules and project context
