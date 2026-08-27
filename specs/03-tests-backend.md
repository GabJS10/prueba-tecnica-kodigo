# Fase 3 — Tests backend (Vitest)

Documentación de la [Fase 3 del roadmap](../PLAN.md#9-pasos-de-desarrollo-roadmap-de-ejecución).

## Objetivo
Cubrir con pruebas automatizadas las reglas de negocio (foco acordado) y el endpoint `/health`,
sin depender de una base de datos real para que el CI sea rápido y determinista.

## Configuración
- **`vitest.config.ts`** — entorno `node`, incluye `tests/**/*.test.ts`.
- Script `npm test` → `vitest run`.

## Suites

### `tests/status.test.ts` — máquina de estados (9 tests)
- `canTransition`: acepta `PROGRAMADA→ACTIVA` y `ACTIVA→FINALIZADA`; rechaza retrocesos,
  saltos (`PROGRAMADA→FINALIZADA`) y transición al mismo estado.
- `nextStatus`: siguiente estado natural y `null` en terminal.
- `isEditable`: `FINALIZADA` no editable.
- `isDeletable`: solo `PROGRAMADA` eliminable.

### `tests/promotionSchema.test.ts` — validaciones Zod (11 tests)
- Payload válido con producto y con categoría.
- Requeridos: rechaza sin nombre / sin valor de descuento.
- Producto **XOR** categoría: rechaza ninguno y rechaza ambos.
- Fechas: rechaza `endDate <= startDate`.
- Porcentaje: rechaza `>100` y `<1`, acepta límite `100`, permite montos altos si `FIXED`.

### `tests/health.test.ts` — endpoint /health (2 tests)
- Mockea `src/db.js` (`$queryRaw`) con `vi.mock` — sin base de datos real.
- DB operativa → `200 {status:ok, database:up}`.
- DB caída → `503 {status:error, database:down}`.
- Usa `supertest` contra `createApp()` (sin abrir puerto).

## Verificación

| Comando | Resultado |
|---------|-----------|
| `npm test` | ✅ **22 tests, 3 archivos, todos en verde** |
| `npm run lint` (incluye `tests/`) | ✅ sin errores |

## Estado
✅ Completado. Siguiente: **Fase 4 — Frontend (React + Vite)** (`specs/04-frontend.md`).
