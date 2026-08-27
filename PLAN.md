# Plan de Desarrollo — Módulo de Gestión de Promociones

> Documento de planificación de la prueba técnica de Kódigo Fuente.
> El enunciado original está en [`prueba técnica.md`](./prueba%20técnica.md).

## 1. Contexto

Se construye desde cero una app web para **registrar y gestionar promociones** de un POS,
controlando su **estado** y su **vigencia**. El objetivo es priorizar **calidad sobre cantidad**.

## 2. Stack elegido

| Capa        | Tecnología                          | Motivo (resumen) |
|-------------|-------------------------------------|------------------|
| Frontend    | React + Vite + TypeScript           | Obligatorio por el spec. |
| Backend     | Node.js + Express + TypeScript      | Mismo lenguaje que el front; ligero para el alcance. |
| Base de datos | PostgreSQL (vía Prisma ORM)       | Dominio relacional; migraciones y type-safety. |
| Validación  | Zod                                 | Reglas declarativas reutilizables front/back. |
| Testing     | Vitest                              | Rápido; foco en validaciones de negocio + `/health`. |
| Orquestación | Docker Compose                     | `docker-compose up` como pide el spec. |
| CI/CD       | GitHub Actions                      | `lint → test → build → smoke`. |

La justificación detallada irá en `DECISIONS.md`.

## 3. Modelo de datos (PostgreSQL, ≥2 tablas)

- **`products`** — `id`, `name`.
- **`categories`** — `id`, `name`.
- **`promotions`** — `id`, `name`, `discount_type` (`PERCENTAGE` | `FIXED`), `discount_value`,
  `start_date`, `end_date`, `status` (`PROGRAMADA` | `ACTIVA` | `FINALIZADA`),
  `product_id` (FK, nullable), `category_id` (FK, nullable), timestamps.
  - Regla: exactamente **uno** de `product_id` / `category_id` (validado en la capa de servicio).

Seed inicial con productos y categorías de ejemplo.

## 4. Estructura del repositorio

```
/
├── docker-compose.yml          # postgres + backend + frontend
├── .env.example                # variables SIN valores reales
├── .gitignore
├── README.md                   # pasos para levantar local
├── DECISIONS.md                # justificación del stack
├── PLAN.md                     # este documento
├── .github/workflows/ci.yml    # lint → test → build → smoke
├── backend/
│   ├── Dockerfile
│   ├── package.json  tsconfig.json  .eslintrc
│   ├── prisma/schema.prisma  prisma/seed.ts
│   ├── src/
│   │   ├── index.ts            # bootstrap servidor
│   │   ├── app.ts              # express app (exportable para tests)
│   │   ├── config/env.ts       # valida env requeridas; falla explícito si falta
│   │   ├── db.ts               # PrismaClient
│   │   ├── domain/status.ts    # máquina de estados + transiciones
│   │   ├── validation/promotionSchema.ts   # Zod
│   │   ├── services/promotionService.ts     # lógica de negocio
│   │   └── routes/{health.ts, promotions.ts}
│   └── tests/                  # Vitest: validaciones + /health
└── frontend/
    ├── Dockerfile  nginx.conf
    ├── package.json  vite.config.ts  tsconfig.json
    └── src/
        ├── main.tsx  App.tsx  types.ts
        ├── api/client.ts
        └── components/{PromotionForm, PromotionList, SummaryCards}.tsx
```

## 5. API del backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST`   | `/api/promotions`           | Crear promoción (estado inicial `PROGRAMADA`). |
| `GET`    | `/api/promotions`           | Listar con datos principales. |
| `PATCH`  | `/api/promotions/:id/status`| Avanzar estado (`PROGRAMADA`→`ACTIVA`→`FINALIZADA`). |
| `DELETE` | `/api/promotions/:id`       | Eliminar (solo si `PROGRAMADA`). |
| `GET`    | `/api/promotions/summary`   | Contadores por estado + nº vigentes hoy. |
| `GET`    | `/health`                   | `200` si app + DB operativas (`SELECT 1`); `503` si falla. |

### Validaciones (con tests)
- Requeridos: `name`, producto **o** categoría, `discount_value`.
- `end_date` > `start_date`.
- Si `discount_type = PERCENTAGE` → valor entre **1 y 100**.
- Promoción `FINALIZADA` **no** puede modificarse.
- Transiciones de estado inválidas → error `409/422`.

## 6. Frontend

- **Formulario** de creación con validación en cliente (espejo de las reglas del backend).
- **Lista** de promociones con acciones: avanzar estado, eliminar (solo `PROGRAMADA`).
- **Resumen**: contadores por estado + "vigentes hoy".
- URL del backend vía `VITE_API_URL`. En producción se sirve con nginx.

## 7. Docker, Compose y secretos

