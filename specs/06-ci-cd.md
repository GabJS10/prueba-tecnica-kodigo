# Fase 6 — CI/CD con GitHub Actions

Documentación de la [Fase 6 del roadmap](../PLAN.md#9-pasos-de-desarrollo-roadmap-de-ejecución).

## Objetivo
Automatizar, en etapas dependientes `lint → test → build → smoke`, la verificación del proyecto
en cada push/PR, con manejo estricto de secretos y fallo explícito si falta alguna variable.

## Conceptos (resumen)
- **Workflow**: archivo YAML en `.github/workflows/` que GitHub ejecuta ante un evento.
- **Job**: fase que corre en un runner limpio (`ubuntu-latest`). **Step**: comando/acción.
- **`needs:`**: encadena jobs; si uno falla, los siguientes no corren.
- **Artefactos**: los jobs no comparten disco → se pasan las imágenes Docker vía
  `docker save` + `upload-artifact` / `download-artifact` + `docker load`.
- **Secrets**: valores sensibles cifrados en GitHub, inyectados como variables de entorno.

## Workflow — `.github/workflows/ci.yml`
Disparadores: `push` a `main` y `pull_request`.

| Job | `needs` | Contenido |
|-----|---------|-----------|
| **lint** | — | `npm ci` + `npm run lint` en `backend/` y `frontend/`. |
| **test** | lint | Backend: `npm ci`, `npx prisma generate`, `npm test` (Vitest, Prisma mockeado → sin DB). |
| **build** | test | `docker build` de backend y frontend (`--build-arg VITE_API_URL`); `docker save` → artefacto `docker-images`. Se construye **una sola vez**. |
| **smoke** | build | `download-artifact` + `docker load`; **verifica env requeridas**; genera `.env` desde Secrets; `docker compose up -d --no-build`; espera y `curl /health`; `down -v` al final (`if: always()`). |

### Fallo explícito por variable faltante (requisito del spec)
Primer step del `smoke`: recorre `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`,
`DATABASE_URL`, `VITE_API_URL`; si alguna está vacía → `echo "::error::..."` + `exit 1`.

### Espera del healthcheck
Bucle de 30 intentos (`curl` a `http://localhost:3000/health`, `sleep 3`); si nunca da `200`,
imprime `docker compose logs` y falla.

## Cambio en `docker-compose.yml`
Se añadió `image: promociones-backend` e `image: promociones-frontend` (junto a su `build:`),
para que el job `smoke` reutilice con `--no-build` las imágenes cargadas del artefacto.

## Secrets a crear en GitHub
**Settings → Secrets and variables → Actions → New repository secret** (los añade el usuario):

| Secret | Valor de ejemplo (CI) |
|--------|------------------------|
| `POSTGRES_USER` | `promos_user` |
| `POSTGRES_PASSWORD` | `una_clave_de_prueba` |
| `POSTGRES_DB` | `promos` |
| `DATABASE_URL` | `postgresql://promos_user:una_clave_de_prueba@db:5432/promos?schema=public` |
| `VITE_API_URL` | `http://localhost:3000` |

> `DATABASE_URL` debe ser coherente con los tres primeros y usar el host `db` (nombre del
> servicio en Compose). `VITE_API_URL` no es sensible; se maneja como secret por simplicidad.

## Verificación

| Prueba | Resultado |
|--------|-----------|
| `actionlint` (Docker) sobre el workflow | ✅ sin errores (exit 0) |
| Simulación local: `docker build` de ambas imágenes | ✅ |
| `docker save` + `docker compose up -d --no-build` | ✅ backend `Healthy` |
| `curl /health` | ✅ `200` a la primera |
| `docker compose down -v` | ✅ limpieza |

Pendiente (requiere GitHub, lo hace el usuario):
1. Crear los Secrets de la tabla.
2. `git add .github docker-compose.yml && commit && push`.
3. Ver en la pestaña **Actions** el pipeline `lint → test → build → smoke` en verde.

## Estado
✅ Completado (workflow validado localmente). Siguiente: **Fase 7 — Documentación y entrega**
(`DECISIONS.md`, `README.md`).
