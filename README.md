# room-dimensions

A web application for managing and visualising room dimensions through an interactive UI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18+ · TypeScript (strict) · Tailwind CSS |
| Backend | Node.js (LTS) · TypeScript (strict) · TypeORM |
| Database | MySQL 8+ |
| Containerisation | Docker + Docker Compose |
| Testing | Vitest · React Testing Library · Jest · Supertest · Playwright |
| Linting / Formatting | ESLint (`@typescript-eslint/recommended`) · Prettier · Husky |

## Getting Started

**Prerequisites**: Docker and Docker Compose.

```bash
# Copy environment config and fill in values
cp .env.example .env

# Start the full application stack
docker compose up
```

The application will be available at `http://localhost:3000`.
API documentation (Swagger) is available at `http://localhost:4000/api/docs`.

## Project Structure

```
├── frontend/          # React + TypeScript + Tailwind CSS
├── backend/           # Node.js + TypeScript + TypeORM
├── tests/
│   ├── integration/   # Jest + Supertest (API layer, real DB in Docker)
│   └── e2e/           # Playwright (user journeys, full stack)
├── docker-compose.yml
├── docker-compose.test.yml
└── .env.example
```

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
feature: add interactive room canvas
bug: fix dimension rounding on fractional inputs
chore: configure Husky pre-commit hooks
```

## Running Tests

The project follows the **Testing Pyramid** with three tiers:

```bash
# Tier 1 — Unit tests (all externals mocked, must complete < 60s)
npm run test:unit

# Tier 2 — Integration tests (requires Docker: real MySQL container)
docker compose -f docker-compose.test.yml up -d
npm run test:integration

# Tier 3 — UI end-to-end tests (requires full stack running)
docker compose up -d
npm run test:e2e          # Playwright
```

Coverage is measured at the unit tier only. Business logic must maintain ≥ 80% line/branch coverage.

## Contributing

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

## Architecture Principles

This project is governed by the [Room Dimensions Constitution](.specify/memory/constitution.md)
(v2.3.0). The five core principles are:

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

For full governance, amendment procedure, and detailed standards, refer to the
[constitution](.specify/memory/constitution.md).
