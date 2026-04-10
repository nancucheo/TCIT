## MODIFIED Requirements

### Requirement: Frontend displays posts in a table
The `PostList` component SHALL render posts in a React Bootstrap `Table` with columns: Name, Description, and Action. Each post SHALL be rendered by a `PostItem` sub-component. The component SHALL use the `usePostFilter` hook to filter posts by the Redux `filterText` state. When no posts exist, "No posts found" SHALL be displayed. When posts exist but the filter excludes all, "No posts match your filter" SHALL be displayed.

#### Scenario: Posts rendered in table rows
- **WHEN** the API returns 2 posts successfully and the filter matches both
- **THEN** the table SHALL display 2 rows in the tbody, each showing the post's name, description, and a Delete button

#### Scenario: Table has correct column headers
- **WHEN** the PostList component renders
- **THEN** the table SHALL have three column headers: "Name", "Description", and "Action"

#### Scenario: No posts match filter
- **WHEN** the API returns posts but the filter excludes all of them
- **THEN** the text "No posts match your filter" SHALL be displayed

#### Scenario: No posts exist
- **WHEN** the API returns an empty array (no posts in database)
- **THEN** the text "No posts found" SHALL be displayed

### Requirement: App wraps content with ErrorBoundary and Layout
The `App.tsx` root component SHALL render `ErrorBoundary > ToastProvider > Layout > PostFilter + PostList + PostForm`. The Layout component SHALL display the title "TCIT Posts Manager" inside a Bootstrap Container. The ErrorBoundary SHALL catch render errors and display a fallback danger alert. The `ToastContainer` SHALL render after Layout inside the ToastProvider.

#### Scenario: Application title visible
- **WHEN** the user navigates to `/`
- **THEN** the heading "TCIT Posts Manager" SHALL be visible

#### Scenario: Render error caught
- **WHEN** a child component throws a render error
- **THEN** the ErrorBoundary SHALL display a danger alert instead of crashing the page

#### Scenario: PostForm visible below table
- **WHEN** the user navigates to `/`
- **THEN** the create form SHALL appear below the posts table, and the filter input SHALL appear above it
