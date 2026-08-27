# Fase 0 — Andamiaje

Documentación del paso 0 del [roadmap](../PLAN.md#9-pasos-de-desarrollo-roadmap-de-ejecución).

## Objetivo
Preparar el esqueleto del repositorio: control de versiones, estructura de carpetas
y plantilla de variables de entorno, sin ningún secreto en el repo.

## Acciones realizadas

1. **`git init`** — inicializado el repositorio Git.

2. **Estructura de carpetas** creada:
   ```
   backend/src/     # código del backend (Express + TS)
   frontend/src/    # código del frontend (React + Vite)
   specs/           # documentación por fase (este directorio)
   ```

3. **`.gitignore`** — ignora `node_modules/`, `dist/`, `build/`, archivos `.env*`
   (excepto `.env.example`), bases locales (`*.db`, `*.sqlite`), logs y archivos de editor.
   > Clave para el requisito de secretos: `.env` queda fuera del control de versiones.

4. **`.env.example`** — plantilla con todas las variables **sin valores reales**:
   | Variable | Uso |
   |----------|-----|
   | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Credenciales de PostgreSQL. |
   | `DATABASE_URL` | Cadena de conexión de Prisma. |
   | `PORT` | Puerto del backend. |
   | `VITE_API_URL` | URL del backend consumida por el frontend. |

## Verificación
- `git status` reconoce el repo.
- `.env.example` presente y versionado; `.env` real quedará ignorado.

## Estado
✅ Completado. Siguiente: **Fase 1 — Backend base + DB** (`specs/01-backend-base.md`).
