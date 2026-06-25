# ShopVN E-commerce Platform

A full-stack e-commerce platform built with TypeScript in an Nx monorepo. The project combines a Next.js storefront and admin interface, a NestJS REST API, PostgreSQL with Prisma, shared workspace libraries, unit tests, and Playwright end-to-end tests.

> **Project status:** under active development. The repository already contains the main storefront, authentication, customer, commerce, and administration modules, but it is not presented as a production-ready release yet.

## Main features

- Guest, customer, and admin application areas
- Registration, login, logout, session handling, and role-based access control
- Product catalog with search, filters, sorting, pagination, and product details
- Shopping cart, vouchers, checkout, and order flows
- Customer profile, address book, and order history
- Admin dashboard and management interfaces
- NestJS modules for authentication, products, categories, addresses, carts, vouchers, checkout, orders, and dashboard data
- PostgreSQL database access through Prisma
- Unit testing with Jest and end-to-end testing with Playwright
- Docker Compose services for PostgreSQL and pgAdmin

## Tech stack

| Area | Technologies |
| --- | --- |
| Monorepo | Nx 22 |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, Flowbite React |
| Backend | NestJS 11, TypeScript, class-validator |
| Database | PostgreSQL 17, Prisma 7 |
| Testing | Jest, Testing Library, Playwright |
| Tooling | ESLint, Prettier, Docker Compose |

## Repository structure

```text
.
├── apps/
│   ├── api/              # NestJS REST API
│   ├── api-e2e/          # Backend end-to-end tests
│   ├── web/              # Next.js application
│   └── web-e2e/          # Playwright frontend tests
├── libs/
│   ├── api/              # API contracts and reusable API libraries
│   ├── infrastructure/   # Database and infrastructure libraries
│   └── shared/           # Shared types and utilities
├── docs/                 # SRS, SDD, ERD, API, and use-case documentation
├── openspec/             # Specifications and archived implementation changes
├── docker-compose.yml
├── nx.json
├── package.json
└── prisma.config.ts
```

## Prerequisites

Install the following tools before running the project:

- Node.js 20 or newer
- npm
- Docker Engine or Docker Desktop with Docker Compose

## Getting started

### 1. Clone and install dependencies

```bash
git clone https://github.com/hungnguyendz9913/e-commerce-platform.git
cd e-commerce-platform
npm install
```

### 2. Configure the backend and database environment

Copy the example environment file:

```bash
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

Keep the PostgreSQL and pgAdmin values from `.env.example`, then add these variables to the root `.env` file:

```dotenv
DATABASE_URL=postgresql://ecommerce_platform_by_hung_nguyen:your_postgres_password@localhost:5432/ecommerce_platform_db?schema=public
JWT_SECRET=replace-with-a-long-random-secret
```

The username, password, port, and database name in `DATABASE_URL` must match the corresponding PostgreSQL variables in the same file.

### 3. Configure the frontend API URL

Create `apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

The backend is run on port `3001` during local development so that the Next.js application can use port `3000`.

### 4. Start PostgreSQL and pgAdmin

```bash
npm run db:up
```

Available local services:

| Service | Address |
| --- | --- |
| PostgreSQL | `localhost:5432` |
| pgAdmin | `http://localhost:8080` |

The actual ports follow the values configured in `.env`.

### 5. Generate the Prisma client and apply migrations

```bash
npm run db:generate
npm run db:migrate
```

To inspect the database with Prisma Studio:

```bash
npm run db:studio
```

### 6. Start the backend API

WSL, Linux, or macOS:

```bash
PORT=3001 npm run dev:api
```

PowerShell:

```powershell
$env:PORT=3001
npm run dev:api
```

The API will be available at:

```text
http://localhost:3001/api
```

### 7. Start the frontend

Open another terminal and run:

```bash
npm run dev:web
```

The web application will be available at:

```text
http://localhost:3000
```

`npm run dev` is an alias for `npm run dev:web`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js application in development mode |
| `npm run dev:web` | Start the frontend development server |
| `npm run dev:api` | Start the NestJS API in development mode |
| `npm run build` | Build every Nx project that has a build target |
| `npm run build:web` | Build the Next.js application |
| `npm run build:api` | Build the NestJS API |
| `npm run start:web` | Start the production Next.js server after building |
| `npm run start:api` | Start the API with its production Nx configuration |
| `npm run lint` | Lint all supported workspace projects |
| `npm run typecheck` | Type-check all supported workspace projects |
| `npm run test` | Run all unit tests |
| `npm run test:web` | Run frontend unit tests |
| `npm run test:api` | Run backend unit tests |
| `npm run e2e` | Run Playwright tests for the web application |
| `npm run format` | Format workspace files with Nx and Prettier |
| `npm run format:check` | Check formatting without modifying files |
| `npm run graph` | Open the Nx dependency graph |
| `npm run db:up` | Start PostgreSQL and pgAdmin containers |
| `npm run db:down` | Stop and remove the Docker Compose containers |
| `npm run db:logs` | Follow Docker Compose logs |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create or apply local Prisma migrations |
| `npm run db:migrate:deploy` | Apply existing migrations in deployment environments |
| `npm run db:studio` | Open Prisma Studio |

## Common development workflow

Run these commands before opening a pull request:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Use the Nx dependency graph when working across applications and shared libraries:

```bash
npm run graph
```

## Project documentation

More detailed project documents are available in `docs/`:

- Software Requirements Specification
- Software Design Document
- Entity Relationship Diagram
- API documentation
- Use-case specification

Implementation proposals, specifications, and archived changes are stored in `openspec/`.

## License

This project is licensed under the MIT License.
