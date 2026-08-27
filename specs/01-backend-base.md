# Fase 1 — Backend base + Base de datos

Documentación de la [Fase 1 del roadmap](../PLAN.md#9-pasos-de-desarrollo-roadmap-de-ejecución).

## Objetivo
Levantar el backend (Express + TypeScript), definir el modelo de datos en PostgreSQL
vía Prisma, validar variables de entorno de forma estricta y exponer `/health`.

## Acciones realizadas

### Configuración del proyecto
- **`package.json`** — Express, Prisma, Zod (dep.) + TypeScript, ESLint, Vitest, tsx, supertest (dev).
  Scripts: `dev`, `build`, `start`, `lint`, `test`, `prisma:*`, `seed`.
- **`tsconfig.json`** — target ES2022, modo `strict`, salida a `dist/`.
- **`.eslintrc.json`** — `@typescript-eslint` recomendado.

### Validación de entorno — `src/config/env.ts`
- Comprueba las variables requeridas (`DATABASE_URL`) al arrancar.
- Si falta alguna, hace `throw` y el proceso sale con **código ≠ 0** (falla explícita, requisito del CI).
- Expone `env` tipado (`databaseUrl`, `port`, `nodeEnv`).

### Modelo de datos — `prisma/schema.prisma`
Tres tablas (≥2 requeridas):
- **`products`** — `id`, `name`.
- **`categories`** — `id`, `name`.
- **`promotions`** — `id`, `name`, `discount_type` (enum `PERCENTAGE|FIXED`), `discount_value` (Decimal),
  `start_date`, `end_date`, `status` (enum `PROGRAMADA|ACTIVA|FINALIZADA`, default `PROGRAMADA`),
  `product_id`/`category_id` (FK nullable), `created_at`, `updated_at`.
- **`prisma/seed.ts`** — inserta productos y categorías de ejemplo (idempotente).
- Migración inicial generada en `prisma/migrations/…_init/`.

### Relaciones entre tablas (detalle)

El dominio es relacional: **una promoción se aplica a un producto concreto o a una categoría
completa**, nunca a ambos ni a ninguno. Esto se modela con dos relaciones opcionales desde
`promotions`.

```
┌────────────┐          ┌─────────────────────┐          ┌──────────────┐
│  products  │ 1      N │     promotions      │ N      1 │  categories  │
│────────────│──────────│─────────────────────│──────────│──────────────│
│ id (PK)    │          │ id (PK)             │          │ id (PK)      │
│ name       │          │ name                │          │ name         │
└────────────┘          │ discount_type       │          └──────────────┘
                        │ discount_value      │
        product_id ●────│ product_id  (FK,∅)  │
        (nullable)      │ category_id (FK,∅)  │────● category_id
                        │ status              │        (nullable)
                        │ start_date          │
                        │ end_date            │
                        └─────────────────────┘
```

**Cardinalidad**
- `Product 1 —— N Promotion`: un producto puede tener muchas promociones a lo largo del
  tiempo; cada promoción referencia como mucho un producto. Relación **uno-a-muchos**.
- `Category 1 —— N Promotion`: análoga para categorías. Relación **uno-a-muchos**.
- Ambas relaciones son **opcionales** (`product_id` y `category_id` son `NULL`-ables), porque
  cada promoción usa solo una de las dos.

**Claves foráneas (implementación Prisma)**
- `Promotion.productId → Product.id` mediante `@relation(fields: [productId], references: [id])`.
- `Promotion.categoryId → Category.id` mediante `@relation(fields: [categoryId], references: [id])`.
- Prisma crea el constraint `FOREIGN KEY` en PostgreSQL. Por defecto, `onDelete: Restrict`:
  no se puede borrar un producto/categoría mientras tenga promociones asociadas (protege la
  integridad referencial; evita promociones "huérfanas").
- En el lado inverso, `Product.promotions` y `Category.promotions` son campos virtuales de
  Prisma (no columnas): permiten navegar de un producto/categoría a sus promociones.

**Regla "producto XOR categoría"**
- El modelo permite físicamente que ambas FK sean `NULL` o que ambas estén rellenas; la regla
  de negocio (exactamente una) se **garantiza en la capa de servicio** (Fase 2) al validar el
  payload antes de escribir.
- *Opcional*: podría reforzarse a nivel de base de datos con un `CHECK`
  (`num_nonnulls(product_id, category_id) = 1`) vía migración manual. Se documenta como mejora,
  pero la validación en aplicación es suficiente para el alcance de la prueba.

**Por qué este diseño (y no una sola columna polimórfica)**
- Usar dos FK explícitas con su constraint real mantiene la **integridad referencial** que da
  PostgreSQL. Una única columna genérica tipo `target_id` + `target_type` (polimórfica) no
  permitiría declarar la FK y trasladaría toda la validación a la aplicación, perdiendo la
  garantía de la base de datos. Con dos FK, la DB verifica que el producto/categoría exista.

### Servidor
- **`src/db.ts`** — `PrismaClient` único.
- **`src/routes/health.ts`** — `GET /health`: `SELECT 1` → `200 {status:ok}`; si la DB falla → `503`.
- **`src/app.ts`** — `createApp()` (Express + CORS + JSON), exportable para tests sin abrir puerto.
- **`src/index.ts`** — arranca el servidor en `env.port`.

## Verificación

| Prueba | Resultado |
|--------|-----------|
| `npm run build` (tsc) | ✅ sin errores |
| `npm run lint` (eslint) | ✅ sin errores |
| `prisma migrate dev` + `seed` sobre Postgres | ✅ tablas creadas y sembradas |
| `curl /health` con DB activa | ✅ `200 {"status":"ok","database":"up"}` |
| Arranque **sin** `DATABASE_URL` | ✅ falla explícito, exit code `1` |

> Verificación hecha contra un contenedor `postgres:16-alpine` temporal (eliminado tras la prueba).
> La orquestación definitiva con Compose llega en la Fase 5.

## Estado
✅ Completado. Siguiente: **Fase 2 — Lógica de promociones** (`specs/02-logica-promociones.md`).
