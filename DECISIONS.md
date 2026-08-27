# DECISIONS.md — Decisiones técnicas

Justificación de las herramientas elegidas para el módulo de gestión de promociones.
El spec da libertad de stack (salvo React + Vite en el frontend) a cambio de justificar cada
elección aquí.

## Resumen del stack

| Capa | Elección | Alternativas consideradas |
|------|----------|---------------------------|
| Frontend | React 19 + Vite 8 + TypeScript | (Obligatorio por el spec) |
| Backend | Node.js + Express + TypeScript | Laravel, NestJS |
| Base de datos | PostgreSQL 16 | MongoDB, SQL Server |
| ORM | Prisma | Knex, `pg` a mano, TypeORM |
| Validación | Zod | Joi, class-validator |
| Testing | Vitest + Supertest | Jest |
| Contenedores | Docker + Docker Compose | (Obligatorio por el spec) |
| CI/CD | GitHub Actions | (Obligatorio por el spec) |

## Backend: Node.js + Express + TypeScript

- **Un solo lenguaje en todo el stack.** El frontend es obligatoriamente JS/TS; usar Node en el
  backend evita cambiar de contexto y permite compartir tipos y reglas de validación mentales
  entre ambos lados.
- **Express** es minimalista y suficiente para el alcance (un CRUD + reglas de negocio). Se
  descartó **NestJS** por ser demasiado estructura/boilerplate para el tamaño del problema
  ("prioriza la calidad sobre la cantidad"), y **Laravel** por introducir un segundo runtime
  (PHP) sin aportar ventaja aquí.
- **TypeScript** aporta seguridad de tipos en dominio, servicios y contratos de la API.

## Base de datos: PostgreSQL

- El dominio es **claramente relacional**: una promoción se asocia a un producto **o** a una
  categoría, con integridad referencial real (claves foráneas). PostgreSQL modela esto de forma
  natural y garantiza la consistencia a nivel de motor.
- Se descartó **MongoDB** porque un modelo documental no aporta aquí y perdería las FK; y
  **SQL Server** por imagen más pesada y tooling menos común en el ecosistema Node.
- Cumple el mínimo de **2 tablas**: se usan **3** (`products`, `categories`, `promotions`).

## ORM: Prisma

- **Migraciones versionadas** (`prisma migrate`) que se aplican solas al levantar el contenedor.
- **Type-safety** de extremo a extremo: los tipos del cliente se generan desde el esquema.
- **`/health` trivial**: `SELECT 1` mediante `prisma.$queryRaw` para comprobar la conexión.
- Alternativa (`pg` + SQL a mano) daría más control pero más código repetitivo y sin migraciones
  ni tipos gratis.

## Validación: Zod

- Reglas declarativas y componibles que reflejan 1:1 los requisitos del spec (nombre requerido,
  `fin > inicio`, porcentaje 1–100, producto XOR categoría).
- Infiere tipos TypeScript del propio esquema, evitando duplicar definiciones.

## Testing: Vitest

- Rápido y con API compatible con Jest; integra de forma nativa con el toolchain de Vite/TS.
- Los tests se centran en las **reglas de negocio** (máquina de estados y validaciones) y en
  `/health`, con Prisma **mockeado** para que el CI sea rápido y no dependa de una base de datos.

## Decisiones de diseño destacadas

- **Máquina de estados unidireccional** `PROGRAMADA → ACTIVA → FINALIZADA`: interpretada de las
  flechas del spec y reforzada por sus reglas (`FINALIZADA` inmutable, borrado solo en
  `PROGRAMADA`). Se implementa en `domain/status.ts` y se valida en la capa de servicio.
- **Regla "producto XOR categoría"** garantizada en el servicio (no se permite ninguno ni ambos).
  Un `CHECK` a nivel de DB queda como mejora opcional.
- **Manejo de secretos**: nada sensible en el repo. `.env.example` sin valores, `.env` ignorado,
  y en CI las variables se inyectan desde **GitHub Secrets**; el pipeline y la app fallan de
  forma explícita si falta alguna (`config/env.ts` y un step de verificación en el smoke test).
- **Frontend con identidad de Kódigo Fuente**: paleta y estilo tomados del sitio corporativo
  (tema SB Admin Pro), con Manrope y un sistema de tokens propio.

## Arquitectura del backend (capas)

```
routes/        → HTTP: parseo, códigos de estado, mapeo de errores
  ↓
services/      → lógica de negocio y reglas de dominio
  ↓
domain/        → máquina de estados (puro, sin dependencias)
validation/    → esquemas Zod
db.ts          → PrismaClient
```

Esta separación mantiene la lógica testeable de forma aislada (los tests de `domain` y
`validation` no tocan Express ni la base de datos).
