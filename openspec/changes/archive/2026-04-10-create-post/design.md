## Context

The TCIT Posts Manager can list posts (spec 02) but has no way to create them. The backend has the full infrastructure: `PrismaPostRepository.save()`, `Post` entity, `CreatePostDto`, `Result<T>` pattern. The frontend has RTK Query with `Posts` cache tag, React Bootstrap, and React Hook Form + Zod already installed. This change adds the write path across all layers.

The existing `postController.ts` and `postService.ts` use module-scoped dependency wiring. The `application/validators/` directory exists but is empty.

## Goals / Non-Goals

**Goals:**
- Expose `POST /api/v1/posts` with centralized validation, uniqueness check, and proper error code mapping
- Create a PostForm component with client-side Zod validation and server-side error display
- Implement toast notification system for success/error user feedback
- Automatic list refresh via RTK Query cache invalidation on successful create
- Achieve 90% test coverage across all new code

**Non-Goals:**
- Edit/update post functionality
- Pagination or server-side filtering
- File uploads or rich text in description
- Authentication or authorization

## Decisions

### 1. Validation in the service layer, not the controller

Validation is called inside `PostService.create()` rather than in the controller. The controller simply passes `req.body` to the service.

**Rationale:** Keeps controllers thin (per architecture rules). The service owns the business logic, and validation is part of determining whether a create operation can proceed. The validator is a pure function imported by the service.

**Alternative considered:** Validate in controller before calling service. Rejected because it splits business logic across layers and the controller would need to know about validation details.

### 2. Backend rejects untrimmed names; frontend auto-trims

The backend validator has an `isTrimmed` check that rejects names with leading/trailing whitespace. The frontend Zod schema uses `.trim()` which auto-trims before validation.

**Rationale:** Defence in depth. The frontend provides a good UX by silently trimming. The backend enforces the contract for API consumers that bypass the frontend. The service layer does no trimming — it trusts the validator.

**Alternative considered:** Trim in the service layer. Rejected because it would silently accept `" name "` as `"name"`, potentially causing confusion when the stored value differs from the submitted value.

### 3. Toast notifications via React Context, not Redux

Toast state uses a React Context + useReducer pattern rather than a Redux slice.

**Rationale:** Toast notifications are ephemeral UI state (auto-dismiss after 3 seconds). They don't need Redux's time-travel debugging, persistence, or cross-feature access. A Context keeps the toast system self-contained in `shared/components/` without coupling to the Redux store.

**Alternative considered:** Redux slice for toasts. Rejected as over-engineering for transient notifications that no other feature needs to read.

### 4. PostForm renders above PostList

The form appears above the table in the layout. The user flow is: fill form → submit → see new post appear at the top of the table below.

**Rationale:** Natural top-down reading flow. The form is always visible (not behind a modal or toggle), which matches the inline `[Name] [Description] [Create]` layout from the spec.

### 5. API error details mapped to form fields via `setError()`

When the backend returns `VALIDATION_ERROR` with a `details` array, each detail's `field` and `message` are mapped to React Hook Form's `setError()`. For `POST_ALREADY_EXISTS` (409), a toast error is shown instead.

**Rationale:** Field-level errors (400) belong under the form field. Entity-level errors (409 duplicate) are not tied to a specific field, so a toast is the appropriate feedback mechanism.

### 6. Error status mapping via inline Record in controller

The controller uses an inline `Record<string, number>` to map error codes to HTTP statuses, matching the pattern in the enriched spec.

**Rationale:** Simple, readable, and co-located with the response logic. A shared utility is unnecessary until more controllers exist with the same mapping needs.

## Risks / Trade-offs

- **[Risk] Zod trim vs backend reject mismatch** → Users who call the API directly (not via frontend) may be confused when `" name "` is rejected. Mitigated by clear error message: "Name must not have leading or trailing whitespace".

- **[Risk] Toast auto-dismiss too fast** → 3-second auto-dismiss may be missed if user is not looking. Mitigated: toasts have a close button for manual dismiss if needed.

- **[Trade-off] ToastContext adds a provider to the component tree** → Minimal overhead. The context only re-renders components that call `useToast()`, not the entire tree.

- **[Trade-off] Validation in service means controller tests need to mock the full service** → Acceptable. Controller unit tests already mock the service via module-scoped prisma. Integration tests exercise the full stack.
