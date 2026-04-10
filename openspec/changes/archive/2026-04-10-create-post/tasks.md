## 1. Backend — Validator

- [x] 1.1 Create `backend/src/application/validators/postValidator.ts` with `validateCreatePost()` function implementing all validation rules (body required, name: required/string/max255/trimmed, description: required/string/max2000)
- [x] 1.2 Create `backend/__tests__/unit/validators/postValidator.test.ts` with 14 test cases (valid input, name empty/missing/long/spaces/not-string, description empty/long/not-string, null body, undefined body, multiple errors, boundary 255, boundary 2000)

## 2. Backend — Service and Controller

- [x] 2.1 Add `create()` method to `PostService` in `backend/src/application/services/postService.ts` — validate, check uniqueness via `findByName`, save, wrap in try/catch, log errors
- [x] 2.2 Add `create()` method to `PostController` in `backend/src/presentation/controllers/postController.ts` — call service, map error codes to HTTP statuses (VALIDATION_ERROR→400, POST_ALREADY_EXISTS→409, INTERNAL_ERROR→500), return 201 on success
- [x] 2.3 Add `POST /` route to `backend/src/routes/postRoutes.ts`

## 3. Backend — Tests for Service and Integration

- [x] 3.1 Add create tests to `backend/__tests__/unit/services/postService.test.ts` (creates successfully, rejects invalid input, rejects duplicate name, handles save error, handles findByName error)
- [x] 3.2 Add POST tests to `backend/__tests__/integration/posts.test.ts` (creates post 201, name empty 400, description missing 400, name too long 400, duplicate name 409, created post in list, timestamps present, content-type JSON)
- [x] 3.3 Verify backend tests pass: `cd backend && npm test`

## 4. Frontend — Types and API

- [x] 4.1 Add `CreatePostDto` interface to `frontend/src/features/posts/types/post.types.ts`
- [x] 4.2 Add `createPost` mutation to `frontend/src/features/posts/api/postsApi.ts` with `invalidatesTags: ['Posts']` and `transformResponse`

## 5. Frontend — Toast System

- [x] 5.1 Create `frontend/src/shared/components/ToastContext.tsx` with ToastProvider, useToast hook, ToastNotification interface
- [x] 5.2 Create `frontend/src/shared/components/ToastContainer.tsx` with Bootstrap ToastContainer at top-end position, auto-dismiss after 3 seconds

## 6. Frontend — PostForm Component

- [x] 6.1 Create `frontend/src/features/posts/components/PostForm.tsx` with React Hook Form + Zod validation, inline Row layout (Name/Description/Create), submit handling, form reset on success, spinner during loading, API error mapping via setError() and toast for 409
- [x] 6.2 Update `frontend/src/App.tsx` to render ToastProvider wrapping Layout, PostForm above PostList, ToastContainer after Layout

## 7. Frontend — Tests

- [x] 7.1 Create `frontend/src/features/posts/components/PostForm.test.tsx` (renders fields, name required error, description required error, name too long, successful submit, form resets, spinner during submit, conflict error toast)
- [x] 7.2 Create `frontend/src/shared/components/ToastContext.test.tsx` (addToast shows toast, auto-dismiss after timeout)
- [x] 7.3 Verify frontend tests pass: `cd frontend && npm test`

## 8. E2E Tests

- [x] 8.1 Create `frontend/e2e/create-post.spec.ts` with Playwright tests (create post appears in table, validation errors, duplicate name error, form clears after success)

## 9. Verification

- [x] 9.1 Run `cd backend && npm run lint && npm run test:coverage` — all pass with 90%+ coverage
- [x] 9.2 Run `cd frontend && npm run lint && npm run test:coverage` — all pass with 90%+ coverage
- [x] 9.3 Run `cd frontend && npm run build` — no build errors
- [x] 9.4 Run `cd backend && npm run build` — no build errors
