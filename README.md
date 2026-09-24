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
