## Context

The TCIT Posts Manager supports listing and creating posts. The backend has `PrismaPostRepository.delete()` already implemented (returns the deleted post or null for P2025). The controller has a module-scoped `ERROR_STATUS_MAP` with `POST_NOT_FOUND: 404`. The frontend PostList renders inline `<tr>` rows with a `{/* Delete button — future spec */}` placeholder. The toast system (ToastContext) is already in place.

## Goals / Non-Goals

**Goals:**
- Expose `DELETE /api/v1/posts/:id` with ID validation and existence check
- Add Delete button per row with loading spinner and toast feedback
- Extract PostItem component for single-row rendering with delete logic
- Automatic list refresh via RTK Query cache invalidation
- 90% test coverage across all new code

**Non-Goals:**
- Confirmation dialog before delete (delete is immediate)
- Soft delete / undo functionality
- Bulk delete
- Archive/restore

## Decisions

### 1. ID validation in the service, not the controller

Following the same pattern as `create()`, the `delete()` method receives `req.params.id` as `unknown` and the service calls `validatePostId()` internally. The controller stays thin.

**Rationale:** Consistency with `create()` pattern. Validation is a business concern — the service decides what constitutes a valid ID.

### 2. Reuse existing ERROR_STATUS_MAP

The controller's `delete()` method uses the existing module-scoped `ERROR_STATUS_MAP` rather than creating a new inline map. The map already contains `POST_NOT_FOUND: 404`.

**Rationale:** DRY — the map was extracted to module scope specifically for reuse across controller methods.

### 3. Check existence before delete

The service calls `findById()` before `delete()` to provide a user-friendly 404 error. This adds one extra query but gives clear feedback.

**Rationale:** The `PrismaPostRepository.delete()` catches Prisma's P2025 error and returns null, but the service needs to distinguish "not found" from "deleted successfully". Checking existence first provides explicit error code differentiation.

**Alternative considered:** Call `delete()` directly and check for null return. Rejected because it conflates "not found" with potential other failure modes.

### 4. Extract PostItem as a separate component

Each table row becomes a `PostItem` component that owns its own delete mutation state (`isLoading`, error handling). This isolates the per-row loading spinner so other rows aren't affected during a delete.

**Rationale:** If delete logic were in PostList, all rows would share the same `isLoading` state. PostItem encapsulates per-row state cleanly.

### 5. No confirmation dialog

Delete is immediate upon button click. The toast system provides feedback ("Post deleted successfully") and the cache invalidation removes the row.

**Rationale:** Per spec design. The app is for a developer challenge, not production — simplicity over caution. If needed later, a confirmation modal can be added to PostItem without changing the API layer.

## Risks / Trade-offs

- **[Risk] Accidental deletion** → Mitigated: toast feedback gives immediate awareness. No undo, but posts can be re-created.

- **[Trade-off] Extra query for existence check** → Negligible performance impact for a single-entity lookup by primary key. Gains clear error semantics.

- **[Trade-off] PostList tests may need minor updates** → PostList tests mock the RTK Query hook, so PostItem is rendered as a child. The existing "table rows" test may need to check for Delete button presence. PostItem gets its own dedicated test suite.
