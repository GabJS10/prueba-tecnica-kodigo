# Fase 5 — Docker & Compose

Documentación de la [Fase 5 del roadmap](../PLAN.md#9-pasos-de-desarrollo-roadmap-de-ejecución).

## Objetivo
Empaquetar backend y frontend en imágenes Docker y orquestar todo (db + backend + frontend)
con un solo `docker compose up`, cumpliendo el requisito del spec y el manejo de secretos.

## Imágenes

### `backend/Dockerfile` (multi-stage)
- **build**: `node:22-slim` + `openssl` (necesario para Prisma) → `npm ci`, `prisma generate`,
  `npm run build` (tsc).
- **runtime**: `node:22-slim` + `openssl`. Copia `node_modules`, `dist` y `prisma`.
- **`docker-entrypoint.sh`**: aplica `prisma migrate deploy`, corre el seed (idempotente) y
  arranca `node dist/index.js`. Así el esquema se crea/actualiza solo al levantar.
- `.dockerignore` excluye `node_modules`, `dist`, `.env`.

### `frontend/Dockerfile` (multi-stage)
- **build**: `node:22-slim` → `npm ci`, `npm run build`. La URL del backend se inyecta con
  `ARG VITE_API_URL` (Vite la "hornea" en el bundle en tiempo de build).
- **runtime**: `nginx:alpine` sirve `dist/` con **`nginx.conf`** (fallback SPA a `index.html`
  y cache de `/assets/`).

## Orquestación — `docker-compose.yml`
| Servicio | Imagen / build | Puerto | Healthcheck | Depende de |
|----------|----------------|--------|-------------|------------|
| `db` | `postgres:16-alpine` | interno | `pg_isready` | — |
| `backend` | `./backend` | `${PORT:-3000}` | `fetch(/health)` vía `node -e` | `db` healthy |
| `frontend` | `./frontend` (arg `VITE_API_URL`) | `8080:80` | — | `backend` healthy |

- Volumen `pgdata` persiste la base.
- Todas las credenciales se leen de variables de entorno; **ningún secreto en el repo**.
- Sintaxis `${VAR:?mensaje}` en las variables requeridas: al levantar un servicio que la usa,
  Compose aborta si falta. La garantía principal de "fallar si falta env" es de la app
  (`config/env.ts`, Fase 1) y del pipeline (Fase 6).

## Archivo `.env` (local, no versionado)
Se crea copiando `.env.example`. Para Docker, el host de la DB es `db` y la API es accesible
desde el navegador en `http://localhost:3000`:
```
DATABASE_URL=postgresql://<user>:<pass>@db:5432/<db>?schema=public
VITE_API_URL=http://localhost:3000
```

## Verificación (stack completo real)

| Prueba | Resultado |
|--------|-----------|
| `docker compose config` | ✅ válido |
| `docker compose up -d --build` | ✅ 3 contenedores levantados |
| `db` y `backend` alcanzan estado `healthy` | ✅ |
| `GET :3000/health` | ✅ `200 {"status":"ok","database":"up"}` |
| Frontend en `:8080` | ✅ `200` |
| Seed aplicado (`/api/products`) | ✅ 3 productos |
| Crear promoción vía API | ✅ `201` |
| `/api/promotions/summary` | ✅ contadores correctos |
| `docker compose down -v` | ✅ limpieza completa |

## Estado
✅ Completado. Siguiente: **Fase 6 — CI/CD (GitHub Actions)** (`specs/06-ci-cd.md`).
