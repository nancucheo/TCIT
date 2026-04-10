# Spec 03: Funcionalidad — Crear Post

## Objetivo

Implementar la funcionalidad completa de crear un post: validación, endpoint `POST /api/v1/posts`, componente `PostForm` con React Hook Form + Zod, notificaciones toast, y todos los tests. Al finalizar, el usuario puede crear posts desde el formulario y verlos aparecer en la tabla.

**Prerequisito:** Spec 02 completada (listar posts funciona).

---

## 1. Backend

### Validador (`src/application/validators/postValidator.ts`)

```typescript
export function validateCreatePost(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  // ...validaciones
  return { isValid: errors.length === 0, errors };
}
```

**Reglas de validación:**

| Campo | Regla | Constraint | Mensaje |
|-------|-------|------------|---------|
| body | Requerido, objeto | isNotEmpty | "Request body is required" |
| name | Requerido | isNotEmpty | "Name is required" |
| name | Tipo string | isString | "Name must be a string" |
| name | Max 255 chars | maxLength | "Name must not exceed 255 characters" |
| name | Sin espacios extremos | isTrimmed | "Name must not have leading or trailing whitespace" |
| description | Requerido | isNotEmpty | "Description is required" |
| description | Tipo string | isString | "Description must be a string" |
| description | Max 2000 chars | maxLength | "Description must not exceed 2000 characters" |

### Service — método `create` (`src/application/services/postService.ts`)

Agregar al PostService existente:

```typescript
async create(data: unknown): Promise<Result<Post>> {
  // 1. Validar input
  const validation = validateCreatePost(data);
  if (!validation.isValid) {
    return Result.failure('VALIDATION_ERROR', 'Invalid input data', validation.errors);
  }

  const { name, description } = data as CreatePostDto;

  // 2. Verificar unicidad
  const existing = await this.postRepository.findByName(name);
  if (existing) {
    return Result.failure('POST_ALREADY_EXISTS', `A post with name '${name}' already exists`);
  }

  // 3. Crear
  const post = new Post({ name, description });
  const saved = await this.postRepository.save(post);
  return Result.success(saved);
}
```

### Controller — método `create` (`src/presentation/controllers/postController.ts`)

Agregar al PostController existente:

```typescript
async create(req: Request, res: Response): Promise<void> {
  const result = await this.postService.create(req.body);

  if (!result.isSuccess) {
    const statusMap: Record<string, number> = {
      VALIDATION_ERROR: 400,
      POST_ALREADY_EXISTS: 409,
      INTERNAL_ERROR: 500,
    };
    const status = statusMap[result.error!.code] || 500;
    res.status(status).json({ success: false, error: result.error });
    return;
  }

  res.status(201).json({ success: true, data: result.data });
}
```

### Ruta — modificar `src/routes/postRoutes.ts`

```typescript
router.post('/', postController.create);
```

### Respuestas esperadas

**201 Created:**
```json
{
  "success": true,
  "data": { "id": 1, "name": "My Post", "description": "...", "createdAt": "...", "updatedAt": "..." }
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [{ "field": "name", "message": "Name is required", "constraint": "isNotEmpty" }]
  }
}
```

**409 Conflict:**
```json
{
  "success": false,
  "error": { "code": "POST_ALREADY_EXISTS", "message": "A post with name 'Post 1' already exists" }
}
```

---

## 2. Backend Tests

### Unit Test — Validador (`__tests__/unit/validators/postValidator.test.ts`)

| Caso | Input | Esperado |
|------|-------|----------|
| Input válido | `{ name: "Post", description: "Desc" }` | `isValid: true, errors: []` |
| Nombre vacío | `{ name: "", description: "Desc" }` | Error isNotEmpty en name |
| Nombre faltante | `{ description: "Desc" }` | Error isNotEmpty en name |
| Nombre muy largo | 256 chars | Error maxLength en name |
| Nombre con espacios | `" Post "` | Error isTrimmed en name |
| Descripción vacía | `{ name: "Post", description: "" }` | Error isNotEmpty en description |
| Descripción muy larga | 2001 chars | Error maxLength en description |
| Nombre no string | `{ name: 123, ... }` | Error isString en name |
| Body null | `null` | Error isNotEmpty en body |
| Múltiples errores | `{ name: "", description: "" }` | 2 errores |

### Unit Test — PostService.create (`__tests__/unit/services/postService.test.ts`)

| Caso | Setup | Esperado |
|------|-------|----------|
| Crea con datos válidos | findByName → null, save → post | `Result.success(post)` |
| Rechaza input inválido | Datos vacíos | `Result.failure(VALIDATION_ERROR)` |
| Rechaza nombre duplicado | findByName → post existente | `Result.failure(POST_ALREADY_EXISTS)` |
| Maneja error de repo | save → throw | `Result.failure(INTERNAL_ERROR)` |

### Integration Test — agregar a `__tests__/integration/posts.test.ts`

| Caso | Request | Esperado |
|------|---------|----------|
| Crear post válido | POST body correcto | 201, data con id y timestamps |
| Nombre vacío | POST sin name | 400, VALIDATION_ERROR |
| Descripción vacía | POST sin description | 400, VALIDATION_ERROR |
| Nombre > 255 chars | POST con name largo | 400, VALIDATION_ERROR |
| Nombre duplicado | POST con name existente | 409, POST_ALREADY_EXISTS |
| Post aparece en listado | POST + GET | El nuevo post está en GET /posts |

