# Frontend Setup Implementation Plan

## Overview

This plan covers the complete frontend project scaffold for TCIT Posts Manager under `frontend/`.
The root monorepo already exists with `package.json` (workspaces: `["backend", "frontend"]`) and `docker-compose.yml`.
No post feature logic is included yet — this is purely infrastructure/config.

---

## Files to Create

### 1. `frontend/package.json`

**Purpose:** Declares all dependencies, devDependencies, and npm scripts for the frontend workspace.

**Production dependencies (exact package names):**
- `react` — UI framework
- `react-dom` — DOM renderer
- `@reduxjs/toolkit` — Redux Toolkit + RTK Query
- `react-redux` — React bindings for Redux
- `react-hook-form` — Form state management
- `@hookform/resolvers` — Adapters for validation libraries (Zod)
- `zod` — Schema validation
- `react-bootstrap` — Bootstrap React components
- `bootstrap` — Bootstrap CSS (imported in main.tsx)
- `react-router-dom` — Client-side routing v7

**Dev dependencies:**
- `typescript` — TypeScript compiler
- `@types/react` — React type definitions
- `@types/react-dom` — ReactDOM type definitions
- `vite` — Build tool / dev server
- `@vitejs/plugin-react` — Vite plugin for React JSX transform
- `vitest` — Unit test runner (Vite-native)
- `@vitest/coverage-v8` — V8 coverage provider for Vitest
- `@testing-library/react` — React component testing utilities
- `@testing-library/jest-dom` — Custom DOM matchers
- `@testing-library/user-event` — Simulates real user interactions
- `jsdom` — DOM environment for Vitest
- `@playwright/test` — E2E test runner
- `eslint` — Linting
- `eslint-plugin-react-hooks` — React hooks lint rules
- `@typescript-eslint/parser` — ESLint TypeScript parser
- `@typescript-eslint/eslint-plugin` — TypeScript ESLint rules

**Scripts:**
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "lint": "eslint src/ --ext .ts,.tsx"
}
```

**Important notes:**
- `"name": "frontend"` must match the workspace directory name
- `"private": true` to prevent accidental publish
- `"type": "module"` is NOT needed — Vite handles ESM

---

### 2. `frontend/tsconfig.json`

**Purpose:** TypeScript compiler configuration for the React application source.

**Key `compilerOptions`:**
```json
{
  "target": "ES2020",
  "lib": ["ES2020", "DOM", "DOM.Iterable"],
  "module": "ESNext",
  "moduleResolution": "bundler",
  "jsx": "react-jsx",
  "strict": true,
  "skipLibCheck": true,
  "allowImportingTsExtensions": true,
  "noEmit": true,
  "baseUrl": ".",
  "paths": {
    "@app/*": ["src/app/*"],
    "@features/*": ["src/features/*"],
    "@shared/*": ["src/shared/*"]
  }
}
```

**Top-level fields:**
- `"include": ["src"]` — only compile source
- `"references": [{ "path": "./tsconfig.node.json" }]` — for Vite config file

**Important notes:**
- `"allowImportingTsExtensions": true` is required because `noEmit: true` — Vite handles actual transpilation
- `"moduleResolution": "bundler"` is the correct value for Vite 4+/5+ (not `"node"` or `"node16"`)
- `"noEmit": true` means `tsc` only type-checks; Vite does actual building

---

### 3. `frontend/tsconfig.node.json`

**Purpose:** Separate TS config for Vite's `vite.config.ts` file (runs in Node, not browser).

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Important notes:**
- `"composite": true` is required for project references to work
- Only includes `vite.config.ts`, not `src/`

---

### 4. `frontend/vite.config.ts`

**Purpose:** Vite build tool configuration.

**Content outline:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

**Important notes:**
- `path` is a Node built-in; `__dirname` works in `.ts` config files with Vite
- Aliases here must match the `paths` in `tsconfig.json` exactly
- The proxy is `/api` → `http://localhost:3000` so `/api/v1/posts` proxies correctly
- No need to add `@types/node` explicitly — Vite ships it

---

### 5. `frontend/vitest.config.ts`

**Purpose:** Vitest test runner configuration (extends Vite config).

**Content outline:**
```typescript
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test-setup.ts',
      coverage: {
        provider: 'v8',
        thresholds: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'node_modules',
          'src/test-setup.ts',
          'src/**/*.test.{ts,tsx}',
          'src/**/*.spec.{ts,tsx}',
          'src/vite-env.d.ts',
          'src/main.tsx',
        ],
      },
    },
  }),
);
```

