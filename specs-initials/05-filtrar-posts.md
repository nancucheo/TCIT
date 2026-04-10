# Spec 05: Funcionalidad — Filtrar Posts (Client-Side)

## Objetivo

Implementar el filtrado de posts por nombre de forma local (client-side). No hay endpoint nuevo en el backend — el filtro opera sobre los datos ya cacheados por RTK Query. Incluye el componente `PostFilter`, el hook `usePostFilter`, y todos los tests. Al finalizar, el usuario puede escribir un texto, presionar Search, y la tabla muestra solo los posts que coinciden.

**Prerequisito:** Spec 04 completada (CRUD completo funciona).

---

## 1. Backend

### No hay cambios en el backend.

El filtrado es 100% client-side. Los posts se obtienen con `GET /api/v1/posts` (una sola vez por carga de vista, ya cacheado por RTK Query desde spec 02).

---

## 2. Frontend

### Hook `usePostFilter` (`src/features/posts/hooks/usePostFilter.ts`)

```typescript
import { useMemo } from 'react';
import { useAppSelector } from '@app/hooks';
import { selectFilterText } from '../slices/postsSlice';
import { Post } from '../types/post.types';

export function usePostFilter(posts: Post[] | undefined): Post[] {
  const filterText = useAppSelector(selectFilterText);

  return useMemo(() => {
    if (!posts) return [];
    if (!filterText.trim()) return posts;
    const lower = filterText.toLowerCase();
    return posts.filter((post) =>
      post.name.toLowerCase().includes(lower)
    );
  }, [posts, filterText]);
}
```

**Lógica:**
- Filtra por `name` (substring, case-insensitive)
- Filtro vacío → retorna todos los posts
- `useMemo` evita recálculos innecesarios
- Posts `undefined` → retorna array vacío

### Componente PostFilter (`src/features/posts/components/PostFilter.tsx`)

```typescript
export const PostFilter: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const dispatch = useAppDispatch();

  const handleSearch = () => {
    if (inputValue.trim()) {
      dispatch(setFilterText(inputValue));
    } else {
      dispatch(clearFilter());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <InputGroup className="mb-3">
      <Form.Control
        type="text"
        placeholder="Filter by Name"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button variant="outline-secondary" onClick={handleSearch}>
        Search
      </Button>
    </InputGroup>
  );
};
```

**UI:**
```
[Filter by Name_________]  [Search]
```

**Comportamiento:**
- Escribe texto → click "Search" → dispatcha `setFilterText`
- Enter también triggerea la búsqueda
- Input vacío + Search → dispatcha `clearFilter` → muestra todos
- NO llama al API — solo actualiza el Redux state

### Modificar PostList — usar `usePostFilter`

```typescript
export const PostList: React.FC = () => {
  const { data: posts, isLoading, isError } = useGetPostsQuery();
  const filteredPosts = usePostFilter(posts);  // ← Nuevo

  // ...loading/error states...

  if (!filteredPosts.length) {
    // Diferenciar: no hay posts vs no hay matches
    if (posts?.length) {
      return <Alert variant="info">No posts match your filter</Alert>;
    }
    return <Alert variant="info">No posts found</Alert>;
  }

  return (
    <Table striped bordered hover responsive>
      {/* ... usar filteredPosts en vez de posts ... */}
      <tbody>
        {filteredPosts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </tbody>
    </Table>
  );
};
```

### Selector (`src/features/posts/slices/postsSlice.ts`)

Ya existe desde spec 02:
```typescript
export const selectFilterText = (state: { posts: PostsState }) => state.posts.filterText;
```

### App.tsx actualizado (layout final)

```typescript
function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <PostFilter />     {/* ← Nuevo */}
        <PostList />
        <PostForm />
      </Layout>
    </ErrorBoundary>
  );
}
```

