## 1. Slice and Hook

- [x] 1.1 Add `selectFilterText` selector to `frontend/src/features/posts/slices/postsSlice.ts`
- [x] 1.2 Create `frontend/src/features/posts/hooks/usePostFilter.ts` — filter posts by name (substring, case-insensitive) using `selectFilterText` and `useMemo`

## 2. PostFilter Component

- [x] 2.1 Create `frontend/src/features/posts/components/PostFilter.tsx` with InputGroup (placeholder "Filter by Name") and Search button, dispatching `setFilterText`/`clearFilter`, supporting Enter key

## 3. PostList and App Integration

- [x] 3.1 Modify `frontend/src/features/posts/components/PostList.tsx` — use `usePostFilter`, differentiate "No posts found" vs "No posts match your filter"
- [x] 3.2 Update `frontend/src/App.tsx` — reorder layout: PostFilter > PostList > PostForm

## 4. Unit Tests

- [x] 4.1 Create `frontend/src/features/posts/hooks/usePostFilter.test.ts` (8 cases: all posts, filter by name, case insensitive, no matches, undefined posts, empty posts, whitespace filter, substring match)
- [x] 4.2 Create `frontend/src/features/posts/components/PostFilter.test.tsx` (4 cases: renders input/button, search click dispatches, enter dispatches, empty input clears)
- [x] 4.3 Update `frontend/src/features/posts/components/PostList.test.tsx` — add mock for usePostFilter, add tests for "no match" message and differentiated empty states
- [x] 4.4 Update `frontend/src/features/posts/slices/postsSlice.test.ts` — add test for selectFilterText selector
- [x] 4.5 Verify frontend tests pass: `cd frontend && npm test`

## 5. E2E Tests

- [x] 5.1 Create `frontend/e2e/filter-posts.spec.ts` with Playwright tests (filter by name, case insensitive, clear filter, no results message, enter key)

## 6. Verification

- [x] 6.1 Run `cd frontend && npm run lint && npm run test:coverage` — all pass with 90%+ coverage
- [x] 6.2 Run `cd frontend && npm run build` — no build errors
- [x] 6.3 Run `cd backend && npm run lint && npm run test:coverage` — still passes (no backend changes)
