# Role

You are an expert frontend architect with extensive experience in React 18, TypeScript, Redux Toolkit + RTK Query, React Bootstrap, and modern testing practices.

# Ticket ID

$ARGUMENTS

# Goal

Obtain a step-by-step plan for a ticket that is ready to start implementing.

# Process and Rules

1. Adopt the role of `ai-specs/.agents/frontend-developer.md`
2. Analyze the ticket mentioned in $ARGUMENTS. If the mention is a local file, read it directly.
3. Propose a step-by-step plan for the frontend part, taking into account everything mentioned in the ticket and applying the project's best practices from `ai-specs/specs/`.
4. Apply the best practices of your role to ensure the developer can be fully autonomous and implement the ticket end-to-end using only your plan.
5. Do not write code yet; provide only the plan in the output format defined below.
6. If asked to implement, first create a branch: `git checkout -b feature/<ticket-id>-frontend`

# Output Format

Markdown document at the path `openspec/changes/<ticket-id>_frontend.md` containing the complete implementation details.
Follow this template:

## Frontend Implementation Plan Ticket Template Structure

### 1. **Header**
- Title: `# Frontend Implementation Plan: <TICKET-ID> <Feature Name>`

### 2. **Overview**
- Brief description of the feature and frontend architecture principles
- Feature-based architecture: `features/posts/` with api, components, hooks, slices, types

### 3. **Architecture Context**
- Components/files involved
- RTK Query endpoints affected
- Redux slices needed
- Routing considerations

### 4. **Implementation Steps**

#### **Step 0: Create Feature Branch**
- **Action**: Create and switch to a new feature branch
- **Branch Naming**: `feature/<ticket-id>-frontend`
- **Steps**:
  1. Ensure you're on latest `main`: `git pull origin main`
  2. Create branch: `git checkout -b feature/<ticket-id>-frontend`

#### **Step N: [Action Name]**
- **File**: Target file path
- **Action**: What to implement
- **Component/Function Signature**: TypeScript signature
- **Implementation Steps**: Numbered list
- **Dependencies**: Required imports
- **Notes**: Technical details, patterns to follow

Common steps:
- **Step 1**: Define TypeScript types in `features/posts/types/`
- **Step 2**: Create/Update RTK Query endpoints in `features/posts/api/`
- **Step 3**: Create/Update Redux slice in `features/posts/slices/` (if local UI state needed)
- **Step 4**: Create/Update React components in `features/posts/components/`
- **Step 5**: Add form validation with React Hook Form + Zod
- **Step 6**: Update routing in `App.tsx` (if new routes needed)
- **Step 7**: Write unit tests (Vitest + React Testing Library) in `tests/`
- **Step 8**: Write E2E tests (Playwright) in `e2e/`

#### **Step N+1: Update Technical Documentation**
- **Action**: Review and update documentation
- **Steps**:
  1. API changes → Update `ai-specs/specs/api-spec.yml`
  2. UI/UX patterns → Update `ai-specs/specs/frontend-standards.md`
  3. New dependencies → Update `ai-specs/specs/frontend-standards.md`
  4. Test patterns → Update testing documentation
- **References**: Follow `ai-specs/specs/documentation-standards.md`
- **Notes**: MANDATORY before implementation is considered complete

### 5. **Implementation Order**
- Numbered list of steps in sequence
- Start with Step 0 (branch creation), end with documentation update
- Tests before documentation

### 6. **Testing Checklist**
- [ ] Unit tests (Vitest + RTL) — components render correctly
- [ ] Loading and error states tested
- [ ] Form validation tested
- [ ] User interactions tested (create, delete, filter)
- [ ] E2E tests (Playwright) — complete user flows
- [ ] 90% coverage target met

### 7. **Error Handling Patterns**
- RTK Query `isError`/`error` states in components
- Error Boundary for render crashes
- Zod validation errors in forms
- Toast notifications for user feedback

### 8. **UI/UX Considerations**
- React Bootstrap component usage
- Responsive design with Container/Row/Col
- Accessibility (aria-labels, keyboard navigation)
- Loading states with Spinner
- Alert components for feedback

### 9. **Dependencies**
- React Bootstrap components used
- RTK Query hooks needed
- Third-party packages (if any — justify each)

### 10. **Notes**
- All code, comments, and labels in English
- TypeScript strict mode — no `any`
- Functional components only with hooks
- Feature-based architecture

### 11. **Next Steps After Implementation**
- Integration with backend
- Deployment considerations

### 12. **Implementation Verification**
Final checklist:
- **Code Quality**: TypeScript strict, no `any`, follows naming conventions
- **Functionality**: All acceptance criteria met
- **RTK Query**: All server state via RTK Query, no manual useEffect fetching
- **Forms**: React Hook Form + Zod, no manual onChange
- **Testing**: 90% coverage, unit + E2E tests pass
- **Documentation**: All affected docs updated
- **Build**: `npm run lint && npm run build` passes
