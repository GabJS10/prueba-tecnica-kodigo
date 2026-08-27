# Fase 7 — Documentación y entrega

Documentación de la [Fase 7 del roadmap](../PLAN.md#9-pasos-de-desarrollo-roadmap-de-ejecución).

## Objetivo
Completar los entregables documentales del spec: justificación del stack y guía para levantar
el proyecto.

## Archivos creados

### `DECISIONS.md`
Justifica cada elección tecnológica:
- **Node + Express + TS**: un solo lenguaje en el stack; Express minimalista frente a NestJS/Laravel.
- **PostgreSQL**: dominio relacional (promoción → producto/categoría con FK).
- **Prisma**: migraciones versionadas, type-safety, `/health` trivial.
- **Zod**, **Vitest**: validación declarativa y tests rápidos con Prisma mockeado.
- Decisiones de diseño: máquina de estados unidireccional, regla producto XOR categoría, manejo
  de secretos, identidad visual de Kódigo.
- Diagrama de capas del backend.

### `README.md`
- Descripción, stack y funcionalidades.
- **Puesta en marcha con Docker**: `cp .env.example .env` → `docker compose up --build`; URLs
  (frontend `:8080`, backend `:3000`, `/health`).
- Nota sobre variables de entorno (host `db`, `DATABASE_URL` coherente, `.env` nunca versionado).
- Desarrollo local sin Docker (backend y frontend).
- Tabla de endpoints de la API, cómo correr tests y descripción del pipeline de CI.
- Estructura del proyecto.

## Checklist de entregables (spec §5)

| Entregable | Estado |
|-----------|--------|
| Repositorio público en GitHub | ✅ `github.com/GabJS10/prueba-tecnica-kodigo` |
| `DECISIONS.md` | ✅ |
| `README.md` con pasos locales | ✅ |
| `.env.example` sin valores reales | ✅ (Fase 0) |
| GitHub Actions funcional y visible | ✅ (Fase 6, en verde) |
| Backend con `/health` | ✅ (Fase 1) |
| `docker-compose up` levanta todo | ✅ (Fase 5) |
| Mínimo 2 tablas | ✅ 3 tablas (`products`, `categories`, `promotions`) |

## Estado
✅ Completado. Proyecto listo para entrega (pendiente el commit/push final, a cargo del usuario).
