## Context

The TCIT Posts Manager has full CRD functionality. The `postsSlice` already has `filterText` state with `setFilterText` and `clearFilter` actions (created in spec 02 as preparation). RTK Query caches the full posts list via `getPosts` with `Posts` tag. The `hooks/` directory exists but is empty. The current App.tsx layout is: PostForm above PostList.

## Goals / Non-Goals

**Goals:**
- Filter posts by name using client-side substring matching (case-insensitive)
- Search triggered by button click or Enter key — not on every keystroke
- Differentiate "no posts" vs "no filter matches" in the UI
- Reorder layout to PostFilter > PostList > PostForm per mockup
- Zero new API calls — filter operates on RTK Query cache

**Non-Goals:**
- Server-side filtering or pagination
- Filtering by description or other fields
- Real-time filtering as user types (debounced or instant)
- Saving filter state across sessions

## Decisions

### 1. Filter via Redux selector + useMemo, not a derived RTK Query endpoint

The `usePostFilter` hook reads `filterText` from Redux via `selectFilterText` and filters the `Post[]` array in `useMemo`. No new RTK Query endpoint or `selectFromResult` is needed.

**Rationale:** The entire posts list is already cached. Filtering a small array in memory is trivial. Adding a parameterized RTK Query endpoint would add complexity for no performance gain.

**Alternative considered:** `selectFromResult` in RTK Query. Rejected because it couples filter logic to the API layer, and the filter state already lives in the posts slice.

### 2. Search button triggers filter, not real-time input

The user types in the input, then clicks Search (or presses Enter) to apply. The filter is NOT applied on every keystroke.

**Rationale:** Per spec design. The `PostFilter` component uses local `useState` for the input value and only dispatches to Redux on explicit search action. This avoids Redux updates on every keystroke.

### 3. PostList mocks usePostFilter in tests

PostList unit tests mock `usePostFilter` directly rather than setting up Redux store state. This keeps PostList tests focused on rendering behavior.

**Rationale:** PostList tests already mock `useGetPostsQuery`. Adding Redux store setup for `filterText` would make tests complex for no added confidence — the hook is tested independently.

### 4. Layout reorder: PostFilter > PostList > PostForm

The app layout changes from `[PostForm, PostList]` to `[PostFilter, PostList, PostForm]`. The filter and results are the primary interaction; creation is secondary.

**Rationale:** Per spec mockup. Users browse/search more often than they create.

## Risks / Trade-offs

- **[Trade-off] Filter not applied on keystroke** → Users must click Search or press Enter. This is intentional per spec, trading immediacy for explicit user intent.

- **[Trade-off] PostList test mock of usePostFilter** → Means PostList tests don't exercise the actual filter logic. Mitigated: usePostFilter has its own dedicated 8-case test suite.
