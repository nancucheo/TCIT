# Spec 02: Funcionalidad — Listar Posts

## Objetivo

Implementar la funcionalidad completa de listar posts: endpoint `GET /api/v1/posts`, Redux store con RTK Query, componente `PostList`, y todos los tests. Al finalizar esta spec, el usuario ve una tabla con todos los posts existentes.

**Prerequisito:** Spec 00 y 01 completadas.

---

## 1. Backend

### Validador — No aplica

`getAll` no recibe parámetros, no requiere validación.

### Service (`src/application/services/postService.ts`)

```typescript
export class PostService {
  constructor(private readonly postRepository: IPostRepository) {}

  async getAll(): Promise<Result<Post[]>> {
    try {
      const posts = await this.postRepository.findAll();
      return Result.success(posts);
    } catch (error) {
      return Result.failure('INTERNAL_ERROR', 'Failed to retrieve posts');
    }
  }
}
```

### Controller (`src/presentation/controllers/postController.ts`)

```typescript
export class PostController {
  constructor(private readonly postService: PostService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    const result = await this.postService.getAll();

    if (!result.isSuccess) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.data,
      meta: { total: result.data!.length },
    });
  }
}
```

### Ruta (`src/routes/postRoutes.ts`)

```typescript
const router = Router();
router.get('/', postController.getAll);
export default router;
```

### Registrar en `src/routes/index.ts`

```typescript
router.use('/posts', postRoutes);
```

