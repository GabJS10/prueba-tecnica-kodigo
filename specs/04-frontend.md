# Fase 4 — Frontend (React + Vite)

Documentación de la [Fase 4 del roadmap](../PLAN.md#9-pasos-de-desarrollo-roadmap-de-ejecución).

## Objetivo
Construir la interfaz: formulario de creación con validación en cliente, listado con acciones
(avanzar estado / eliminar) y vista de resumen, consumiendo la API del backend.

## Configuración
- **`package.json`** — React 19.2 + Vite 8.2 (últimas versiones) + TypeScript;
  scripts `dev`, `build`, `preview`, `lint`.
- **`vite.config.ts`** — plugin React, `host: true`, puerto 5173.
- **`tsconfig.json`** — `strict`, `noUnusedLocals/Parameters`, JSX `react-jsx`.
- **`.eslintrc.cjs`** — reglas TS + `react-hooks` + `react-refresh`.
- **`src/vite-env.d.ts`** — tipa `import.meta.env.VITE_API_URL`.

## Estructura
- **`src/types.ts`** — tipos compartidos (`Promotion`, `Summary`, `CreatePromotionPayload`, …).
- **`src/constants.ts`** — `NEXT_STATUS`, etiquetas de estado y de botón de avance.
- **`src/api/client.ts`** — wrapper de `fetch` con `VITE_API_URL` (fallback `http://localhost:3000`);
  propaga el mensaje de error del backend. Métodos: listar/crear/cambiar estado/eliminar
  promociones + listar productos y categorías.
- **`src/components/`**
  - `SummaryCards.tsx` — tarjetas: contador por estado + "vigentes hoy".
  - `PromotionForm.tsx` — formulario con **validación en cliente** que refleja las reglas del
    backend (nombre, producto/categoría, valor > 0, % 1–100, `fin > inicio`).
  - `PromotionList.tsx` — tabla con acciones condicionadas al estado (avanzar; eliminar solo
    si `PROGRAMADA`).
- **`src/App.tsx`** — orquesta carga inicial, refresco tras cada acción y manejo de errores.
- **`src/index.css`** — estilos (tarjetas, tabla, badges por estado, responsive).

## Cambio en el backend (necesario para el formulario)
Se añadió **`src/routes/catalog.ts`**: `GET /api/products` y `GET /api/categories`, montado en
`/api`. El formulario los usa para poblar los selectores de producto/categoría.

## Verificación

| Prueba | Resultado |
|--------|-----------|
| `npm run build` (tsc + vite) | ✅ build de producción generado |
| `npm run lint` | ✅ sin errores |
| Endpoints consumidos por el front (`/api/products`, `/categories`, `/promotions`, `/summary`) | ✅ `200` |
| `vite preview` sirve el SPA | ✅ `200`, contiene `<div id="root">` |

> Backend y frontend probados juntos contra un Postgres temporal (eliminado tras la prueba).

## Estado
✅ Completado. Siguiente: **Fase 5 — Docker & Compose** (`specs/05-docker-compose.md`).
