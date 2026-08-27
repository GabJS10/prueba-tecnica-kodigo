# Fase 2 — Lógica de promociones

Documentación de la [Fase 2 del roadmap](../PLAN.md#9-pasos-de-desarrollo-roadmap-de-ejecución).

## Objetivo
Implementar las reglas de negocio: validaciones, máquina de estados, CRUD y resumen,
expuestos como API REST bajo `/api/promotions`.

## Componentes creados

### Máquina de estados — `src/domain/status.ts`
Flujo permitido **solo hacia adelante**: `PROGRAMADA → ACTIVA → FINALIZADA`.
- `canTransition(from, to)` — valida una transición.
- `nextStatus(from)` — siguiente estado natural (o `null` si terminal).
- `isEditable(status)` — `false` si `FINALIZADA` (no se puede modificar).
- `isDeletable(status)` — `true` solo si `PROGRAMADA`.

### Validación — `src/validation/promotionSchema.ts` (Zod)
`createPromotionSchema` aplica todas las reglas del spec:
| Regla | Implementación |
|-------|----------------|
| `name`, `discountValue` requeridos | `.min(1)`, `.positive()` |
| Producto **o** categoría (exactamente uno) | `.refine` con XOR sobre `productId`/`categoryId` |
| `endDate` > `startDate` | `.refine` comparando fechas |
| Si `PERCENTAGE`, valor 1–100 | `.refine` condicional al tipo |

`updateStatusSchema` valida el estado destino del `PATCH`.

### Servicio — `src/services/promotionService.ts`
- `createPromotion` — crea en estado `PROGRAMADA`.
- `listPromotions` — lista con producto/categoría incluidos, orden desc.
- `changeStatus` — valida "editable" + transición antes de actualizar.
- `deletePromotion` — solo si `PROGRAMADA`.
- `getSummary` — contador por estado (`groupBy`) + `activeToday` (hoy dentro de `[start, end]`).
- Errores de dominio en `src/services/errors.ts` (`NotFoundError` → 404, `ConflictError` → 409).

### Rutas — `src/routes/promotions.ts`
| Método | Ruta | Éxito | Errores |
|--------|------|-------|---------|
| `POST` | `/api/promotions` | `201` | `422` validación |
| `GET` | `/api/promotions` | `200` | — |
| `GET` | `/api/promotions/summary` | `200` | — |
| `PATCH` | `/api/promotions/:id/status` | `200` | `409` transición/finalizada, `404`, `422` |
| `DELETE` | `/api/promotions/:id` | `204` | `409` no PROGRAMADA, `404` |

`handleError` mapea `ZodError → 422` (con detalle de campos) y `DomainError → su código HTTP`.
Montadas en `app.ts` bajo `/api/promotions`.

## Verificación (contra Postgres temporal)

| Caso | Esperado | Resultado |
|------|----------|-----------|
| `build` + `lint` | sin errores | ✅ |
| Crear promoción válida | `201` | ✅ |
| Porcentaje > 100 | `422` | ✅ |
| `endDate` < `startDate` | `422` | ✅ |
| Sin nombre/producto | `422` | ✅ |
| `PROGRAMADA → ACTIVA` | `200` | ✅ |
| `ACTIVA → PROGRAMADA` (inválida) | `409` | ✅ |
| Modificar `FINALIZADA` | `409` | ✅ |
| Eliminar `FINALIZADA` | `409` | ✅ |
| Eliminar `PROGRAMADA` | `204` | ✅ |
| `GET /summary` | contadores + `activeToday` | ✅ `{byStatus:{...,FINALIZADA:1},activeToday:1}` |

## Estado
✅ Completado. Siguiente: **Fase 3 — Tests backend (Vitest)** (`specs/03-tests-backend.md`).
