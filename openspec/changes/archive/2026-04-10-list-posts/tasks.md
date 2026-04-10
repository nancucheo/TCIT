## 1. Backend — Service and Controller

- [x] 1.1 Update `PrismaPostRepository.findAll()` to add `orderBy: { createdAt: 'desc' }` (already existed)
- [x] 1.2 Create `PostService` in `backend/src/application/services/postService.ts` with `getAll()` method returning `Result<Post[]>`
- [x] 1.3 Create `PostController` in `backend/src/presentation/controllers/postController.ts` with `getAll()` method mapping Result to HTTP response (`{ success, data, meta }`)
- [x] 1.4 Create `backend/src/routes/postRoutes.ts` with `GET /` route bound to controller
- [x] 1.5 Register post routes in `backend/src/routes/index.ts` under `/posts` prefix

## 2. Backend — Tests

- [x] 2.1 Create `backend/test-utils/builders/postBuilder.ts` for building test Post instances
- [x] 2.2 Create `backend/test-utils/mocks/prismaClient.mock.ts` for mocked Prisma client
- [x] 2.3 Create unit tests in `backend/__tests__/unit/services/postService.test.ts` (returns posts, returns empty, repository throws, non-Error throws)
- [x] 2.4 Create integration tests in `backend/__tests__/integration/posts.test.ts` (seeded posts, empty DB, descending order, response schema, field completeness)
- [x] 2.5 Verify backend tests pass and meet 90%+ coverage: `cd backend && npm run test:coverage`

## 3. Frontend — Types, Store, and API

- [x] 3.1 Create `frontend/src/features/posts/types/post.types.ts` with `Post`, `ApiSuccessResponse`, `ApiErrorResponse` interfaces
- [x] 3.2 Create `frontend/src/features/posts/api/postsApi.ts` with RTK Query `getPosts` endpoint using `transformResponse` and `Posts` cache tag
- [x] 3.3 Create `frontend/src/features/posts/slices/postsSlice.ts` with `filterText` state, `setFilterText`, and `clearFilter` reducers
- [x] 3.4 Update `frontend/src/app/store.ts` to register `postsApi` reducer + middleware and `postsSlice` reducer

## 4. Frontend — Shared Components

- [x] 4.1 Create `frontend/src/shared/components/Layout.tsx` with Bootstrap Container and "TCIT Posts Manager" heading
- [x] 4.2 Create `frontend/src/shared/components/ErrorBoundary.tsx` as class component with danger alert fallback
- [x] 4.3 Create `frontend/src/shared/components/LoadingSpinner.tsx` with centered Bootstrap Spinner and `role="status"`

## 5. Frontend — PostList Component and App Integration

- [x] 5.1 Create `frontend/src/features/posts/components/PostList.tsx` handling loading/error/empty/data states with Bootstrap Table
- [x] 5.2 Update `frontend/src/App.tsx` to render `ErrorBoundary > Layout > PostList`

## 6. Frontend — Test Utilities and Unit Tests

- [x] 6.1 Create `frontend/src/test-utils/renderWithProviders.tsx` with Redux Provider wrapper
- [x] 6.2 Create `frontend/src/test-utils/mocks/handlers.ts` with MSW handlers for `GET /posts`
- [x] 6.3 Create `frontend/src/test-utils/mocks/server.ts` with MSW `setupServer`
- [x] 6.4 PostList tests use `vi.mock` instead of MSW (Node 24 AbortSignal compatibility)
- [x] 6.5 Create `frontend/src/features/posts/components/PostList.test.tsx` (spinner, error, empty, table rows, column headers)
- [x] 6.6 Create `frontend/src/features/posts/slices/postsSlice.test.ts` (initial state, setFilterText, clearFilter)

## 7. E2E Tests

- [x] 7.1 Create `frontend/e2e/list-posts.spec.ts` with Playwright tests (posts table, title visible, table headers, empty state, loading state)

## 8. Verification

- [x] 8.1 Run `cd backend && npm run lint && npm run test:coverage` — all pass with 100% coverage
- [x] 8.2 Run `cd frontend && npm run lint && npm test` — all pass
- [x] 8.3 Run `cd frontend && npm run build` — no build errors
- [x] 8.4 Run `cd backend && npm run build` — no build errors
