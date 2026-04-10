## Why

Users can view posts but cannot create them. The create post functionality is the core write operation of the TCIT Posts Manager — without it, the application has no user-generated content. This builds on the list-posts feature (spec 02) and is a prerequisite for the delete and filter features.

## What Changes

- Add `validateCreatePost()` centralized validator with field constraints (name: required, string, max 255, trimmed; description: required, string, max 2000)
- Add `PostService.create()` method with validation, uniqueness check, and try/catch error handling
- Add `PostController.create()` method mapping Result error codes to HTTP statuses (400/409/500)
- Register `POST /api/v1/posts` route returning 201 on success
- Add `CreatePostDto` type to frontend
- Add RTK Query `createPost` mutation with `invalidatesTags: ['Posts']` for automatic list refresh
- Create `PostForm` component with React Hook Form + Zod validation, inline layout, submit/reset/loading states
- Create Toast notification system (React Context + ToastContainer) for success/error feedback
- Update `App.tsx` to render PostForm above PostList, wrapped in ToastProvider
- Add backend unit tests (validator: 14 cases, service.create: 5 cases), integration tests (8 cases)
- Add frontend unit tests (PostForm: 8 cases), E2E tests (4 cases)

## Capabilities

### New Capabilities

- `create-post`: Full-stack implementation of post creation — backend validation, service, controller, route; frontend form with Zod validation, RTK Query mutation, toast notifications, and all test layers

### Modified Capabilities

- `list-posts`: App.tsx layout changes — PostForm added above PostList, ToastProvider wraps content. No requirement-level changes to listing behavior itself.

## Impact

- **Backend**: New file `application/validators/postValidator.ts`. Modify `postService.ts`, `postController.ts`, `postRoutes.ts` to add create functionality.
- **Frontend**: New files for `PostForm.tsx`, `ToastContext.tsx`, `ToastContainer.tsx`. Modify `postsApi.ts` (add mutation), `post.types.ts` (add CreatePostDto), `App.tsx` (add PostForm + ToastProvider).
- **API**: New endpoint `POST /api/v1/posts` per OpenAPI spec with 201/400/409/500 responses.
- **Dependencies**: No new production dependencies (React Hook Form, Zod, React Bootstrap already installed).
