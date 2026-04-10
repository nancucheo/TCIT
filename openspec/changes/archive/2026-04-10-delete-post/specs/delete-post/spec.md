## ADDED Requirements

### Requirement: Backend validates post ID
The system SHALL validate the post ID parameter before processing delete requests. The validator (`validatePostId`) SHALL accept string input (from URL params) and verify it represents a positive integer.

#### Scenario: Valid ID "1" accepted
- **WHEN** `validatePostId` is called with `"1"`
- **THEN** `isValid` SHALL be `true`

#### Scenario: Valid ID "999" accepted
- **WHEN** `validatePostId` is called with `"999"`
- **THEN** `isValid` SHALL be `true`

#### Scenario: Zero ID rejected
- **WHEN** `validatePostId` is called with `"0"`
- **THEN** `isValid` SHALL be `false` with error on field `id`, constraint `isPositiveInt`

#### Scenario: Negative ID rejected
- **WHEN** `validatePostId` is called with `"-1"`
- **THEN** `isValid` SHALL be `false` with error on field `id`, constraint `isPositiveInt`

#### Scenario: Decimal ID rejected
- **WHEN** `validatePostId` is called with `"1.5"`
- **THEN** `isValid` SHALL be `false` with error on field `id`, constraint `isPositiveInt`

#### Scenario: Non-numeric ID rejected
- **WHEN** `validatePostId` is called with `"abc"`
- **THEN** `isValid` SHALL be `false` with error on field `id`, constraint `isPositiveInt`

#### Scenario: Undefined ID rejected
- **WHEN** `validatePostId` is called with `undefined`
- **THEN** `isValid` SHALL be `false` with error on field `id`, constraint `isNotEmpty`

#### Scenario: Null ID rejected
- **WHEN** `validatePostId` is called with `null`
- **THEN** `isValid` SHALL be `false` with error on field `id`, constraint `isNotEmpty`

#### Scenario: Empty string ID rejected
- **WHEN** `validatePostId` is called with `""`
- **THEN** `isValid` SHALL be `false` with error on field `id`, constraint `isNotEmpty`

### Requirement: Backend deletes a post via DELETE endpoint
The system SHALL expose a `DELETE /api/v1/posts/:id` endpoint that validates the ID, checks post existence, deletes the post, and returns the deleted post with 200 status. The service SHALL wrap repository calls in try/catch and return `Result.failure('INTERNAL_ERROR', ...)` on unexpected errors.

#### Scenario: Successfully delete a post
- **WHEN** a DELETE request is made to `/api/v1/posts/:id` with a valid ID of an existing post
- **THEN** the response status SHALL be 200, `success` SHALL be `true`, and `data` SHALL contain the deleted post

#### Scenario: Reject invalid ID
- **WHEN** a DELETE request is made to `/api/v1/posts/abc`
- **THEN** the response status SHALL be 400, `error.code` SHALL be `VALIDATION_ERROR`

#### Scenario: Post not found
- **WHEN** a DELETE request is made to `/api/v1/posts/999` and no post with id 999 exists
- **THEN** the response status SHALL be 404, `error.code` SHALL be `POST_NOT_FOUND`

#### Scenario: Deleted post disappears from list
- **WHEN** a post is deleted via DELETE and then GET `/api/v1/posts` is called
- **THEN** the deleted post SHALL NOT appear in the list response

#### Scenario: Handle database error gracefully
- **WHEN** a DELETE request is made and the repository throws an exception
- **THEN** the response status SHALL be 500, `error.code` SHALL be `INTERNAL_ERROR`

### Requirement: Frontend PostItem component with Delete button
Each post row SHALL be rendered by a `PostItem` component. The component SHALL display the post name, description, and a "Delete" button in the Action column. Clicking Delete SHALL call the `deletePost` RTK Query mutation. On success, a toast "Post deleted successfully" SHALL appear. On failure, a toast "Failed to delete post" SHALL appear. The mutation SHALL use `invalidatesTags: ['Posts']` to refresh the list.

#### Scenario: Delete button visible
- **WHEN** a post is displayed in the table
- **THEN** a "Delete" button SHALL be visible in the Action column

#### Scenario: Delete button calls mutation
- **WHEN** the user clicks the Delete button on a post
- **THEN** the `deletePost` mutation SHALL be called with the post's ID

#### Scenario: Loading state during delete
- **WHEN** the delete mutation is in progress
- **THEN** the Delete button SHALL display a spinner and be disabled

#### Scenario: Success toast on delete
- **WHEN** the delete mutation succeeds
- **THEN** a success toast "Post deleted successfully" SHALL appear

#### Scenario: Error toast on delete failure
- **WHEN** the delete mutation fails
- **THEN** a danger toast "Failed to delete post" SHALL appear