---

## 3. Frontend

### RTK Query — agregar mutation (`src/features/posts/api/postsApi.ts`)

```typescript
createPost: builder.mutation<Post, CreatePostDto>({
  query: (body) => ({
    url: '/posts',
    method: 'POST',
    body,
  }),
  transformResponse: (response: ApiSuccessResponse<Post>) => response.data,
  invalidatesTags: ['Posts'],  // ← Refresca la lista automáticamente
}),
```

### Tipo adicional (`src/features/posts/types/post.types.ts`)

```typescript
export interface CreatePostDto {
  name: string;
  description: string;
}
```

### Componente PostForm (`src/features/posts/components/PostForm.tsx`)

**Validación con Zod:**

```typescript
const createPostSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name must not exceed 255 characters')
    .trim(),
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must not exceed 2000 characters'),
});
```

**UI con React Bootstrap:**

```
[Name_________] [Description___________________] [Create]
```

- `Form` con `Row` inline de 3 columnas
- `Form.Control` para Name (placeholder: "Name")
- `Form.Control` para Description (placeholder: "Description")
- `Button` variant="primary", text: "Create"
- Errores de validación debajo de cada campo
- Spinner en botón mientras envía
- Botón deshabilitado durante envío

**Comportamiento:**
- Submit → llama `useCreatePostMutation`
- Éxito → reset form + toast success "Post created successfully"
- Error 409 → toast error "A post with that name already exists"
- Error 400 → muestra errores de campo del API
- `invalidatesTags: ['Posts']` hace que la tabla se refresque sola

### Toast Component (`src/shared/components/Toast.tsx`)

```typescript
interface ToastNotification {
  id: string;
  message: string;
  variant: 'success' | 'danger' | 'warning';
}
```

- Posición: top-end
- Auto-dismiss: 3 segundos
- Soporta múltiples toasts simultáneos

### App.tsx actualizado

```typescript
<ErrorBoundary>
  <Layout>
    <PostList />
    <PostForm />    {/* ← Nuevo */}
  </Layout>
</ErrorBoundary>
```

---

## 4. Frontend Tests

### Unit Test — PostForm (`src/features/posts/components/PostForm.test.tsx`)

| Caso | Acción | Esperado |
|------|--------|----------|
| Renderiza campos | — | Input Name, Input Description, botón Create visibles |
| Error nombre vacío | Submit sin llenar | "Name is required" visible |
| Error descripción vacía | Submit sin descripción | "Description is required" visible |
| Error nombre largo | Name > 255 chars | Error maxLength visible |
| Submit válido | Llenar + click Create | Mutation llamada con datos correctos |
| Reset después de éxito | Submit exitoso | Campos vacíos |
| Spinner durante envío | Mientras mutation pendiente | Spinner visible, botón disabled |
| Error API conflict | API retorna 409 | Toast error visible |

### Unit Test — Validador Zod (implícito en PostForm tests)

La validación Zod se testea indirectamente a través de los tests del PostForm.

---

## 5. E2E Test (Playwright) — `e2e/create-post.spec.ts`

| Caso | Pasos | Esperado |
|------|-------|----------|
| Crear post | Llenar form → Create | Post aparece en tabla |
| Validación | Submit vacío | Mensajes de error visibles |
| Duplicado | Crear 2 veces mismo nombre | Error toast en segundo intento |
| Form se limpia | Crear post exitoso | Campos vacíos después |

---

## Criterios de Aceptación

- [ ] `POST /api/v1/posts` crea un post y retorna 201
- [ ] Validación backend rechaza name vacío/largo, description vacía/larga
- [ ] Nombre duplicado retorna 409
- [ ] Frontend muestra formulario con Name, Description, Create
- [ ] Validación Zod funciona antes del submit
- [ ] Post creado aparece en la tabla sin recargar (cache invalidation)
- [ ] Toast success/error se muestra correctamente
- [ ] Form se resetea después de crear exitosamente
- [ ] Tests backend: unit (validador + service) + integration pasan
- [ ] Tests frontend: unit + E2E pasan

---

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `backend/src/application/validators/postValidator.ts` | Crear — `validateCreatePost` |
| `backend/src/application/services/postService.ts` | Modificar — agregar `create()` |
| `backend/src/presentation/controllers/postController.ts` | Modificar — agregar `create()` |
| `backend/src/routes/postRoutes.ts` | Modificar — agregar `POST /` |
| `backend/__tests__/unit/validators/postValidator.test.ts` | Crear |
| `backend/__tests__/unit/services/postService.test.ts` | Modificar — tests de create |
| `backend/__tests__/integration/posts.test.ts` | Modificar — tests de POST |
| `frontend/src/features/posts/api/postsApi.ts` | Modificar — agregar `createPost` mutation |
| `frontend/src/features/posts/types/post.types.ts` | Modificar — agregar `CreatePostDto` |
| `frontend/src/features/posts/components/PostForm.tsx` | Crear |
| `frontend/src/shared/components/Toast.tsx` | Crear |
| `frontend/src/App.tsx` | Modificar — agregar PostForm |
| `frontend/src/features/posts/components/PostForm.test.tsx` | Crear |
| `frontend/e2e/create-post.spec.ts` | Crear |
