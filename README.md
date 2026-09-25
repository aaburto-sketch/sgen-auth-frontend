# SGEn Authentication Frontend

This repository contains the frontend application for the SGEn authentication flow. It handles user registration and login, orchestrating the communication between Google Cloud Identity Platform (GCIP) and our NestJS backend.

## Architecture

The frontend acts as the initiator of the authentication flow:
1. Validates user input.
2. Registers/Authenticates the user directly with **Google Cloud Identity Platform (GCIP)** via REST API.
3. Retrieves the secure JWT (IdToken).
4. Submits the JWT to the **SGEn Backend** for tenant provisioning and local database registration.
5. Performs compensating transactions (rollbacks) against GCIP if the local database provisioning fails.

## Tech Stack

- **Framework:** React + TypeScript
- **Bundler:** Vite
- **Styling:** CSS (Vanilla)

## Environment Setup

Duplicate the `.env.example` file and rename it to `.env`:

```bash
cp .env.example .env
```

Set the `VITE_GCIP_API_KEY` to your Firebase Web API Key.

## Installation

```bash
npm install
```

## Running the application

```bash
npm run dev
```

The application will start on `http://localhost:5173/` by default.

## Organization

```text
src/
  app/
    App.tsx                     Application composition
    pages/AuthPage.tsx          Screen and mode selection
    hooks/useAuthenticationForm.ts  Form state and messages
    services/                  Dependency composition and existing flows
  features/
    auth/
      api/                     GCIP REST and profile requests
      components/              Credential fields
      model/                   Input types
    onboarding/
      api/                     Tenant registration API adapter
      components/              Tenant fields
      model/                   Tenant registration input types
  shared/
    api/                       HTTP transport and safe response parsing
    i18n/                      Typed English/Spanish catalogs and error translation
    ui/                        Reusable controls
  config/env.ts                Client configuration
  index.css                    Active styles
  main.tsx                     Entry point
tests/                         Service, form, configuration, and localization tests
```

`app` coordinates features; each feature contains its API, types, and components. `shared` does not import from `app` or `features`. Components do not make HTTP requests. `create-services.ts` builds dependencies and allows tests to inject `fetch` without contacting real services.

Keep feature-specific rules within their feature. Only move code to `shared` when it is used across features. Do not introduce stores, routers, or empty layers until a flow requires them. The template CSS in `src/App.css` and the original assets are not used by the current screen.