Esto coincide con el mockup visual:
```
┌─────────────────────────────────────────────────────┐
│ [Filter by Name_________]              [Search]      │  ← PostFilter
│                                                      │
│ ┌──────────┬────────────────────┬─────────────┐     │
│ │ Name     │ Description        │ Action       │     │  ← PostList
│ ├──────────┼────────────────────┼─────────────┤     │
│ │ POST 1   │ Hello everyone     │ [Delete]     │     │  ← PostItem
│ └──────────┴────────────────────┴─────────────┘     │
│                                                      │
│ [Name_______] [Description_______________] [Create]  │  ← PostForm
└─────────────────────────────────────────────────────┘
```

---

## 3. Frontend Tests

### Unit Test — usePostFilter (`src/features/posts/hooks/usePostFilter.test.ts`)

| Caso | Input | filterText | Esperado |
|------|-------|------------|----------|
| Todos los posts sin filtro | 3 posts | `""` | 3 posts |
| Filtra por nombre | 3 posts | `"post 1"` | 1 post |
| Case insensitive | `["My Post"]` | `"my post"` | 1 post |
| Sin matches | 3 posts | `"xyz"` | [] |
| Posts undefined | `undefined` | `""` | [] |
| Posts vacío | `[]` | `""` | [] |
| Filtro con espacios | 3 posts | `"  "` | 3 posts (trim → vacío) |
| Substring match | `["TypeScript Tips"]` | `"script"` | 1 post |

### Unit Test — PostFilter (`src/features/posts/components/PostFilter.test.tsx`)

| Caso | Acción | Esperado |
|------|--------|----------|
| Renderiza input y botón | — | Input con placeholder "Filter by Name" y botón "Search" visibles |
| Dispatcha filtro al buscar | Escribir "hello" → click Search | `setFilterText("hello")` dispatched |
| Dispatcha filtro con Enter | Escribir "hello" → Enter | `setFilterText("hello")` dispatched |
| Limpia filtro con vacío | Limpiar input → click Search | `clearFilter()` dispatched |

### Modificar PostList tests

| Caso | Setup | Esperado |
|------|-------|----------|
| Muestra posts filtrados | API retorna 3, filterText = "post 1" | Solo 1 fila visible |
| Mensaje sin matches | API retorna 3, filterText = "xyz" | "No posts match your filter" |
| Diferencia vacío vs sin matches | API retorna 0 | "No posts found" (no "no match") |

---

## 4. E2E Test (Playwright) — `e2e/filter-posts.spec.ts`

| Caso | Pasos | Esperado |
|------|-------|----------|
| Filtrar por nombre | Escribir nombre parcial → Search | Solo posts que coinciden visibles |
| Filtro case-insensitive | Escribir en minúsculas | Coincide con mayúsculas |
| Limpiar filtro | Borrar texto → Search | Todos los posts visibles |
| Sin resultados | Escribir texto que no coincide | "No posts match your filter" |
| Enter funciona | Escribir → Enter | Filtro aplicado sin click |

---

## Criterios de Aceptación

- [ ] PostFilter tiene input con placeholder "Filter by Name" y botón "Search"
- [ ] Escribir texto y presionar Search filtra la tabla por nombre
- [ ] Enter también aplica el filtro
- [ ] Filtro es case-insensitive y por substring
- [ ] Limpiar input y buscar muestra todos los posts
- [ ] "No posts match your filter" cuando hay posts pero ninguno coincide
- [ ] "No posts found" cuando no hay posts en absoluto
- [ ] No se hace llamada al API al filtrar (100% client-side)
- [ ] Layout final coincide con el mockup visual
- [ ] Tests frontend: unit (hook + componente) + E2E pasan

---

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `frontend/src/features/posts/hooks/usePostFilter.ts` | Crear |
| `frontend/src/features/posts/components/PostFilter.tsx` | Crear |
| `frontend/src/features/posts/components/PostList.tsx` | Modificar — usar usePostFilter |
| `frontend/src/App.tsx` | Modificar — agregar PostFilter |
| `frontend/src/features/posts/hooks/usePostFilter.test.ts` | Crear |
| `frontend/src/features/posts/components/PostFilter.test.tsx` | Crear |
| `frontend/src/features/posts/components/PostList.test.tsx` | Modificar |
| `frontend/e2e/filter-posts.spec.ts` | Crear |
