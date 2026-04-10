## Why

Users can create, list, and delete posts but cannot find specific posts in a growing list. Client-side filtering by name lets users quickly locate posts without requiring a new backend endpoint. This completes the user-facing feature set for the TCIT Posts Manager challenge.

## What Changes

- Add `selectFilterText` selector to existing `postsSlice.ts`
- Create `usePostFilter` hook that filters cached posts by name (substring, case-insensitive) using Redux filter state
- Create `PostFilter` component with input field and Search button, dispatching `setFilterText`/`clearFilter`
- Modify `PostList` to use `usePostFilter` and differentiate "No posts found" vs "No posts match your filter"
- Reorder `App.tsx` layout: PostFilter (top) > PostList (middle) > PostForm (bottom)
- Add unit tests for hook (8 cases), PostFilter (4 cases), updated PostList tests (3 new cases)
- Add E2E tests (5 cases with Playwright)
- **No backend changes** — filtering is 100% client-side on RTK Query cached data

## Capabilities

### New Capabilities

- `filter-posts`: Client-side post filtering by name — usePostFilter hook, PostFilter component, PostList integration, and all test layers

### Modified Capabilities

- `list-posts`: PostList component updated to use usePostFilter hook and show differentiated empty state messages. App.tsx layout reordered.

## Impact

- **Frontend only**: New files `usePostFilter.ts`, `PostFilter.tsx`. Modify `postsSlice.ts` (add selector), `PostList.tsx` (use filter hook, differentiated messages), `App.tsx` (layout reorder).
- **Backend**: No changes.
- **Dependencies**: None — all libraries already installed.
