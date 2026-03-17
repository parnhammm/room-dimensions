# room-dimensions

A web application for managing and visualising room dimensions through an interactive UI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18+ · TypeScript (strict) · Tailwind CSS · Vite |
| Backend | Node.js (LTS) · TypeScript (strict) · Express 4 · TypeORM 0.3 |
| Database | MySQL 8+ |
| Containerisation | Docker + Docker Compose |
| Testing | Vitest · React Testing Library · Jest · Supertest · Playwright |
| Linting / Formatting | ESLint (`@typescript-eslint/recommended`) · Prettier · Husky |

---

## Quickstart

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Node.js LTS](https://nodejs.org/) (v20+)

### 1. Clone and install dependencies

```bash
git clone <repo-url> room-dimensions
cd room-dimensions
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env if you need non-default DB credentials
```

### 3. Start the application

**Option A — Docker (production build, recommended for a quick look)**

```bash
docker compose up
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger UI | http://localhost:4000/api/docs |
| MySQL | localhost:3306 |

**Option B — Local dev servers (hot reload)**

Start the database first, then run backend and frontend in separate terminals:

```bash
# Terminal 1 — database only
docker compose up mysql

# Terminal 2 — backend (http://localhost:4000)
cd backend
npm run dev

# Terminal 3 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 4. Run the database migration

```bash
cd backend
npm run migration:run
```

This sets up the schema. The app is now fully operational.

---

## Running Tests

The project follows the **Testing Pyramid** with three tiers:

### Tier 1 — Unit tests (fast, no external dependencies)

```bash
# Frontend component tests
cd frontend && npm test

# Backend unit tests
cd backend && npm test
```

### Tier 2 — Integration tests (requires Docker test database)

```bash
# Start the test database (MySQL on port 3307)
docker compose -f docker-compose.test.yml up -d

# Run backend integration tests
cd backend
DB_HOST=localhost DB_PORT=3307 DB_USERNAME=root DB_PASSWORD=testpassword \
  DB_DATABASE=room_dimensions_test npm test
```

> Integration test suites run sequentially (`maxWorkers: 1`) to avoid race conditions on the shared test database.

### Tier 3 — End-to-end tests (requires full stack)

```bash
# Start the full application stack
docker compose up -d

# Run Playwright E2E tests (from repo root)
npx playwright test --config tests/e2e/playwright.config.ts
```

Coverage is measured at the unit tier only. Business logic must maintain ≥ 80% line/branch coverage.

---

## Project Structure

```
├── frontend/              # React + TypeScript + Tailwind CSS (Vite)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route-level page components
│   │   ├── services/      # API client functions
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # Shared TypeScript types
│   └── tests/             # Vitest + React Testing Library
├── backend/               # Node.js + TypeScript + Express + TypeORM
│   ├── src/
│   │   ├── controllers/   # HTTP request handlers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access layer
│   │   ├── entities/      # TypeORM entity definitions
│   │   ├── dto/           # Request/response data transfer objects
│   │   ├── routes/        # Express route registration
│   │   └── migrations/    # TypeORM database migrations
│   └── tests/             # Jest + Supertest (unit + integration)
├── tests/
│   └── e2e/               # Playwright user journey tests
├── specs/                 # Feature specifications and implementation plans
├── docker-compose.yml     # Production stack
├── docker-compose.test.yml # Test database only
└── .env.example           # Environment variable template
```

---

## Development

### Branching

This project uses **GitHub Flow**. All branches MUST use a type prefix:

| Prefix | Use for |
|--------|---------|
| `feature/` | New functionality |
| `bug/` | Bug fixes |
| `refactor/` | Code restructuring (no behaviour change) |
| `chore/` | Tooling, dependencies, CI |
| `docs/` | Documentation only |
| `test/` | Test additions or fixes |

Examples: `feature/room-canvas`, `bug/wall-overlap-calculation`

Direct commits to `main` are prohibited. All changes arrive via Pull Request.

### Commit Messages

```
<type>: <imperative description under 72 chars>
```

The `<type>` must match the branch prefix. Examples:

```
feature: add floor and ceiling dimension panels
bug: fix dimension rounding on fractional inputs
chore: configure Husky pre-commit hooks
```

### Contributing Checklist

Before opening a PR, ensure:

- All linting passes: `npm run lint`
- All tests pass across all three tiers
- `npm audit` reports zero high/critical vulnerabilities
- The PR changes ≤ 500 lines in any single file, and ideally ≤ 20 files total
- New packages are evaluated for maintenance status, licence compatibility, and bundle impact
  (document in the PR description)

Reviewers verify all applicable **Constitution Check Gates** on every PR: SOLID · UX · Quality ·
Testing · Domain Model · Security · API (if applicable). See the full checklist in
[`.specify/memory/constitution.md`](.specify/memory/constitution.md).

---

## Architecture Principles

This project is governed by the [Room Dimensions Constitution](.specify/memory/constitution.md).
The five core principles are:

1. **SOLID Design** — all code follows Single Responsibility, Open/Closed, Liskov Substitution,
   Interface Segregation, and Dependency Inversion
2. **User Experience First** — Tailwind CSS, WCAG 2.1 AA accessibility, responsive layouts,
   visual feedback on all async operations
3. **Code Quality & Readability** — strict TypeScript, ESLint zero errors, Prettier enforced,
   descriptive naming, 40-line function limit
4. **Testing Standards** — test-first for business logic, ≥ 80% unit coverage, integration tests
   against real DB, Playwright for user journeys
5. **Consistent Domain Model** — TypeORM entities as single source of truth, DTOs at API
   boundaries, migrations version-controlled
