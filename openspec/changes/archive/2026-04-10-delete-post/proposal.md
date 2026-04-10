## Why

Users can create and view posts but cannot remove them. The delete functionality completes the CRD operations of the TCIT Posts Manager. Without it, users have no way to clean up unwanted or test content. This is the last CRUD endpoint required by the challenge specification.

## What Changes

- Add `validatePostId()` to the existing validator for ID format validation (positive integer)
- Add `PostService.delete()` method with ID validation, existence check, and try/catch error handling
- Add `PostController.delete()` method reusing the existing `ERROR_STATUS_MAP` (400/404/500)
- Register `DELETE /api/v1/posts/:id` route
- Add RTK Query `deletePost` mutation with `invalidatesTags: ['Posts']`
- Extract `PostItem` component from PostList with Delete button, spinner, and toast notifications
- Refactor `PostList` to render `PostItem` per row instead of inline `<tr>`
- Add backend unit tests (validator: 9 cases, service.delete: 5 cases), integration tests (5 cases)
- Add frontend unit tests (PostItem: 6 cases), E2E tests (3 cases)

## Capabilities

### New Capabilities

- `delete-post`: Full-stack implementation of post deletion — backend ID validation, existence check, delete endpoint; frontend PostItem component with Delete button, loading state, toast feedback, and all test layers

### Modified Capabilities

- `list-posts`: PostList component refactored to use PostItem sub-component instead of inline rows. No requirement-level changes to listing behavior.

## Impact

- **Backend**: Modify `postValidator.ts` (add `validatePostId`), `postService.ts` (add `delete`), `postController.ts` (add `delete`), `postRoutes.ts` (add DELETE route).
- **Frontend**: Modify `postsApi.ts` (add `deletePost` mutation), `PostList.tsx` (use PostItem). New file `PostItem.tsx`.
- **API**: New endpoint `DELETE /api/v1/posts/:id` per OpenAPI spec with 200/400/404/500 responses.
- **Dependencies**: None — all libraries already installed.
