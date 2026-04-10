# Spec 01: Funcionalidad — Health Check

## Objetivo

Implementar el endpoint `GET /api/v1/health` de punta a punta: controller, ruta, y verificación de conectividad a la base de datos. Es la primera funcionalidad completa y valida que el backend sirve respuestas correctamente.

**Prerequisito:** Spec 00 completada.

---

## 1. Backend

### Controller (`src/presentation/controllers/healthController.ts`)

```typescript
export class HealthController {
  async check(req: Request, res: Response): Promise<void> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dependencies: { database: 'connected' },
      });
    } catch {
      res.status(503).json({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dependencies: { database: 'disconnected' },
      });
    }
  }
}
```

### Ruta (`src/routes/healthRoutes.ts`)

```typescript
const router = Router();
router.get('/', healthController.check);
export default router;
```

### Registrar en `src/routes/index.ts`

```typescript
router.use('/health', healthRoutes);
```

---

## 2. Tests

### Unit Test (`__tests__/unit/controllers/healthController.test.ts`)

| Caso | Descripción | Esperado |
|------|-------------|----------|
| DB conectada | `$queryRaw` resuelve | 200, status: "ok", database: "connected" |
| DB caída | `$queryRaw` lanza error | 503, status: "degraded", database: "disconnected" |
| Campos presentes | Cualquier respuesta | Contiene timestamp, uptime, dependencies |

### Integration Test (`__tests__/integration/health.test.ts`)

| Caso | Descripción | Esperado |
|------|-------------|----------|
| GET /api/v1/health | Con DB real | 200, status: "ok" |
| Respuesta completa | Verificar schema | Tiene status, timestamp, uptime, dependencies.database |

---

## 3. Frontend

No requiere componente de frontend — el health check es solo backend para monitoreo y load balancers.

---

## Criterios de Aceptación

- [ ] `GET /api/v1/health` retorna 200 con `status: "ok"` cuando la DB está conectada
- [ ] `GET /api/v1/health` retorna 503 con `status: "degraded"` cuando la DB no responde
- [ ] La respuesta incluye `timestamp`, `uptime`, `dependencies.database`
- [ ] Respuesta coincide con el schema del OpenAPI (`HealthResponse`)
- [ ] Tests unitarios e integración pasan

---

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `src/presentation/controllers/healthController.ts` | Crear |
| `src/routes/healthRoutes.ts` | Crear |
| `src/routes/index.ts` | Crear/Modificar — agregar health routes |
| `__tests__/unit/controllers/healthController.test.ts` | Crear |
| `__tests__/integration/health.test.ts` | Crear |
