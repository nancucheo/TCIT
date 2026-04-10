# Spec 04: Funcionalidad — Eliminar Post

## Objetivo

Implementar la funcionalidad completa de eliminar un post: validación de ID, endpoint `DELETE /api/v1/posts/:id`, botón Delete en cada fila de la tabla, notificación toast, y todos los tests. Al finalizar, el usuario puede eliminar posts y verlos desaparecer de la tabla.

**Prerequisito:** Spec 03 completada (crear posts funciona).

---

## 1. Backend

### Validador — agregar a `src/application/validators/postValidator.ts`

```typescript
export function validatePostId(id: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (id === undefined || id === null || id === '') {
    errors.push({ field: 'id', message: 'ID is required', constraint: 'isNotEmpty' });
    return { isValid: false, errors };
  }

  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    errors.push({ field: 'id', message: 'ID must be a positive integer', constraint: 'isPositiveInt' });
  }

  return { isValid: errors.length === 0, errors };
}
```

### Service — método `delete` (`src/application/services/postService.ts`)

Agregar al PostService existente:

```typescript
async delete(id: unknown): Promise<Result<Post>> {
  // 1. Validar ID
  const validation = validatePostId(id);
  if (!validation.isValid) {
    return Result.failure('VALIDATION_ERROR', 'Invalid post ID', validation.errors);
  }

  const parsedId = Number(id);

  // 2. Verificar existencia
  const existing = await this.postRepository.findById(parsedId);
  if (!existing) {
    return Result.failure('POST_NOT_FOUND', `Post with id ${parsedId} not found`);
  }

  // 3. Eliminar
  const deleted = await this.postRepository.delete(parsedId);
  return Result.success(deleted!);
}
```

### Controller — método `delete` (`src/presentation/controllers/postController.ts`)

Agregar al PostController existente:

```typescript
async delete(req: Request, res: Response): Promise<void> {
  const result = await this.postService.delete(req.params.id);

  if (!result.isSuccess) {
    const statusMap: Record<string, number> = {
      VALIDATION_ERROR: 400,
      POST_NOT_FOUND: 404,
      INTERNAL_ERROR: 500,
    };
    const status = statusMap[result.error!.code] || 500;
    res.status(status).json({ success: false, error: result.error });
    return;
  }

  res.status(200).json({ success: true, data: result.data });
}
```

### Ruta — modificar `src/routes/postRoutes.ts`

```typescript
router.delete('/:id', postController.delete);
```

### Respuestas esperadas

**200 OK:**
```json
{
  "success": true,
  "data": { "id": 1, "name": "Post 1", "description": "...", "createdAt": "...", "updatedAt": "..." }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Invalid post ID", "details": [...] }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": { "code": "POST_NOT_FOUND", "message": "Post with id 999 not found" }
}
```

---

## 2. Backend Tests

### Unit Test — validatePostId (`__tests__/unit/validators/postValidator.test.ts`)

Agregar tests al archivo existente:

| Caso | Input | Esperado |
|------|-------|----------|
| ID válido "1" | `"1"` | `isValid: true` |
| ID válido "999" | `"999"` | `isValid: true` |
| ID cero | `"0"` | Error isPositiveInt |
| ID negativo | `"-1"` | Error isPositiveInt |
| ID decimal | `"1.5"` | Error isPositiveInt |
| ID no numérico | `"abc"` | Error isPositiveInt |
| ID undefined | `undefined` | Error isNotEmpty |
| ID null | `null` | Error isNotEmpty |
| ID vacío | `""` | Error isNotEmpty |

### Unit Test — PostService.delete (`__tests__/unit/services/postService.test.ts`)

Agregar tests al archivo existente:

| Caso | Setup | Esperado |
|------|-------|----------|
| Elimina post existente | findById → post, delete → post | `Result.success(post)` |
| Rechaza ID inválido | ID "abc" | `Result.failure(VALIDATION_ERROR)` |
| Post no existe | findById → null | `Result.failure(POST_NOT_FOUND)` |
| Error de repositorio | delete → throw | `Result.failure(INTERNAL_ERROR)` |

### Integration Test — agregar a `__tests__/integration/posts.test.ts`

| Caso | Request | Esperado |
|------|---------|----------|
| Eliminar existente | DELETE /posts/1 | 200, data del post eliminado |
| ID no existe | DELETE /posts/999 | 404, POST_NOT_FOUND |
| ID inválido | DELETE /posts/abc | 400, VALIDATION_ERROR |
| ID negativo | DELETE /posts/-1 | 400, VALIDATION_ERROR |
| Post desaparece | DELETE + GET | El post ya no está en la lista |

