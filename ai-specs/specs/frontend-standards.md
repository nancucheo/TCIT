---
description: Frontend development standards for TCIT Posts Manager — React 18, TypeScript, Redux Toolkit, RTK Query, Vite, React Bootstrap, testing
globs: ["frontend/src/**/*.{ts,tsx}", "frontend/e2e/**/*.ts", "frontend/tsconfig.json", "frontend/package.json"]
alwaysApply: true
---

# Frontend Standards — TCIT Posts Manager

## Table of Contents

- [Technology Stack](#technology-stack)
- [Architecture: Feature-Based](#architecture-feature-based)
- [Redux Toolkit + RTK Query](#redux-toolkit--rtk-query)
- [Component Conventions](#component-conventions)
- [Form Handling: React Hook Form + Zod](#form-handling-react-hook-form--zod)
- [UI/UX Standards (React Bootstrap)](#uiux-standards-react-bootstrap)
- [Error Handling](#error-handling)
- [Naming Conventions](#naming-conventions)
- [Testing Standards](#testing-standards)
- [Configuration Standards](#configuration-standards)
- [Performance Best Practices](#performance-best-practices)
- [Development Workflow](#development-workflow)

---

## Technology Stack

| Component        | Technology                    |
|-----------------|-------------------------------|
| Framework       | React 18                       |
| Language        | TypeScript (strict mode)       |
| State Management| Redux Toolkit + RTK Query      |
| UI Framework    | React Bootstrap 5              |
| Forms           | React Hook Form + Zod          |
| Build Tool      | Vite                           |
| Routing         | React Router DOM v7            |
| Unit Testing    | Vitest + React Testing Library |
| E2E Testing     | Playwright                     |

## Architecture: Feature-Based

```
frontend/src/
├── app/                    # Store config, typed hooks
│   ├── store.ts            # Redux store configuration
│   └── hooks.ts            # useAppDispatch, useAppSelector
├── features/posts/         # All post-related code
│   ├── api/postsApi.ts     # RTK Query endpoints
│   ├── components/         # PostForm, PostFilter, PostList, PostItem
│   ├── hooks/              # usePostFilter
│   ├── slices/postsSlice.ts # Filter state
│   └── types/post.types.ts # Post, CreatePostDto
├── shared/                 # Reusable: ErrorBoundary, Layout, Toast, LoadingSpinner
├── App.tsx                 # Root with routing
└── main.tsx                # Entry point
```

## Redux Toolkit + RTK Query

The challenge requires Redux. We use Redux Toolkit (modern Redux) with RTK Query for API calls:

```typescript
// features/posts/api/postsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Post, CreatePostDto, PostListResponse, PostResponse } from '../types/post.types';

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    getPosts: builder.query<PostListResponse, void>({
      query: () => '/posts',
      providesTags: ['Posts'],
    }),
    createPost: builder.mutation<PostResponse, CreatePostDto>({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: ['Posts'],
    }),
    deletePost: builder.mutation<PostResponse, number>({
      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Posts'],
    }),
  }),
});

export const { useGetPostsQuery, useCreatePostMutation, useDeletePostMutation } = postsApi;
```

**Rules:**
- RTK Query for ALL API calls — never manual fetch in useEffect for server data
- Local UI state (filter text) in postsSlice via createSlice
- Posts list called ONCE per view load (RTK Query cache handles this)
- Filtering done client-side using Redux selector

### Store Configuration

```typescript
// app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { postsApi } from '../features/posts/api/postsApi';
import postsReducer from '../features/posts/slices/postsSlice';

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

## Component Conventions

- **Functional components only** with hooks
- **TypeScript strict** — no `any`, proper interfaces for all props
- **PascalCase** for component files and names
- **React Bootstrap** for UI consistency (Container, Row, Col, Form, Button, Table, Alert)
- All text and labels in **English**

```typescript
import React from 'react';
import { Button } from 'react-bootstrap';

interface PostItemProps {
  post: Post;
  onDelete: (id: number) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onDelete }) => {
  const handleDelete = () => onDelete(post.id);

  return (
    <tr>
      <td>{post.name}</td>
      <td>{post.description}</td>
      <td>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          Delete
        </Button>
      </td>
    </tr>
  );
};

export default PostItem;
```

## Form Handling: React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Button } from 'react-bootstrap';

const createPostSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description cannot exceed 2000 characters'),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

const PostForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
  });

  const onSubmit = async (data: CreatePostFormData) => {
    // Call RTK Query mutation
    await createPost(data).unwrap();
    reset();
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group className="mb-3">
        <Form.Label>Name *</Form.Label>
        <Form.Control {...register('name')} isInvalid={!!errors.name} />
        <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
      </Form.Group>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Post'}
      </Button>
    </Form>
  );
};
```

## UI/UX Standards (React Bootstrap)

- Use **React Bootstrap components** instead of plain HTML
- Follow **Bootstrap responsive grid system** (Container, Row, Col)
- Use **Alert** for success/error feedback
- Use **Table** for post list display
- Use **Form** components for all inputs
- Disable submit buttons during async operations
- Handle loading states with **Spinner**

### Accessibility

- Include `aria-label` attributes for interactive elements
- Use semantic HTML elements
- Ensure keyboard navigation support
- Provide alternative text for images

## Error Handling

1. **Error Boundary**: Wraps app, catches render errors, shows fallback UI
2. **RTK Query**: `isError` and `error` states handled in components
3. **Form validation**: Zod schema validates before submit
4. **Toast notifications**: Success/error feedback to user

```typescript
// In component using RTK Query
const { data, isLoading, isError, error } = useGetPostsQuery();

if (isLoading) return <Spinner animation="border" />;
if (isError) return <Alert variant="danger">Failed to load posts: {error.message}</Alert>;
```

## Naming Conventions

| What            | Convention       | Example                |
|----------------|-----------------|----------------------|
| Components     | PascalCase       | `PostForm.tsx`       |
| Hooks          | camelCase + use  | `usePostFilter.ts`   |
| Types          | PascalCase       | `Post`, `CreatePostDto` |
| Slices         | camelCase + Slice| `postsSlice.ts`      |
| API files      | camelCase + Api  | `postsApi.ts`        |
| Test files     | .test.tsx/.spec.ts| `PostForm.test.tsx` |
| CSS classes    | kebab-case       | `post-list`          |
| Variables      | camelCase        | `handleSubmit`, `postData` |
| Constants      | UPPER_SNAKE_CASE | `API_BASE_URL`       |

## Testing Standards

### Unit Tests (Vitest + React Testing Library)

- Location: `tests/` mirroring `src/`
- Test user behavior, not implementation details
- Use `screen.getByRole()`, `screen.getByText()` for accessible queries
- Test loading, error, and success states
- Coverage target: 90%

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('PostForm', () => {
  it('should show validation error when name is empty', async () => {
    render(<PostForm />);

    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

- Location: `e2e/`
- File extension: `.spec.ts`
- Use accessible locators (`getByRole`, `getByLabel`, `getByText`)
- Mock API at network level with `page.route()` for deterministic tests
- Test complete user flows:
  1. Load app → verify posts list renders
  2. Fill form → click Create → verify post appears
  3. Click Delete → verify post removed
  4. Type in filter → verify table filters

```typescript
import { test, expect } from '@playwright/test';

test.describe('Posts Management', () => {
  test('should create a new post', async ({ page }) => {
    await page.route('**/api/v1/posts', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 1, name: 'Test', description: 'Desc' } }),
      }),
    );

    await page.goto('/');
    await page.getByLabel('Name').fill('Test Post');
    await page.getByLabel('Description').fill('Test description');
    await page.getByRole('button', { name: 'Create Post' }).click();

    await expect(page.getByText('Test Post')).toBeVisible();
  });
});
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Configuration Standards

### TypeScript

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

### Environment Variables

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Performance Best Practices

- **Lazy load** route components with `React.lazy()` + `Suspense`
- **Memoize** expensive calculations with `useMemo`
- **Avoid unnecessary re-renders** with `useCallback` and `React.memo`
- **RTK Query cache** eliminates redundant API calls
- **Code splitting** at route level via Vite

## Development Workflow

1. Create feature branch: `git checkout -b feature/<name>-frontend`
2. Define types in `types/`
3. Create RTK Query endpoints in `api/`
4. Build components with React Bootstrap
5. Add form validation with Zod
6. Write unit tests (Vitest)
7. Write E2E tests (Playwright)
8. Lint and build: `npm run lint && npm run build`
9. Commit, push, create PR

### Development Scripts

```bash
npm run dev              # Vite development server
npm test                 # Run Vitest unit tests
npm run test:coverage    # Coverage report
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Playwright interactive UI
npm run build            # Production build
npm run lint             # ESLint check
```
