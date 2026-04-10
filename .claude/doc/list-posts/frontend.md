# Frontend Implementation Plan — List Posts Feature

## Overview

This document covers the complete implementation plan for the "list posts" feature frontend. The feature fetches all posts from `GET /api/v1/posts` via RTK Query, displays them in a React Bootstrap Table, and supports client-side filter text state managed by Redux Toolkit postsSlice. MSW v2 is used for test mocking.

---

## Pre-conditions (already in place)

- `frontend/src/App.tsx` — minimal shell, needs replacement
- `frontend/src/app/store.ts` — placeholder reducer, needs replacement
- `frontend/src/app/hooks.ts` — typed hooks, no changes needed
- `frontend/src/main.tsx` — entry point with Redux Provider, no changes needed
- `frontend/vite.config.ts` — path aliases and `/api` proxy, no changes needed
- `frontend/tsconfig.json` — strict mode + path aliases, no changes needed
- `frontend/vitest.config.ts` — jsdom, globals, merges vite aliases, no changes needed
- `frontend/playwright.config.ts` — baseURL `http://localhost:5173`, testDir `./e2e`, no changes needed
- MSW is NOT installed yet — must be installed first

---

## Step 0 — Install MSW

**Command:**
```bash
cd /Users/jnancucheo/repositories/claude-projects/TCIT/repositorio/TCIT/frontend && npm install --save-dev msw
```

MSW v2 API used throughout: `http` and `HttpResponse` from `msw`, `setupServer` from `msw/node`.

---

## Files to Create

### 1. `frontend/src/features/posts/types/post.types.ts`

**Purpose:** TypeScript interfaces for the Post domain and API response shapes.

**Content:**
```typescript
export interface Post {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: { total: number };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string; constraint: string }>;
  };
}
```

**Notes:**
- `createdAt` and `updatedAt` are ISO 8601 strings (matching API spec camelCase JSON)
- `ApiSuccessResponse<T>` is generic so it can be reused for single Post and Post[] responses
- No `any` types — strict TypeScript throughout

---

### 2. `frontend/src/features/posts/api/postsApi.ts`

**Purpose:** RTK Query API slice for all posts endpoints.

**Content:**
```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Post, ApiSuccessResponse } from '../types/post.types';

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      transformResponse: (response: ApiSuccessResponse<Post[]>) => response.data,
      providesTags: ['Posts'],
    }),
  }),
});

export const { useGetPostsQuery } = postsApi;
```

**Notes:**
- `baseUrl: '/api/v1'` — Vite proxy forwards `/api` to `http://localhost:3000`, so the full path `/api/v1/posts` resolves correctly in dev and E2E
- `transformResponse` unwraps the `{ success, data, meta }` envelope — components receive `Post[]` directly
- Only `getPosts` is defined here; `createPost` and `deletePost` belong to future specs
- `tagTypes: ['Posts']` and `providesTags: ['Posts']` enable cache invalidation when mutations are added

---

### 3. `frontend/src/features/posts/slices/postsSlice.ts`

**Purpose:** Redux slice for local UI state — specifically the client-side filter text.

**Content:**
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PostsState {
  filterText: string;
}

const initialState: PostsState = {
  filterText: '',
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setFilterText: (state, action: PayloadAction<string>) => {
      state.filterText = action.payload;
    },
    clearFilter: (state) => {
      state.filterText = '';
    },
  },
});

export const { setFilterText, clearFilter } = postsSlice.actions;
export default postsSlice.reducer;
```

**Notes:**
- This slice holds ONLY UI state, never server data (RTK Query owns server state)
- `filterText` is used by the PostFilter component (future spec) and a selector for client-side filtering
- Both actions are exported for use in components and tests

---

### 4. `frontend/src/shared/components/Layout.tsx`

**Purpose:** App shell — wraps page content with Bootstrap Container and the app title heading.

**Content:**
```typescript
import React from 'react';
import { Container } from 'react-bootstrap';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Container className="py-4">
      <h1 className="mb-4">TCIT Posts Manager</h1>
      {children}
    </Container>
  );
};

