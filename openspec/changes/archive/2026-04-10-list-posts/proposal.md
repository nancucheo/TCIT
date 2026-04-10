## Why

The application needs the ability to display all existing posts to users. `GET /api/v1/posts` is the foundational read endpoint — it powers the main view of the TCIT Posts Manager. Without it, the frontend has no data to render and the app is non-functional beyond the health check. This is a prerequisite for all other CRUD operations (create, delete, filter).

## What Changes

- Add `PostService.getAll()` in the application layer returning `Result<Post[]>`
- Add `PostController.getAll()` in the presentation layer mapping Result to HTTP response
- Register `GET /api/v1/posts` route returning `{ success, data, meta }` format
- Update `PrismaPostRepository.findAll()` to enforce `createdAt DESC` ordering
- Create frontend types (`Post`, `ApiSuccessResponse`, `ApiErrorResponse`)
- Create RTK Query `postsApi` with `getPosts` endpoint and cache tags
- Create `postsSlice` with `filterText` state (prep for future filtering)
- Wire Redux store with `postsApi` reducer + middleware and `postsSlice`
- Create `PostList` component with loading/error/empty/data states
- Create shared components: `Layout`, `ErrorBoundary`, `LoadingSpinner`
- Update `App.tsx` to render `ErrorBoundary > Layout > PostList`
- Add backend unit tests (PostService.getAll) and integration tests (GET /api/v1/posts)
- Add frontend unit tests (PostList component, postsSlice) with MSW
- Add E2E tests (Playwright) for list posts view

## Capabilities

### New Capabilities

- `list-posts`: Full-stack implementation of listing all posts — backend endpoint, frontend Redux integration, PostList component, and all test layers (unit, integration, E2E)

### Modified Capabilities

_(none)_

## Impact

- **Backend**: New files in `application/services/`, `presentation/controllers/`, `routes/`. Modify `routes/index.ts` to mount post routes. Modify `PrismaPostRepository.findAll()` to add ordering.
- **Frontend**: New files in `features/posts/` (api, components, slices, types), `shared/components/`, `app/store.ts`. Modify `App.tsx` and `main.tsx`.
- **API**: New endpoint `GET /api/v1/posts` returning `PostListResponse` per OpenAPI spec.
- **Dependencies**: Frontend needs `msw` (dev) for test mocking. No new production dependencies.
- **Testing**: New test files in backend `__tests__/unit/` and `__tests__/integration/`, frontend test files alongside components, and `e2e/list-posts.spec.ts`.
