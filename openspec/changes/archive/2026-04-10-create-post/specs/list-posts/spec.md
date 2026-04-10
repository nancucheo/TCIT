## MODIFIED Requirements

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