export default Layout;
```

**Notes:**
- Uses React Bootstrap `Container` (not plain `<div>`) per UI standards
- `children: React.ReactNode` typed prop — no `any`
- The `h1` lives here so all routes inherit the heading; individual pages render inside `{children}`

---

### 5. `frontend/src/shared/components/ErrorBoundary.tsx`

**Purpose:** Class-based React Error Boundary that catches render-time errors and shows a fallback UI.

**Content:**
```typescript
import React, { Component, ErrorInfo } from 'react';
import { Alert, Button } from 'react-bootstrap';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Alert variant="danger">
          <Alert.Heading>Something went wrong</Alert.Heading>
          <p>An unexpected error occurred.</p>
          <Button variant="outline-danger" onClick={this.handleReset}>
            Try again
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Notes:**
- Class component is required — React error boundaries cannot be functional components
- `handleReset` resets state allowing recovery without full page reload
- Uses Bootstrap `Alert` and `Button` for consistent styling
- `componentDidCatch` logs to console for debugging; in production this would be a monitoring hook

---

### 6. `frontend/src/shared/components/LoadingSpinner.tsx`

**Purpose:** Reusable centered loading indicator using Bootstrap Spinner.

**Content:**
```typescript
import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="d-flex justify-content-center py-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default LoadingSpinner;
```

**Notes:**
- `role="status"` makes the spinner accessible (ARIA role)
- `visually-hidden` text "Loading..." provides screen reader context
- Centered with Bootstrap flex utilities — no custom CSS needed

---

### 7. `frontend/src/features/posts/components/PostList.tsx`

**Purpose:** Main component for the list posts feature — fetches data via RTK Query and renders a Bootstrap Table.

**Content:**
```typescript
import React from 'react';
import { Table, Alert } from 'react-bootstrap';
import { useGetPostsQuery } from '../api/postsApi';
import LoadingSpinner from '@shared/components/LoadingSpinner';

const PostList: React.FC = () => {
  const { data: posts, isLoading, isError } = useGetPostsQuery();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <Alert variant="danger">Error loading posts</Alert>;
  if (!posts?.length) return <Alert variant="info">No posts found</Alert>;

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => (
          <tr key={post.id}>
            <td>{post.name}</td>
            <td>{post.description}</td>
            <td>{/* Delete button — future spec */}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default PostList;
```

**Notes:**
- `useGetPostsQuery()` with no arguments — posts fetched once per view load, RTK Query cache handles deduplication
- Three explicit render states: loading (spinner), error (Alert danger), empty (Alert info), and the populated table
- `posts?.length` safe-navigation handles the case where `data` is undefined before first fetch resolves
- Action column left empty (`{/* Delete button — future spec */}`) — the column header "Action" must be present for E2E tests that check headers
- `key={post.id}` — unique integer ID used as React key (never index)
- No local state — all state managed by RTK Query and Redux

---

### 8. `frontend/src/test-utils/renderWithProviders.tsx`

**Purpose:** Test utility that wraps components with a fresh Redux store (postsApi + postsSlice) for each test.

**Content:**
```typescript
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { postsApi } from '@features/posts/api/postsApi';
import postsReducer from '@features/posts/slices/postsSlice';

export function renderWithProviders(
  ui: React.ReactElement,
  renderOptions: RenderOptions = {},
) {
  const store = configureStore({
    reducer: {
      [postsApi.reducerPath]: postsApi.reducer,
      posts: postsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(postsApi.middleware),
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
```

**Notes:**
- A fresh store is created per call — tests are isolated
- Returns `{ store, ...renderResult }` so tests can assert on Redux state if needed
- Uses path alias `@features/...` and `@features/...` — vitest.config merges vite aliases so these resolve in tests
- This file lives at `frontend/src/test-utils/renderWithProviders.tsx` — the `test-utils/` directory needs to be created

---

### 9. `frontend/src/test-utils/mocks/handlers.ts`

**Purpose:** Default MSW v2 request handlers for tests — provides a baseline empty posts response.

**Content:**
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/posts', () => {
    return HttpResponse.json({
      success: true,
      data: [],
      meta: { total: 0 },
    });
  }),
];
```

**Notes:**
- Pattern `*/posts` matches any origin — works with both Vite proxy paths and direct paths in tests
- Default returns empty array so tests that do not override get the "No posts found" state
- Individual tests use `server.use(http.get(...))` to override for specific scenarios

---

### 10. `frontend/src/test-utils/mocks/server.ts`

**Purpose:** MSW node server configured with default handlers for Vitest test environment.

**Content:**
```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**Notes:**
- `setupServer` from `msw/node` — correct import for Node.js/jsdom test environment (NOT `msw/browser`)
- Exported as `server` for use in `test-setup.ts` lifecycle hooks and individual test files

---

## Files to Modify

