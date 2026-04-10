# Spec 07: UI — Traducción de interfaz a español

## Objetivo

Traducir todos los textos visibles al usuario en el frontend de inglés a español. La palabra "post" se mantiene sin traducir. El código fuente (variables, funciones, comentarios) permanece en inglés según las convenciones del proyecto.

**Prerequisito:** Specs 00–06 completadas.

---

## 1. Backend

### No hay cambios en el backend.

---

## 2. Frontend

### Componentes a modificar

#### `src/shared/components/Layout.tsx`

| Original (EN) | Traducción (ES) |
|---------------|-----------------|
| `TCIT Posts Manager` | `TCIT Posts Manager` (se mantiene — nombre de marca) |

#### `src/features/posts/components/PostFilter.tsx`

| Original (EN) | Traducción (ES) |
|---------------|-----------------|
| `Filter by Name` (placeholder) | `Filtrar por nombre` |
| `Search` (botón) | `Buscar` |

#### `src/features/posts/components/PostList.tsx`

| Original (EN) | Traducción (ES) |
|---------------|-----------------|
| `Error loading posts` | `Error al cargar posts` |
| `No posts found` | `No se encontraron posts` |
| `No posts match your filter` | `Ningún post coincide con tu filtro` |
| `Name` (encabezado tabla) | `Nombre` |
| `Description` (encabezado tabla) | `Descripción` |
| `Action` (encabezado tabla) | `Acción` |

#### `src/features/posts/components/PostForm.tsx`

| Original (EN) | Traducción (ES) |
|---------------|-----------------|
| `Name is required` (Zod) | `El nombre es obligatorio` |
| `Name must not exceed 255 characters` (Zod) | `El nombre no debe exceder 255 caracteres` |
| `Description is required` (Zod) | `La descripción es obligatoria` |
| `Description must not exceed 2000 characters` (Zod) | `La descripción no debe exceder 2000 caracteres` |
| `Post created successfully` (toast) | `Post creado exitosamente` |
| `An unexpected error occurred` (toast) | `Ocurrió un error inesperado` |
| `Name` (placeholder) | `Nombre` |
| `Description` (placeholder) | `Descripción` |
| `Creating...` (texto accesible) | `Creando...` |
| `Create` (botón) | `Crear` |

#### `src/features/posts/components/PostItem.tsx`

| Original (EN) | Traducción (ES) |
|---------------|-----------------|
| `Post deleted successfully` (toast) | `Post eliminado exitosamente` |
| `Failed to delete post` (toast) | `Error al eliminar el post` |
| `Deleting...` (texto accesible) | `Eliminando...` |
| `Delete` (botón) | `Eliminar` |

#### `src/shared/components/ErrorBoundary.tsx`

| Original (EN) | Traducción (ES) |
|---------------|-----------------|
| `Something went wrong` | `Algo salió mal` |
| `An unexpected error occurred.` | `Ocurrió un error inesperado.` |
| `Try again` (botón) | `Intentar de nuevo` |

#### `src/shared/components/LoadingSpinner.tsx`

| Original (EN) | Traducción (ES) |
|---------------|-----------------|
| `Loading...` (texto accesible) | `Cargando...` |

---

## 3. Tests a actualizar

Los tests que buscan texto en inglés (vía `getByText`, `getByPlaceholderText`, `getByRole({ name })`) deben actualizarse con los nuevos textos en español:

| Archivo de test | Cambios |
|----------------|---------|
| `PostFilter.test.tsx` | Placeholder `"Filtrar por nombre"`, botón `"Buscar"` |
| `PostList.test.tsx` | Mensajes de alerta, encabezados de tabla, botón `"Eliminar"` |
| `PostItem.test.tsx` | Botón `"Eliminar"`, toasts en español |
| `PostForm.test.tsx` | Placeholders, botón `"Crear"`, mensajes de validación Zod |
| `ErrorBoundary.test.tsx` | Mensajes de error, botón `"Intentar de nuevo"` |
| `App.test.tsx` | Heading (sin cambio) |
| `e2e/list-posts.spec.ts` | Encabezados, mensajes |
| `e2e/create-post.spec.ts` | Placeholders, botón, toast |
| `e2e/delete-post.spec.ts` | Botón, toast |
| `e2e/filter-posts.spec.ts` | Placeholder, botón, mensajes |

---

## Criterios de Aceptación

- [ ] Todos los textos visibles al usuario están en español
- [ ] La palabra "post" se mantiene sin traducir (no usar "publicación")
- [ ] El nombre de marca "TCIT Posts Manager" se mantiene en inglés
- [ ] Código fuente (variables, funciones, comentarios) permanece en inglés
- [ ] Todos los tests unitarios pasan con los textos actualizados
- [ ] Todos los tests E2E pasan con los textos actualizados
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run build` compila sin errores

---

## Archivos a modificar

| Archivo | Acción |
|---------|--------|
| `frontend/src/shared/components/LoadingSpinner.tsx` | Modificar — texto accesible |
| `frontend/src/shared/components/ErrorBoundary.tsx` | Modificar — mensajes y botón |
| `frontend/src/features/posts/components/PostFilter.tsx` | Modificar — placeholder y botón |
| `frontend/src/features/posts/components/PostList.tsx` | Modificar — alertas y encabezados |
| `frontend/src/features/posts/components/PostForm.tsx` | Modificar — Zod, toasts, placeholders, botón |
| `frontend/src/features/posts/components/PostItem.tsx` | Modificar — toasts y botón |
| `frontend/src/features/posts/components/PostFilter.test.tsx` | Modificar — textos en español |
| `frontend/src/features/posts/components/PostList.test.tsx` | Modificar — textos en español |
| `frontend/src/features/posts/components/PostItem.test.tsx` | Modificar — textos en español |
| `frontend/src/features/posts/components/PostForm.test.tsx` | Modificar — textos en español |
| `frontend/src/shared/components/ErrorBoundary.test.tsx` | Modificar — textos en español |
| `frontend/e2e/list-posts.spec.ts` | Modificar — textos en español |
| `frontend/e2e/create-post.spec.ts` | Modificar — textos en español |
| `frontend/e2e/delete-post.spec.ts` | Modificar — textos en español |
| `frontend/e2e/filter-posts.spec.ts` | Modificar — textos en español |
