# Módulo de Gestión de Promociones

Aplicación web para **registrar y gestionar promociones** de un POS, controlando su **estado**
y su **vigencia**. Prueba técnica para Kódigo Fuente.

- **Frontend:** React 19 + Vite 8 + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Base de datos:** PostgreSQL 16 (vía Prisma)
- **Orquestación:** Docker Compose · **CI/CD:** GitHub Actions

> Justificación del stack en [`DECISIONS.md`](./DECISIONS.md).
> Bitácora de desarrollo por fases en [`specs/`](./specs/).

## Funcionalidades

- Crear promociones (nombre, producto **o** categoría, tipo de descuento, valor, vigencia).
- Listar promociones y cambiar su estado: `Programada → Activa → Finalizada`.
- Eliminar promociones (solo en estado `Programada`).
- Validaciones: nombre/valor requeridos, `fecha fin > fecha inicio`, porcentaje entre 1 y 100,
  `Finalizada` inmutable.
- Vista de resumen: contador por estado + promociones **vigentes hoy**.

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose.
- (Solo para desarrollo sin Docker) Node.js ≥ 20 y una instancia de PostgreSQL.

## Puesta en marcha con Docker (recomendado)

```bash
# 1. Clonar y entrar al proyecto
git clone https://github.com/GabJS10/prueba-tecnica-kodigo.git
cd prueba-tecnica-kodigo

# 2. Crear el archivo .env a partir de la plantilla y rellenar los valores
cp .env.example .env
#    edita .env con tus credenciales (ver nota abajo)

# 3. Levantar todo el stack
docker compose up --build
```

Una vez levantado:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:8080 |
| Backend (API) | http://localhost:3000 |
| Healthcheck | http://localhost:3000/health |

El backend aplica las migraciones y siembra datos de ejemplo automáticamente al arrancar.

### Variables de entorno (`.env`)

`.env.example` lista todas las variables **sin valores**. Para Docker, el host de la base de
datos es `db` (nombre del servicio en Compose):

```env
POSTGRES_USER=promos_user
POSTGRES_PASSWORD=tu_clave
POSTGRES_DB=promos
DATABASE_URL=postgresql://promos_user:tu_clave@db:5432/promos?schema=public
PORT=3000
VITE_API_URL=http://localhost:3000
```

> ⚠️ `DATABASE_URL` debe usar el mismo usuario/clave/DB que las tres primeras variables.
> El archivo `.env` real **nunca** se sube al repositorio.

## Desarrollo local (sin Docker)

**Backend:**
```bash
cd backend
npm install
# DATABASE_URL debe apuntar a tu Postgres local (host: localhost)
npx prisma migrate deploy
npm run seed
npm run dev            # http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm install
# opcional: VITE_API_URL en un .env local (por defecto http://localhost:3000)
npm run dev            # http://localhost:5173
```

## API

Base: `/api/promotions`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/promotions` | Listar promociones |
| `POST` | `/api/promotions` | Crear (estado inicial `PROGRAMADA`) |
| `PATCH` | `/api/promotions/:id/status` | Avanzar estado |
| `DELETE` | `/api/promotions/:id` | Eliminar (solo `PROGRAMADA`) |
| `GET` | `/api/promotions/summary` | Contadores por estado + vigentes hoy |
| `GET` | `/api/products` · `/api/categories` | Catálogo para el formulario |
| `GET` | `/health` | `200` si app + DB operativas; `503` si la DB falla |

## Tests

```bash
cd backend
npm test        # Vitest: validaciones, máquina de estados y /health
```

## CI/CD

En cada push a `main` y en cada PR, GitHub Actions ejecuta `lint → test → build → smoke`
(ver [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)). El smoke test levanta el stack
con Docker y verifica que `/health` responde `200`. Las variables sensibles se inyectan desde
**GitHub Secrets** (ver [`specs/06-ci-cd.md`](./specs/06-ci-cd.md)).

## Estructura del proyecto

```
├── backend/            # API Express + TS + Prisma
│   ├── prisma/         # esquema, migraciones y seed
│   └── src/            # config, domain, validation, services, routes
├── frontend/           # React + Vite + TS
│   └── src/            # componentes, api client, estilos
├── docker-compose.yml  # db + backend + frontend
├── .github/workflows/  # pipeline de CI
├── specs/              # documentación por fases del desarrollo
├── DECISIONS.md        # justificación del stack
└── .env.example        # plantilla de variables (sin secretos)
```
