## 1. Backend — Validator

- [x] 1.1 Add `validatePostId()` function to `backend/src/application/validators/postValidator.ts` — validate ID is non-empty and a positive integer
- [x] 1.2 Add validatePostId tests to `backend/__tests__/unit/validators/postValidator.test.ts` (9 cases: valid "1", valid "999", zero, negative, decimal, non-numeric, undefined, null, empty string)

## 2. Backend — Service, Controller, and Route

- [x] 2.1 Add `delete()` method to `PostService` — validate ID, check existence via `findById`, delete, wrap in try/catch, log errors
- [x] 2.2 Add `delete()` method to `PostController` — call service, reuse `ERROR_STATUS_MAP` for status mapping, return 200 on success
- [x] 2.3 Add `DELETE /:id` route to `backend/src/routes/postRoutes.ts`

## 3. Backend — Tests

- [x] 3.1 Add delete tests to `backend/__tests__/unit/services/postService.test.ts` (5 cases: deletes existing, rejects invalid ID, post not found, findById throws, delete throws)
- [x] 3.2 Add DELETE tests to `backend/__tests__/integration/posts.test.ts` (5 cases: delete existing 200, not found 404, non-numeric 400, negative 400, post disappears from list)
- [x] 3.3 Verify backend tests pass: `cd backend && npm test`

## 4. Frontend — API and PostItem

- [x] 4.1 Add `deletePost` mutation to `frontend/src/features/posts/api/postsApi.ts` with `invalidatesTags: ['Posts']`
- [x] 4.2 Create `frontend/src/features/posts/components/PostItem.tsx` with Delete button, spinner, toast notifications via `useToast`
- [x] 4.3 Refactor `frontend/src/features/posts/components/PostList.tsx` to use `PostItem` instead of inline rows

## 5. Frontend — Tests

- [x] 5.1 Create `frontend/src/features/posts/components/PostItem.test.tsx` (6 cases: renders data, delete button visible, calls mutation, spinner during delete, success toast, error toast)
- [x] 5.2 Update `frontend/src/features/posts/components/PostList.test.tsx` to verify Delete button appears in rows
- [x] 5.3 Verify frontend tests pass: `cd frontend && npm test`

## 6. E2E Tests

- [x] 6.1 Create `frontend/e2e/delete-post.spec.ts` with Playwright tests (delete removes post from table, success toast visible, row count decreases)

## 7. Verification

- [x] 7.1 Run `cd backend && npm run lint && npm run test:coverage` — all pass with 90%+ coverage
- [x] 7.2 Run `cd frontend && npm run lint && npm run test:coverage` — all pass with 90%+ coverage
- [x] 7.3 Run `cd frontend && npm run build` — no build errors
- [x] 7.4 Run `cd backend && npm run build` — no build errors