- **Backend Dockerfile**: multi-stage; entrypoint corre `prisma migrate deploy` + seed y arranca.
- **Frontend Dockerfile**: multi-stage (build Vite → nginx con fallback a `index.html`).
- **docker-compose.yml**: `db` (postgres:16-alpine + healthcheck `pg_isready`),
  `backend` (healthcheck a `/health`, depende de `db` healthy), `frontend` (depende de `backend`).
- **Sin secretos en el repo.** `.env.example` con: `POSTGRES_USER`, `POSTGRES_PASSWORD`,
  `POSTGRES_DB`, `DATABASE_URL`, `PORT`, `VITE_API_URL` (sin valores reales).
- `config/env.ts` valida las env requeridas al arrancar y **falla explícito** si faltan.

## 8. CI/CD (GitHub Actions)

Etapas dependientes con `needs:`:
1. **lint** — ESLint backend + frontend.
2. **test** — Vitest (validaciones + `/health`).
3. **build** — `docker build` de imágenes backend y frontend.
4. **smoke** — `docker compose up -d`, esperar contenedores, `curl -f /health`; si ≠ `200`, **falla**.

- Secretos inyectados vía **GitHub Secrets** (se genera `.env` en runtime).
- Verificación previa de env requeridas con `: "${VAR:?mensaje}"` → falla explícita si falta alguna.

---

## 9. Pasos de desarrollo (roadmap de ejecución)

Cada paso deja algo verificable.

### Fase 0 — Andamiaje
1. `git init` + `.gitignore` (`.env`, `node_modules`, `dist`).
2. Estructura de carpetas `backend/` y `frontend/`.
3. `.env.example` con todas las variables (sin valores reales).

### Fase 1 — Backend base + DB
4. `npm init` backend: Express, TS, Zod, Prisma, Vitest, ESLint; `tsconfig` y `.eslintrc`.
5. `config/env.ts`: valida env requeridas; falla explícito si faltan.
6. `schema.prisma` (`products`, `categories`, `promotions`) + 1ª migración + `seed.ts`.
7. `db.ts` (PrismaClient) + `app.ts`/`index.ts` con Express arrancando.
8. `GET /health` (`SELECT 1`). **Verificar:** `curl /health` → 200.

### Fase 2 — Lógica de promociones
9. `domain/status.ts`: máquina de estados y transiciones válidas.
10. `validation/promotionSchema.ts` (Zod) con todas las reglas.
11. `services/promotionService.ts`: crear, listar, cambiar estado, eliminar (solo `PROGRAMADA`),
    bloquear edición de `FINALIZADA`, resumen.
12. `routes/promotions.ts`: CRUD + `/status` + `/summary`. **Verificar:** curl.

### Fase 3 — Tests backend
13. Vitest: validaciones (nombre, `end>start`, % 1–100, transiciones, `FINALIZADA` inmutable)
    + test de `/health`. **Verificar:** `npm test` verde.

### Fase 4 — Frontend
14. `npm create vite` (React+TS); `api/client.ts` con `VITE_API_URL`; `types.ts`.
15. `SummaryCards`, `PromotionList` (con acciones), `PromotionForm` (validación en cliente).
16. Ensamblar en `App.tsx` + estilos mínimos. **Verificar:** flujo E2E en dev.

### Fase 5 — Docker & Compose
17. `backend/Dockerfile` (multi-stage; entrypoint `prisma migrate deploy` + seed).
18. `frontend/Dockerfile` + `nginx.conf`.
19. `docker-compose.yml` (db + backend + frontend, healthchecks, `depends_on`).
    **Verificar:** `docker-compose up --build` + flujo E2E.

### Fase 6 — CI/CD
20. `.github/workflows/ci.yml` con `lint → test → build → smoke` (`needs:`).
21. Verificación de env requeridas + inyección desde GitHub Secrets.
22. Smoke: `docker compose up -d` → esperar → `curl -f /health`; fallar si ≠200.

### Fase 7 — Documentación y entrega
23. `DECISIONS.md` (justificación del stack).
24. `README.md` (pasos locales).
25. Repo público en GitHub, push, **Actions en verde**.

---

## 10. Verificación end-to-end

1. `cp .env.example .env` → `docker-compose up --build`.
2. `curl -f http://localhost:PORT/health` → `200`.
3. Crear promoción probando validaciones (sin nombre, `end<start`, % fuera de 1–100 → error).
4. Avanzar `PROGRAMADA`→`ACTIVA`→`FINALIZADA`; confirmar que `FINALIZADA` no se edita/elimina.
5. Ver resumen (contadores + vigentes hoy) reflejando cambios.
6. `npm test` en `backend/` verde.
7. Push a GitHub → pestaña **Actions** con `lint → test → build → smoke` en verde.

## 11. Checklist de entregables

- [ ] Repo público en GitHub.
- [ ] `DECISIONS.md` con justificación del stack.
- [ ] `README.md` con pasos locales.
- [ ] `.env.example` sin valores reales.
- [ ] GitHub Actions funcional y visible en la pestaña **Actions**.
