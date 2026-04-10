## ADDED Requirements

### Requirement: Backend validates create post input
The system SHALL validate all input fields before creating a post. The validator (`validateCreatePost`) SHALL return a `ValidationResult` with `isValid` boolean and `errors` array. Validation rules:
- `body`: MUST be a non-null object
- `name`: MUST be a non-empty string, max 255 characters, no leading/trailing whitespace
- `description`: MUST be a non-empty string, max 2000 characters

#### Scenario: Valid input passes validation
- **WHEN** `validateCreatePost` is called with `{ name: "Post", description: "Desc" }`
- **THEN** `isValid` SHALL be `true` and `errors` SHALL be empty

#### Scenario: Empty name rejected
- **WHEN** `validateCreatePost` is called with `{ name: "", description: "Desc" }`
- **THEN** `isValid` SHALL be `false` with error on field `name`, constraint `isNotEmpty`

#### Scenario: Missing name rejected
- **WHEN** `validateCreatePost` is called with `{ description: "Desc" }` (no name field)
- **THEN** `isValid` SHALL be `false` with error on field `name`, constraint `isNotEmpty`

#### Scenario: Name exceeding 255 characters rejected
- **WHEN** `validateCreatePost` is called with a name of 256 characters
- **THEN** `isValid` SHALL be `false` with error on field `name`, constraint `maxLength`

#### Scenario: Name at exactly 255 characters accepted
- **WHEN** `validateCreatePost` is called with a name of exactly 255 characters
- **THEN** `isValid` SHALL be `true`

#### Scenario: Untrimmed name rejected
- **WHEN** `validateCreatePost` is called with `{ name: " Post ", description: "Desc" }`
- **THEN** `isValid` SHALL be `false` with error on field `name`, constraint `isTrimmed`

#### Scenario: Non-string name rejected
- **WHEN** `validateCreatePost` is called with `{ name: 123, description: "Desc" }`
- **THEN** `isValid` SHALL be `false` with error on field `name`, constraint `isString`

#### Scenario: Empty description rejected
- **WHEN** `validateCreatePost` is called with `{ name: "Post", description: "" }`
- **THEN** `isValid` SHALL be `false` with error on field `description`, constraint `isNotEmpty`

#### Scenario: Description exceeding 2000 characters rejected
- **WHEN** `validateCreatePost` is called with a description of 2001 characters
- **THEN** `isValid` SHALL be `false` with error on field `description`, constraint `maxLength`

#### Scenario: Non-string description rejected
- **WHEN** `validateCreatePost` is called with `{ name: "Post", description: 123 }`
- **THEN** `isValid` SHALL be `false` with error on field `description`, constraint `isString`

#### Scenario: Null body rejected
- **WHEN** `validateCreatePost` is called with `null`
- **THEN** `isValid` SHALL be `false` with error on field `body`, constraint `isNotEmpty`

#### Scenario: Multiple errors returned together
- **WHEN** `validateCreatePost` is called with `{ name: "", description: "" }`
- **THEN** `isValid` SHALL be `false` with at least 2 errors (one for each field)

### Requirement: Backend creates a post via POST endpoint
The system SHALL expose a `POST /api/v1/posts` endpoint that validates input, checks name uniqueness, creates the post, and returns it with 201 status. The service SHALL wrap repository calls in try/catch and return `Result.failure('INTERNAL_ERROR', ...)` on unexpected errors, logging the error with Pino.

#### Scenario: Successfully create a post
- **WHEN** a POST request is made to `/api/v1/posts` with `{ name: "New Post", description: "Content" }` and no post with that name exists
- **THEN** the response status SHALL be 201, `success` SHALL be `true`, and `data` SHALL contain the created post with `id`, `name`, `description`, `createdAt`, `updatedAt`

#### Scenario: Reject invalid input
- **WHEN** a POST request is made with `{ name: "", description: "" }`
- **THEN** the response status SHALL be 400, `error.code` SHALL be `VALIDATION_ERROR`, and `error.details` SHALL contain field-level errors

#### Scenario: Reject duplicate name
- **WHEN** a POST request is made with a name that already exists in the database
- **THEN** the response status SHALL be 409, `error.code` SHALL be `POST_ALREADY_EXISTS`

#### Scenario: Handle database error gracefully
- **WHEN** a POST request is made and the repository throws an exception
- **THEN** the response status SHALL be 500, `error.code` SHALL be `INTERNAL_ERROR`, and internal error details SHALL NOT be exposed

#### Scenario: Created post appears in list
- **WHEN** a post is created via POST and then GET `/api/v1/posts` is called
- **THEN** the newly created post SHALL appear in the list response

### Requirement: Frontend displays a create post form
The `PostForm` component SHALL render an inline form with Name input, Description input, and Create button in a Bootstrap Row layout. The form SHALL use React Hook Form with Zod validation schema.

#### Scenario: Form fields visible
- **WHEN** the PostForm component renders
- **THEN** a Name input, Description input, and "Create" button SHALL be visible

#### Scenario: Client-side validation on empty submit
- **WHEN** the user clicks Create without filling any fields
- **THEN** "Name is required" and "Description is required" error messages SHALL appear under the respective fields, and no API call SHALL be made

#### Scenario: Client-side validation on name too long
- **WHEN** the user enters a name exceeding 255 characters and clicks Create
- **THEN** "Name must not exceed 255 characters" error SHALL appear under the name field

### Requirement: Frontend handles create post submission
The `PostForm` component SHALL call the `createPost` RTK Query mutation on valid submit. On success, the form SHALL reset and a success toast SHALL appear. On 409 conflict, an error toast SHALL appear. The mutation SHALL use `invalidatesTags: ['Posts']` to refresh the posts list automatically.

#### Scenario: Successful creation
- **WHEN** the user submits valid data and the API returns 201
- **THEN** the form fields SHALL be cleared, a success toast "Post created successfully" SHALL appear, and the posts table SHALL refresh showing the new post

#### Scenario: Duplicate name error
- **WHEN** the user submits a name that already exists and the API returns 409
- **THEN** an error toast with the API error message SHALL appear

#### Scenario: Submit button loading state
- **WHEN** the create mutation is in progress
- **THEN** the Create button SHALL display a spinner and be disabled

#### Scenario: Form resets after success
- **WHEN** the post is created successfully
- **THEN** both the Name and Description fields SHALL be empty

### Requirement: Toast notification system
The application SHALL provide a toast notification system using React Context. Toasts SHALL appear at the top-end position, auto-dismiss after 3 seconds, and support `success`, `danger`, and `warning` variants.

#### Scenario: Success toast displayed
- **WHEN** `addToast("message", "success")` is called
- **THEN** a Bootstrap Toast with `bg="success"` SHALL appear at the top-end position

#### Scenario: Toast auto-dismisses
- **WHEN** a toast is displayed
- **THEN** it SHALL automatically disappear after 3 seconds

#### Scenario: Multiple toasts
- **WHEN** multiple toasts are triggered
- **THEN** all active toasts SHALL be visible simultaneously in a stacked layout

### Requirement: App renders PostForm above PostList
The `App.tsx` component SHALL render `PostForm` above `PostList` inside the Layout, wrapped with a `ToastProvider`. The `ToastContainer` SHALL render outside the Layout for proper positioning.

#### Scenario: PostForm visible above table
- **WHEN** the user navigates to `/`
- **THEN** the create form SHALL appear above the posts table
