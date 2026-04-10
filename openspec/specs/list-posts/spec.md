### Requirement: Backend returns all posts via GET endpoint
The system SHALL expose a `GET /api/v1/posts` endpoint that returns all posts from the database. The response SHALL follow the standard API envelope format with `success`, `data` (array of Post objects), and `meta` (containing `total` count). Each Post object SHALL include `id`, `name`, `description`, `createdAt`, and `updatedAt` fields.

#### Scenario: Retrieve posts when posts exist
- **WHEN** a GET request is made to `/api/v1/posts` and 2 posts exist in the database
- **THEN** the response status SHALL be 200, `success` SHALL be `true`, `data` SHALL contain 2 Post objects, and `meta.total` SHALL be 2

#### Scenario: Retrieve posts when no posts exist
- **WHEN** a GET request is made to `/api/v1/posts` and the database has no posts
- **THEN** the response status SHALL be 200, `success` SHALL be `true`, `data` SHALL be an empty array, and `meta.total` SHALL be 0

#### Scenario: Each post contains all required fields
- **WHEN** a GET request is made to `/api/v1/posts` and posts exist
- **THEN** each post object in `data` SHALL contain `id` (integer), `name` (string), `description` (string), `createdAt` (ISO 8601 datetime), and `updatedAt` (ISO 8601 datetime)

### Requirement: Posts are ordered by creation date descending
The system SHALL return posts ordered by `createdAt` in descending order (most recent first). This ordering MUST be enforced at the repository layer, leveraging the existing database index on `created_at DESC`.

#### Scenario: Most recent post appears first
- **WHEN** a GET request is made to `/api/v1/posts` and posts with different creation timestamps exist
- **THEN** the first post in the `data` array SHALL have the most recent `createdAt` value

### Requirement: Backend handles database errors gracefully
The system SHALL catch database errors (connection failures, query timeouts) in the service layer and return a structured error response. The service SHALL return `Result.failure('INTERNAL_ERROR', 'Failed to retrieve posts')`. The service SHALL log the error at `error` level using Pino before returning.

#### Scenario: Database connection failure
- **WHEN** a GET request is made to `/api/v1/posts` and the database is unreachable
- **THEN** the response status SHALL be 500, `success` SHALL be `false`, and `error.code` SHALL be `INTERNAL_ERROR`

#### Scenario: Database query throws unexpected error
- **WHEN** a GET request is made to `/api/v1/posts` and the repository throws an exception
- **THEN** the response status SHALL be 500 with a structured error response, and internal error details SHALL NOT be exposed to the client

### Requirement: Frontend displays posts in a table
The `PostList` component SHALL render posts in a React Bootstrap `Table` with columns: Name, Description, and Action. Each post SHALL be rendered by a `PostItem` sub-component displaying its `name`, `description`, and a Delete button.

#### Scenario: Posts rendered in table rows
- **WHEN** the API returns 2 posts successfully
- **THEN** the table SHALL display 2 rows in the tbody, each showing the post's name, description, and a Delete button

#### Scenario: Table has correct column headers
- **WHEN** the PostList component renders
- **THEN** the table SHALL have three column headers: "Name", "Description", and "Action"

### Requirement: Frontend shows loading state
The `PostList` component SHALL display a centered spinner while the API request is in progress. The spinner MUST have `role="status"` for accessibility.

#### Scenario: Spinner displayed during loading
- **WHEN** the user navigates to the app and the API request has not yet resolved
- **THEN** a spinner with `role="status"` SHALL be visible

### Requirement: Frontend shows error state
The `PostList` component SHALL display a Bootstrap `Alert` with `variant="danger"` when the API request fails.

#### Scenario: Error alert displayed on API failure
- **WHEN** the API request to `/api/v1/posts` fails (e.g., 500 response)
- **THEN** an alert with text containing "Error" SHALL be visible

### Requirement: Frontend shows empty state
The `PostList` component SHALL display a Bootstrap `Alert` with `variant="info"` and text "No posts found" when the API returns an empty array.

#### Scenario: Empty state message displayed
- **WHEN** the API returns an empty `data` array
- **THEN** the text "No posts found" SHALL be visible in an info alert

### Requirement: RTK Query caches the posts response
The `getPosts` RTK Query endpoint SHALL use the `Posts` tag for cache invalidation. The endpoint SHALL be called only once per view load — subsequent renders MUST use the cached response.

#### Scenario: No duplicate API calls
- **WHEN** the PostList component is rendered and the data is already cached
- **THEN** the system SHALL NOT make a second API request to `/api/v1/posts`

### Requirement: App wraps content with ErrorBoundary and Layout
The `App.tsx` root component SHALL render `ErrorBoundary > ToastProvider > Layout > PostForm + PostList`. The Layout component SHALL display the title "TCIT Posts Manager" inside a Bootstrap Container. The ErrorBoundary SHALL catch render errors and display a fallback danger alert. The `ToastContainer` SHALL render after Layout inside the ToastProvider.

#### Scenario: Application title visible
- **WHEN** the user navigates to `/`
- **THEN** the heading "TCIT Posts Manager" SHALL be visible

#### Scenario: Render error caught
- **WHEN** a child component throws a render error
- **THEN** the ErrorBoundary SHALL display a danger alert instead of crashing the page

#### Scenario: PostForm visible above table
- **WHEN** the user navigates to `/`
- **THEN** the create form SHALL appear above the posts table