**Important notes:**
- Use `mergeConfig` from `vitest/config` to inherit Vite resolve aliases — this is critical for `@app`, `@features`, `@shared` imports to resolve in tests
- `globals: true` exposes `describe`, `it`, `expect`, etc. globally (no need to import in test files)
- `environment: 'jsdom'` simulates a browser DOM for React component tests

---

### 6. `frontend/Dockerfile`

**Purpose:** Containerised production image using multi-stage build.

**Stage 1 — builder:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

**Stage 2 — production:**
```dockerfile
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Important notes:**
- `npm ci` (not `npm install`) in production builds for reproducibility
- The `dist/` folder is the Vite output directory
- The `nginx.conf` file must be in the `frontend/` directory alongside Dockerfile

---

### 7. `frontend/nginx.conf`

**Purpose:** Nginx web server config for serving the SPA and proxying API requests.

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback — all routes return index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the backend service
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Important notes:**
- `http://backend:3000` uses the Docker Compose service name `backend` — must match the service name in `docker-compose.yml`
- `try_files $uri $uri/ /index.html` is the essential SPA routing fallback
- No `gzip` or caching headers in this base config — can be added later

---

### 8. `frontend/index.html`

**Purpose:** Vite entry HTML — the single HTML file served by the dev server and bundled.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TCIT Posts Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Important notes:**
- The `id="root"` div is required — `main.tsx` mounts on it
- `type="module"` on the script tag is required for Vite's ESM-based dev server
- Place `index.html` at the root of `frontend/`, NOT inside `src/`

---

### 9. `frontend/src/main.tsx`

**Purpose:** React application entry point. Mounts the app to the DOM.

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@app/store';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
```

**Important notes:**
- `bootstrap/dist/css/bootstrap.min.css` must be imported here (not in App.tsx) to load globally
- `React.StrictMode` enables double-rendering in dev for detecting side effects
- The `as HTMLElement` cast is needed because `getElementById` can return `null` in TypeScript strict mode
- `./index.css` for any custom base styles

---

### 10. `frontend/src/App.tsx`

**Purpose:** Root application component. No post feature logic yet — placeholder layout only.

```typescript
import React from 'react';
import { Container } from 'react-bootstrap';

const App: React.FC = () => {
  return (
    <Container className="py-4">
      <h1>TCIT Posts Manager</h1>
    </Container>
  );
};

export default App;
```

**Important notes:**
- Use `Container` from `react-bootstrap`, not a plain `<div>`
- This is intentionally minimal — post components will be added in the posts feature ticket
- No React Router setup yet; that comes when routes are defined in the posts feature

---

### 11. `frontend/src/app/store.ts`

**Purpose:** Redux store configuration. Placeholder for now — will be extended when `postsApi` and `postsSlice` are added.

```typescript
import { configureStore } from '@reduxjs/toolkit';

// Placeholder reducer — will be replaced when feature slices are added
const placeholderReducer = (state = {}) => state;