---

## 3. Frontend

### RTK Query — agregar mutation (`src/features/posts/api/postsApi.ts`)

```typescript
deletePost: builder.mutation<Post, number>({
  query: (id) => ({
    url: `/posts/${id}`,
    method: 'DELETE',
  }),
  transformResponse: (response: ApiSuccessResponse<Post>) => response.data,
  invalidatesTags: ['Posts'],  // ← Refresca la lista automáticamente
}),
```

### Componente PostItem (`src/features/posts/components/PostItem.tsx`)

Extraer la fila de la tabla a un componente separado con el botón Delete:

```typescript
interface PostItemProps {
  post: Post;
}

export const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const [deletePost, { isLoading }] = useDeletePostMutation();

  const handleDelete = async () => {
    try {
      await deletePost(post.id).unwrap();
      // Toast success: "Post deleted successfully"
    } catch (error) {
      // Toast error: "Failed to delete post"
    }
  };

  return (
    <tr>
      <td>{post.name}</td>
      <td>{post.description}</td>
      <td>
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : 'Delete'}
        </Button>
      </td>
    </tr>
  );
};
```

### Modificar PostList — usar PostItem

```typescript
<tbody>
  {posts.map((post) => (
    <PostItem key={post.id} post={post} />
  ))}
</tbody>
```

---

## 4. Frontend Tests

### Unit Test — PostItem (`src/features/posts/components/PostItem.test.tsx`)

| Caso | Acción | Esperado |
|------|--------|----------|
| Renderiza datos | — | Nombre y descripción visibles |
| Muestra botón Delete | — | Botón "Delete" variant danger visible |
| Llama delete mutation | Click Delete | `deletePost` llamado con post.id |
| Spinner durante delete | Mientras mutation pendiente | Spinner visible en botón |
| Botón disabled durante delete | Mientras mutation pendiente | Botón disabled |
| Toast success | Delete exitoso | Toast "Post deleted successfully" |
| Toast error | Delete falla | Toast "Failed to delete post" |

### Modificar PostList tests — verificar que usa PostItem

Agregar test: cada fila tiene botón Delete.

---

## 5. E2E Test (Playwright) — `e2e/delete-post.spec.ts`

| Caso | Pasos | Esperado |
|------|-------|----------|
| Eliminar post | Click Delete en una fila | Post desaparece de la tabla |
| Confirmación visual | Eliminar | Toast success visible |
| Tabla se actualiza | Después de eliminar | Total de filas disminuye en 1 |

---

## Criterios de Aceptación

- [ ] `DELETE /api/v1/posts/:id` elimina el post y retorna 200
- [ ] ID inválido retorna 400
- [ ] ID inexistente retorna 404
- [ ] Post eliminado ya no aparece en `GET /api/v1/posts`
- [ ] Frontend muestra botón Delete en cada fila
- [ ] Click en Delete elimina el post y la tabla se refresca
- [ ] Spinner durante la eliminación
- [ ] Toast success/error se muestra
- [ ] Tests backend: unit (validador + service) + integration pasan
- [ ] Tests frontend: unit + E2E pasan

---

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `backend/src/application/validators/postValidator.ts` | Modificar — agregar `validatePostId` |
| `backend/src/application/services/postService.ts` | Modificar — agregar `delete()` |
| `backend/src/presentation/controllers/postController.ts` | Modificar — agregar `delete()` |
| `backend/src/routes/postRoutes.ts` | Modificar — agregar `DELETE /:id` |
| `backend/__tests__/unit/validators/postValidator.test.ts` | Modificar — tests de validatePostId |
| `backend/__tests__/unit/services/postService.test.ts` | Modificar — tests de delete |
| `backend/__tests__/integration/posts.test.ts` | Modificar — tests de DELETE |
| `frontend/src/features/posts/api/postsApi.ts` | Modificar — agregar `deletePost` mutation |
| `frontend/src/features/posts/components/PostItem.tsx` | Crear |
| `frontend/src/features/posts/components/PostList.tsx` | Modificar — usar PostItem |
| `frontend/src/features/posts/components/PostItem.test.tsx` | Crear |
| `frontend/src/features/posts/components/PostList.test.tsx` | Modificar |
| `frontend/e2e/delete-post.spec.ts` | Crear |