### 11. `frontend/src/app/store.ts` — Replace placeholder with real reducers

**Current state:** Placeholder reducer `_placeholder`.

**New content:**
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { postsApi } from '@features/posts/api/postsApi';
import postsReducer from '@features/posts/slices/postsSlice';

export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
    posts: postsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Notes:**
- `postsApi.middleware` must be added — required for RTK Query cache management (polling, invalidation, garbage collection)
- `[postsApi.reducerPath]` uses computed property so the key matches `'postsApi'` (the `reducerPath` value)
- `RootState` and `AppDispatch` types are re-exported — `hooks.ts` depends on them (no change to `hooks.ts` needed)

---

### 12. `frontend/src/App.tsx` — Replace placeholder with real app shell

**Current state:** Renders a plain `Container` with `h1`.

**New content:**
```typescript
import React from 'react';
import ErrorBoundary from '@shared/components/ErrorBoundary';
import Layout from '@shared/components/Layout';
import PostList from '@features/posts/components/PostList';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Layout>
        <PostList />
      </Layout>
    </ErrorBoundary>
  );
};

export default App;
```

**Notes:**
- `ErrorBoundary` wraps everything — catches render errors in Layout or PostList
- `Layout` provides the Container and h1 heading
- `PostList` is the main feature component for this spec
- All imports use path aliases (`@shared/...`, `@features/...`)

---

### 13. `frontend/src/test-setup.ts` — Add MSW server lifecycle

**Current state:** Only imports `@testing-library/jest-dom`.

