## Context

The TCIT Posts Manager has its infrastructure layer complete (Prisma schema, `PrismaPostRepository`, `Post` entity, `IPostRepository` interface, `Result<T>` class, health check endpoint) but lacks any post-related endpoints or frontend rendering. The frontend has a bare `App.tsx` and an empty Redux store with a placeholder reducer. All feature directories (`features/posts/`, `shared/`) contain only `.gitkeep` files.

This change implements the first functional feature: listing all posts. It spans all backend layers (service, controller, route) and establishes the frontend patterns (RTK Query, shared components, test utilities) that subsequent specs (create, delete, filter) will reuse.

## Goals / Non-Goals

**Goals:**
- Expose `GET /api/v1/posts` returning posts ordered by `createdAt DESC` with `{ success, data, meta }` envelope
- Render posts in a Bootstrap table with loading, error, and empty states
- Establish reusable patterns: RTK Query API slice, `renderWithProviders` test utility, MSW mock server, shared Layout/ErrorBoundary/LoadingSpinner components
- Achieve 90% test coverage across unit, integration, and E2E layers

**Non-Goals:**
- Pagination or server-side filtering (posts are fetched in a single call, filtered client-side per spec)
- Create/delete endpoints (spec 01 and spec 04)
- Authentication or authorization
- Custom styling beyond React Bootstrap defaults

## Decisions

### 1. Ordering in the repository layer, not the service

Posts are returned in `createdAt DESC` order. This ordering is enforced in `PrismaPostRepository.findAll()` rather than in the service layer.

**Rationale:** Ordering is a data-access concern. The Prisma schema already has `@@index([createdAt(sort: Desc)])`, so the DB can serve this efficiently. Sorting in the service would mean fetching unordered data and sorting in memory — wasteful and inconsistent with the existing index.

**Alternative considered:** Service-layer sort via `Array.sort()`. Rejected because it duplicates DB capability and doesn't leverage the index.

### 2. RTK Query `transformResponse` to unwrap API envelope

The `getPosts` endpoint uses `transformResponse` to extract `response.data` (the `Post[]` array) from the API envelope. Components receive `Post[]` directly rather than the full `{ success, data, meta }` wrapper.

**Rationale:** Simplifies component code — `useGetPostsQuery()` returns `data: Post[]` instead of requiring `data?.data` access. The `meta.total` is redundant since `posts.length` gives the same information client-side.

**Alternative considered:** Return the full `PostListResponse` and access `data.data` in components. Rejected for ergonomics — every consumer would need to unwrap.

### 3. `baseUrl` from environment variable

RTK Query's `fetchBaseQuery` uses `import.meta.env.VITE_API_URL` (defaults to `/api/v1` via Vite proxy in dev). This follows the frontend standards configuration pattern.

**Rationale:** Decouples the API URL from code, allowing different environments (dev via Vite proxy, production via direct URL) without code changes.

### 4. MSW for frontend test mocking

Frontend tests use Mock Service Worker (MSW) to intercept network requests at the service worker level, rather than mocking RTK Query hooks directly.

**Rationale:** MSW tests the full Redux + RTK Query integration path. Mocking hooks would skip the middleware, cache, and serialization layers — missing bugs that occur in those layers.

**Alternative considered:** Jest mock of `useGetPostsQuery`. Rejected because it doesn't exercise the RTK Query pipeline.

### 5. Class-based PostService with constructor-injected repository

Following the existing `healthController` pattern, `PostService` receives `IPostRepository` via constructor injection. The controller file instantiates both the repository and service, exporting bound methods.

**Rationale:** Enables unit testing with mock repositories. Matches the DDD layered architecture where infrastructure is injected, not imported.

## Risks / Trade-offs

- **[Risk] No pagination for large datasets** → Acceptable for challenge scope. The spec explicitly states all posts are fetched at once and filtered client-side. If post count grows significantly, this would need server-side pagination.

- **[Risk] `transformResponse` loses `meta.total`** → Mitigated: `posts.length` provides the same value client-side. If `meta` carries additional server-side information in the future (e.g., pagination cursors), this decision should be revisited.

- **[Risk] MSW version compatibility** → MSW v2 uses `http`/`HttpResponse` API (not `rest`). Must ensure correct import paths. Pin to a specific version in `package.json`.

- **[Trade-off] postsSlice created now but only used later** → The `filterText` state in `postsSlice` is prep for spec 03 (filter). Creating it now avoids store reconfiguration later, at the cost of minor unused code.
