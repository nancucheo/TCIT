## MODIFIED Requirements

### Requirement: Frontend displays posts in a table
The `PostList` component SHALL render posts in a React Bootstrap `Table` with columns: Name, Description, and Action. Each post SHALL be rendered by a `PostItem` sub-component displaying its `name`, `description`, and a Delete button.

#### Scenario: Posts rendered in table rows
- **WHEN** the API returns 2 posts successfully
- **THEN** the table SHALL display 2 rows in the tbody, each showing the post's name, description, and a Delete button

#### Scenario: Table has correct column headers
- **WHEN** the PostList component renders
- **THEN** the table SHALL have three column headers: "Name", "Description", and "Action"