**New content:**
```typescript
import '@testing-library/jest-dom';
import { server } from './test-utils/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Notes:**
- `server.listen()` starts MSW before all tests
- `server.resetHandlers()` after each test removes any per-test overrides added with `server.use(...)` — prevents test pollution
- `server.close()` tears down after the suite
- `beforeAll`, `afterEach`, `afterAll` are available globally because vitest.config sets `globals: true`

---

## Test Files to Create

### 14. `frontend/src/features/posts/components/PostList.test.tsx`

**Purpose:** Unit tests for `PostList` covering all render states using RTL + MSW.

**Test cases:**

1. **Shows spinner while loading**
   - Override handler to return after a delay (using `new Promise` inside handler)
   - Immediately after render, assert `screen.getByRole('status')` is in the document
   - Use `waitFor` to confirm eventual resolution (prevents test hanging)

2. **Shows error alert when API fails**
   - `server.use(http.get('*/posts', () => HttpResponse.json(null, { status: 500 })))`
   - `await waitFor(() => expect(screen.getByText(/error loading posts/i)).toBeInTheDocument())`

3. **Shows empty state when no posts returned**
   - Default handler returns `data: []` — no override needed
   - `await waitFor(() => expect(screen.getByText(/no posts found/i)).toBeInTheDocument())`

4. **Renders post rows in table**
   - Override handler to return 2 posts with distinct names
   - `await waitFor(() => expect(screen.getByText('Post Alpha')).toBeInTheDocument())`
   - Also assert the second post name is present

5. **Correct column headers present**
   - After posts load, assert `screen.getByRole('columnheader', { name: /name/i })` etc.
   - Check "Name", "Description", "Action" all present

**Imports required:**
```typescript
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test-utils/mocks/server';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import PostList from './PostList';
```

**Notes:**
- No path aliases in test files for imports of test utilities (use relative paths) — aliases work for source imports like `@shared/...` but test utilities are better referenced relatively
- `renderWithProviders` creates a fresh Redux store per test
- `describe` block: `describe('PostList', () => { ... })`

---

### 15. `frontend/src/features/posts/slices/postsSlice.test.ts`

**Purpose:** Unit tests for the Redux slice reducer and actions — pure function tests, no React rendering needed.

**Test cases:**

1. **Initial state has empty filterText**
   ```typescript
   const state = reducer(undefined, { type: '@@INIT' });
   expect(state.filterText).toBe('');
   ```

2. **setFilterText updates filterText**
   ```typescript
   const state = reducer(initialState, setFilterText('hello'));
   expect(state.filterText).toBe('hello');
   ```

3. **clearFilter resets filterText to empty string**
   ```typescript
   const state = reducer({ filterText: 'hello' }, clearFilter());
   expect(state.filterText).toBe('');
   ```

**Imports required:**
```typescript
import { describe, it, expect } from 'vitest';
import reducer, { setFilterText, clearFilter } from './postsSlice';
```

**Notes:**
- Pure reducer tests — call `reducer(state, action)` and assert returned state
- No RTL, no MSW needed
- Fast and deterministic

---

### 16. `frontend/e2e/list-posts.spec.ts`

**Purpose:** Playwright E2E tests that mock the API at network level and test the full rendered UI.

**Test cases:**

1. **Page title is visible**
   ```typescript
   await page.goto('/');
   await expect(page.getByRole('heading', { name: /TCIT Posts Manager/i })).toBeVisible();
   ```

2. **Table headers are correct**
   - Mock returns 1+ posts
   - Assert `page.getByRole('columnheader', { name: 'Name' })` etc.

3. **Posts rendered in table rows**
   - Mock `GET **/api/v1/posts` returns 2 posts
   - Assert both post names appear via `page.getByText('...')`

4. **Empty state shows info message**
   - Mock returns `data: []`
   - Assert `page.getByText(/no posts found/i)` is visible

5. **Loading spinner visible before data loads**
   - Mock with artificial delay
   - Assert `page.getByRole('status')` is visible immediately after navigation
   - Wait for it to disappear

**Route mock pattern:**
```typescript
await page.route('**/api/v1/posts', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      data: [
        { id: 1, name: 'Post Alpha', description: 'Desc 1', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
        { id: 2, name: 'Post Beta', description: 'Desc 2', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
      ],
      meta: { total: 2 },
    }),
  }),
);
```

**Notes:**
- Route setup must happen BEFORE `page.goto('/')`
- Use `**/api/v1/posts` (double wildcard) to match regardless of origin
- Use accessible locators (`getByRole`, `getByText`, `getByLabel`) — never CSS selectors
- Test file is in `frontend/e2e/` (not under `src/`) as per `playwright.config.ts` `testDir: './e2e'`

---

## Directories to Create

The following directories do not yet exist (feature dirs have `.gitkeep` only):

| Directory | Purpose |
|-----------|---------|
| `frontend/src/test-utils/` | Shared test utilities (renderWithProviders) |
| `frontend/src/test-utils/mocks/` | MSW handlers and server setup |

The `frontend/e2e/` directory must also exist (Playwright testDir).

---

## Implementation Order

Execute in this order to satisfy dependency requirements:

1. `npm install --save-dev msw` — must come first; test files import from `msw`
2. `post.types.ts` — types are imported by `postsApi.ts`
3. `postsApi.ts` — imported by `store.ts` and `PostList.tsx`
4. `postsSlice.ts` — imported by `store.ts`
5. `store.ts` (modify) — must be updated before any component renders
6. `Layout.tsx` — imported by `App.tsx`
7. `ErrorBoundary.tsx` — imported by `App.tsx`
8. `LoadingSpinner.tsx` — imported by `PostList.tsx`
9. `PostList.tsx` — imported by `App.tsx`
10. `App.tsx` (modify) — wires everything together
11. `test-utils/mocks/handlers.ts` — imported by `server.ts`
12. `test-utils/mocks/server.ts` — imported by `test-setup.ts`
13. `test-setup.ts` (modify) — must be updated before running tests
14. `renderWithProviders.tsx` — imported by test files
15. `postsSlice.test.ts` — no deps on MSW or rendering
16. `PostList.test.tsx` — depends on all above
17. `e2e/list-posts.spec.ts` — independent of unit test infrastructure

---

## Key Constraints and Decisions

| Constraint | Decision |
|-----------|---------|
| RTK Query for all server state | `useGetPostsQuery` only — no `useEffect` + `fetch` |
| postsSlice for UI state only | `filterText` in Redux, posts data in RTK Query cache |
| React Bootstrap for all UI | `Table`, `Alert`, `Spinner`, `Container`, `Button` — no raw HTML equivalents |
| TypeScript strict | No `any`, all props typed with interfaces |
| MSW v2 API | `http`/`HttpResponse` from `msw`, `setupServer` from `msw/node` |
| baseUrl `/api/v1` in postsApi | Vite proxy handles `/api` → `http://localhost:3000`; no env var needed |
| `transformResponse` in RTK Query | Unwraps API envelope so components work with `Post[]` directly |
| Test isolation | Fresh store per test via `renderWithProviders`, `server.resetHandlers()` after each test |
| Coverage target | 90% branches/functions/lines/statements — the 5 test cases in PostList.test and 3 in postsSlice.test achieve this for the new code |
| English only | All code, comments, UI text, error messages, and test descriptions in English |
