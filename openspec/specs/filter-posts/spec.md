### Requirement: usePostFilter hook filters posts by name
The `usePostFilter` hook SHALL filter an array of posts by matching the Redux `filterText` state against each post's `name` field. Matching SHALL be case-insensitive and substring-based. The hook SHALL use `useMemo` for performance. When `filterText` is empty or whitespace-only, all posts SHALL be returned.

#### Scenario: Returns all posts when filter is empty
- **WHEN** `usePostFilter` is called with 3 posts and `filterText` is `""`
- **THEN** all 3 posts SHALL be returned

#### Scenario: Filters by name substring
- **WHEN** `usePostFilter` is called with posts ["Post 1", "Post 2", "Other"] and `filterText` is `"post 1"`
- **THEN** only the post with name "Post 1" SHALL be returned

#### Scenario: Case-insensitive matching
- **WHEN** `usePostFilter` is called with post ["My Post"] and `filterText` is `"my post"`
- **THEN** 1 post SHALL be returned

#### Scenario: No matches returns empty array
- **WHEN** `usePostFilter` is called with 3 posts and `filterText` is `"xyz"`
- **THEN** an empty array SHALL be returned

#### Scenario: Undefined posts returns empty array
- **WHEN** `usePostFilter` is called with `undefined` posts
- **THEN** an empty array SHALL be returned

#### Scenario: Empty posts returns empty array
- **WHEN** `usePostFilter` is called with `[]` posts
- **THEN** an empty array SHALL be returned

#### Scenario: Whitespace-only filter returns all posts
- **WHEN** `usePostFilter` is called with 3 posts and `filterText` is `"  "`
- **THEN** all 3 posts SHALL be returned (whitespace is trimmed to empty)

#### Scenario: Substring match within name
- **WHEN** `usePostFilter` is called with post ["TypeScript Tips"] and `filterText` is `"script"`
- **THEN** 1 post SHALL be returned

### Requirement: PostFilter component with search input
The `PostFilter` component SHALL render a Bootstrap `InputGroup` with a text input (placeholder "Filter by Name") and a "Search" button. Clicking Search SHALL dispatch `setFilterText` with the input value. Pressing Enter SHALL also trigger the search. When the input is empty, Search SHALL dispatch `clearFilter`.

#### Scenario: Input and button visible
- **WHEN** PostFilter renders
- **THEN** an input with placeholder "Filter by Name" and a "Search" button SHALL be visible

#### Scenario: Search click dispatches filter
- **WHEN** the user types "hello" and clicks Search
- **THEN** `setFilterText("hello")` SHALL be dispatched

#### Scenario: Enter key dispatches filter
- **WHEN** the user types "hello" and presses Enter
- **THEN** `setFilterText("hello")` SHALL be dispatched

#### Scenario: Empty input clears filter
- **WHEN** the input is empty and the user clicks Search
- **THEN** `clearFilter()` SHALL be dispatched

### Requirement: App layout shows PostFilter above PostList and PostForm below
The `App.tsx` layout SHALL render components in order: PostFilter (top), PostList (middle), PostForm (bottom), all inside `ErrorBoundary > ToastProvider > Layout`.

#### Scenario: Layout order correct
- **WHEN** the user navigates to `/`
- **THEN** the filter input SHALL appear above the posts table, and the create form SHALL appear below the table