### Respuesta esperada (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Post 1",
      "description": "Hello everyone",
      "createdAt": "2026-04-10T10:00:00.000Z",
      "updatedAt": "2026-04-10T10:00:00.000Z"
    }
  ],
  "meta": { "total": 1 }
}
```

---

## 2. Backend Tests

### Unit Test — PostService.getAll (`__tests__/unit/services/postService.test.ts`)

| Caso | Setup | Esperado |
|------|-------|----------|
| Retorna posts | `mockRepo.findAll` → 3 posts | `Result.success([...3 posts])` |
| Retorna vacío | `mockRepo.findAll` → [] | `Result.success([])` |
| Error de repositorio | `mockRepo.findAll` → throw | `Result.failure(INTERNAL_ERROR)` |

### Integration Test (`__tests__/integration/posts.test.ts`)

| Caso | Setup | Esperado |
|------|-------|----------|
| GET con posts | Seed 2 posts en DB | 200, data con 2 posts, meta.total = 2 |
| GET sin posts | DB vacía | 200, data = [], meta.total = 0 |
| Orden descendente | Seed posts con distintos createdAt | Primer post es el más reciente |
| Schema correcto | Cualquier respuesta | Tiene success, data (array), meta.total |

---

## 3. Frontend

### Tipos (`src/features/posts/types/post.types.ts`)

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

### Redux Store (`src/app/store.ts`)

```typescript
export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
    posts: postsReducer,
  },
  middleware: (getDefault) => getDefault().concat(postsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### RTK Query (`src/features/posts/api/postsApi.ts`)

```typescript
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

### Posts Slice (`src/features/posts/slices/postsSlice.ts`)

```typescript
const postsSlice = createSlice({
  name: 'posts',
  initialState: { filterText: '' },
  reducers: {
    setFilterText: (state, action: PayloadAction<string>) => {
      state.filterText = action.payload;
    },
    clearFilter: (state) => { state.filterText = ''; },
  },
});
```

### Componente PostList (`src/features/posts/components/PostList.tsx`)

```typescript
export const PostList: React.FC = () => {
  const { data: posts, isLoading, isError, error } = useGetPostsQuery();

  if (isLoading) return <Spinner />;
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
            <td>{/* Delete button — spec 04 */}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
```

### Shared Components necesarios

- **Layout** (`src/shared/components/Layout.tsx`): Container + título
- **ErrorBoundary** (`src/shared/components/ErrorBoundary.tsx`): Catch de errores de render
- **LoadingSpinner** (`src/shared/components/LoadingSpinner.tsx`): Spinner centrado

### App.tsx actualizado

```typescript
function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <PostList />
      </Layout>
    </ErrorBoundary>
  );
}
```

---

## 4. Frontend Tests

### Unit Test — PostList (`src/features/posts/components/PostList.test.tsx`)

Usar `renderWithProviders` wrapper con Redux Provider + MSW para mock de API.

| Caso | Setup | Esperado |
|------|-------|----------|
| Muestra spinner cargando | API pendiente | Spinner visible |
| Muestra error | API retorna error | Alert danger visible |
| Muestra estado vacío | API retorna [] | "No posts found" visible |
| Muestra posts en tabla | API retorna 2 posts | 2 filas con nombre y descripción |
| Orden correcto | API retorna posts | Tabla respeta el orden del API |

### Unit Test — postsSlice (`src/features/posts/slices/postsSlice.test.ts`)

| Caso | Esperado |
|------|----------|
| Estado inicial | `filterText: ""` |
| setFilterText | `filterText` se actualiza |
| clearFilter | `filterText` vuelve a `""` |

### Test Utility — `renderWithProviders`

```typescript
export function renderWithProviders(ui: React.ReactElement, options?) {
  const store = configureStore({
    reducer: { [postsApi.reducerPath]: postsApi.reducer, posts: postsReducer },
    middleware: (getDefault) => getDefault().concat(postsApi.middleware),
    ...options,
  });
  return { store, ...render(ui, { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> }) };
}
```

---

## 5. E2E Test (Playwright) — `e2e/list-posts.spec.ts`

| Caso | Pasos | Esperado |
|------|-------|----------|
| Ver posts | Navegar a `/` | Tabla visible con posts del seed |
| Título visible | Navegar a `/` | "TCIT Posts Manager" visible |
| Tabla tiene columnas | Navegar a `/` | Headers: Name, Description, Action |

---

## Criterios de Aceptación

- [ ] `GET /api/v1/posts` retorna 200 con array de posts y meta.total
- [ ] Posts están ordenados por createdAt descendente
- [ ] Respuesta vacía retorna `data: [], meta: { total: 0 }`
- [ ] Frontend muestra spinner mientras carga
- [ ] Frontend muestra tabla con posts al cargar
- [ ] Frontend muestra mensaje cuando no hay posts
- [ ] RTK Query cachea la respuesta (no llama 2 veces)
- [ ] Tests backend: unit + integration pasan
- [ ] Tests frontend: unit + E2E pasan

---

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `backend/src/application/services/postService.ts` | Crear — método `getAll()` |
| `backend/src/presentation/controllers/postController.ts` | Crear — método `getAll()` |
| `backend/src/routes/postRoutes.ts` | Crear |
| `backend/src/routes/index.ts` | Modificar — agregar post routes |
| `backend/__tests__/unit/services/postService.test.ts` | Crear |
| `backend/__tests__/integration/posts.test.ts` | Crear |
| `backend/test-utils/builders/postBuilder.ts` | Crear |
| `backend/test-utils/mocks/prismaClient.mock.ts` | Crear |
| `frontend/src/features/posts/types/post.types.ts` | Crear |
| `frontend/src/features/posts/api/postsApi.ts` | Crear — endpoint `getPosts` |
| `frontend/src/features/posts/slices/postsSlice.ts` | Crear |
| `frontend/src/features/posts/components/PostList.tsx` | Crear |
| `frontend/src/app/store.ts` | Modificar — agregar postsApi + postsSlice |
| `frontend/src/shared/components/Layout.tsx` | Crear |
| `frontend/src/shared/components/ErrorBoundary.tsx` | Crear |
| `frontend/src/shared/components/LoadingSpinner.tsx` | Crear |
| `frontend/src/App.tsx` | Modificar |
| `frontend/src/test-utils/renderWithProviders.tsx` | Crear |
| `frontend/src/features/posts/components/PostList.test.tsx` | Crear |
| `frontend/src/features/posts/slices/postsSlice.test.ts` | Crear |
| `frontend/e2e/list-posts.spec.ts` | Crear |
