# SGEn Authentication Frontend

Frontend de SGEn conectado al backend NestJS actual: login, selección de organización, sesión y consulta/alta de organizaciones.

## Architecture

- Sesiones con cookies HttpOnly y CSRF; sin tokens en almacenamiento web.
- Renovación de sesión coordinada entre pestañas y rutas protegidas.
- Plataforma: listado, búsqueda, alta y detalle. Cliente: detalle de su organización y permisos.
- Sin registro público. MFA, federación e invitaciones siguen pendientes en backend.

## Tech Stack

- React + TypeScript
- Vite
- CSS Modules e i18next (español/inglés)

## Environment Setup

```bash
cp .env.example .env
```

`VITE_API_BASE_URL` apunta a `http://localhost:3000/api/v1`. Usar `localhost` en ambos servicios y autorizar el origen del frontend en `CORS_ORIGINS`.

## Installation

Node.js 24:

```bash
npm ci
```

## Running the application

Desde la raíz del proyecto (`cd ..`), Docker levanta frontend, backend y PostgreSQL juntos:

```bash
npm run dev
npm run dev:logs
npm run dev:down
```

Frontend: `http://localhost:5173` por defecto. Este entorno usa `http://localhost:5175`, configurado con `FRONTEND_PORT` en `sgen-auth-backend/.env.development.local`.

Para ejecutar sólo Vite desde este repositorio: `npm run dev`. Para validar: `npm run check` (lint, tipos, pruebas y build).

Cuentas locales: `platform@example.test` (alta/listado), `admin.alpha@example.test`, `admin.beta@example.test`, `shared@example.test` (selector de organización) y `suspended@example.test` (acceso rechazado). Contraseña: valor de `DEV_SEED_PASSWORD` en `sgen-auth-backend/.env.development.local`; no se incluye en el frontend.

## Organization

```text
src/
  app/             Rutas, pantallas, sesión compartida y composición de servicios
  features/auth/   API de autenticación, estado de sesión y tipos
  features/organizations/  API y tipos de organizaciones
  shared/          Transporte HTTP, traducciones, controles y estilos
  config/          Configuración pública del cliente
tests/             Regresiones de sesión, transporte, pantallas y traducciones
```

`app` compone las funcionalidades; `shared` no depende de ellas. Los componentes reciben servicios desde el contexto y las pruebas inyectan `fetch`. Contrato y documentos locales: `../Docs/backend/`.