export const store = configureStore({
  reducer: {
    _placeholder: placeholderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Important notes:**
- An empty `reducer: {}` object is NOT valid in `configureStore` — it requires at least one key, hence the placeholder
- When `postsApi` and `postsSlice` are added, the `_placeholder` entry will be removed and the real reducers and middleware added
- Export `RootState` and `AppDispatch` — these are used by the typed hooks

---

### 12. `frontend/src/app/hooks.ts`

**Purpose:** Typed Redux hooks to avoid repeating type annotations throughout the codebase.

```typescript
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**Important notes:**
- All components should use `useAppDispatch` and `useAppSelector` instead of the untyped `useDispatch`/`useSelector`
- `TypedUseSelectorHook` is the correct generic type from `react-redux`

---

### 13. `frontend/src/test-setup.ts`

**Purpose:** Vitest global test setup file — extends Jest-DOM matchers.

```typescript
import '@testing-library/jest-dom';
```

**Important notes:**
- This file path must match `setupFiles` in `vitest.config.ts` exactly: `./src/test-setup.ts`
- With `globals: true` in Vitest config, no additional import of `vi`, `describe`, `it`, `expect` is needed in test files
- `@testing-library/jest-dom` adds matchers like `toBeInTheDocument()`, `toHaveValue()`, etc.

---

### 14. `frontend/src/index.css`

**Purpose:** Global base styles. Intentionally minimal — Bootstrap handles most styling.

```css
/* Base application styles */
/* Bootstrap is imported in main.tsx */

body {
  min-height: 100vh;
}

#root {
  min-height: 100vh;
}
```

**Important notes:**
- Do NOT import Bootstrap here — it is imported in `main.tsx` to ensure correct load order
- Keep this file minimal; component-specific styles should be in `.module.css` files or inline styles

---

### 15. `frontend/src/vite-env.d.ts`

**Purpose:** TypeScript declaration file for Vite's `import.meta.env` types.

```typescript
/// <reference types="vite/client" />
```

**Important notes:**
- This single line is all that is needed
- Enables autocomplete and type safety for `import.meta.env.VITE_*` variables
- Do not delete this file — without it `import.meta.env` will be typed as `any`

---

### 16. Empty directory placeholders (`.gitkeep` files)

**Purpose:** Git does not track empty directories. `.gitkeep` files reserve the directory structure.

**Files to create (all empty):**
- `frontend/src/features/posts/api/.gitkeep`
- `frontend/src/features/posts/components/.gitkeep`
- `frontend/src/features/posts/hooks/.gitkeep`
- `frontend/src/features/posts/slices/.gitkeep`
- `frontend/src/features/posts/types/.gitkeep`
- `frontend/src/shared/components/.gitkeep`
- `frontend/src/shared/hooks/.gitkeep`
- `frontend/src/shared/utils/.gitkeep`
- `frontend/e2e/.gitkeep`

**Important notes:**
- These directories will be populated in subsequent feature tickets
- The `e2e/` directory sits at `frontend/e2e/`, NOT inside `src/`

---

### 17. `frontend/.eslintrc.json`

**Purpose:** ESLint configuration for TypeScript + React hooks rules.

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["react-hooks", "@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  "env": {
    "browser": true,
    "es2020": true
  }
}
```

**Important notes:**
- `"parser": "@typescript-eslint/parser"` must be set so ESLint can parse TypeScript syntax
- `react-hooks/rules-of-hooks: "error"` enforces the Rules of Hooks (must be `error`, not `warn`)
- `react-hooks/exhaustive-deps: "warn"` warns about missing `useEffect` dependencies
- No `plugin:react/recommended` is included — React 17+ with the new JSX transform does not require it
- The `"env"` block is needed for `browser` globals (`window`, `document`) to be recognised without error

---

## Additional File: `frontend/playwright.config.ts`

Although not in the original spec list, this file is referenced by the `test:e2e` script and the frontend-standards.md spec. It should be created alongside the other config files.

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Directory Structure After Setup

```
frontend/
├── Dockerfile
├── nginx.conf
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── .eslintrc.json
├── e2e/
│   └── .gitkeep
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── test-setup.ts
    ├── app/
    │   ├── store.ts
    │   └── hooks.ts
    ├── features/
    │   └── posts/
    │       ├── api/.gitkeep
    │       ├── components/.gitkeep
    │       ├── hooks/.gitkeep
    │       ├── slices/.gitkeep
    │       └── types/.gitkeep
    └── shared/
        ├── components/.gitkeep
        ├── hooks/.gitkeep
        └── utils/.gitkeep
```

---

## Implementation Order

1. Create `frontend/package.json` first — all other steps depend on it
2. Create TypeScript config files (`tsconfig.json`, `tsconfig.node.json`)
3. Create Vite and Vitest config files
4. Create `index.html` and Docker/Nginx files
5. Create `src/` files in this order: `vite-env.d.ts` → `index.css` → `test-setup.ts` → `app/store.ts` → `app/hooks.ts` → `App.tsx` → `main.tsx`
6. Create all `.gitkeep` placeholder files
7. Create `.eslintrc.json`
8. Run `npm install` from the `frontend/` directory to verify the package.json is valid
9. Run `npm run build` to verify the TypeScript and Vite config is correct

---

## Verification Checklist

- [ ] `npm install` completes with no errors in `frontend/`
- [ ] `npm run build` (`tsc && vite build`) completes successfully
- [ ] `npm run lint` reports no errors
- [ ] `npm test` (Vitest) runs and passes (no test files yet, so it should pass vacuously or with a warning)
- [ ] TypeScript strict mode: no `any` types, all imports resolve via path aliases
- [ ] `import.meta.env.VITE_API_URL` is type-safe (from `vite-env.d.ts`)
- [ ] Bootstrap CSS loads when app starts in dev mode (`npm run dev`)
