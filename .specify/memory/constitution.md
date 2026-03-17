<!--
SYNC IMPACT REPORT
==================
Version change: 2.2.0 → 2.3.0 (MINOR — Testing Methodology section added)
Bump rationale:
  - New section: Testing Methodology (testing pyramid, unit/E2E/UI tiers, Playwright)
  - Technology Stack updated: Playwright added for UI E2E testing
  - Principle IV (Testing Standards) cross-referenced to new methodology section
  - Testing Gate (gate 4) description in Development Workflow updated to reference pyramid tiers
  - No principles added, removed, or redefined.

Modified principles: None

Added sections:
  - ## Testing Methodology

Removed sections: None

Templates reviewed:
  - .specify/templates/plan-template.md      ✅ aligned (Constitution Check gates updated)
  - .specify/templates/spec-template.md      ✅ aligned (acceptance scenarios map to pyramid tiers)
  - .specify/templates/tasks-template.md     ✅ aligned (test task types extended with Playwright tasks)
  - .specify/templates/agent-file-template.md ✅ no references requiring update

Follow-up TODOs:
  - TODO(SWAGGER_TOOL): Specific Swagger library not pinned (e.g., swagger-jsdoc + swagger-ui-express,
    or tsoa). Confirm choice when API scaffold is created; amend Technology Stack (PATCH).
  - TODO(OBSERVABILITY_TOOL): Structured logging library not pinned (e.g., pino, winston).
    Confirm when API scaffold is created; amend Technology Stack (PATCH).
-->

# Room Dimensions Constitution

## Core Principles

### I. SOLID Design Principles

All code MUST adhere to the five SOLID design principles:

- **Single Responsibility**: Every class, module, and React component MUST have exactly one
  reason to change. Services, repositories, and UI components MUST NOT mix concerns.
- **Open/Closed**: Modules MUST be open for extension and closed for modification.
  New behaviour MUST be added via new classes or composition, not by editing existing ones.
- **Liskov Substitution**: Subtypes MUST be substitutable for their base types without
  altering correctness. TypeScript interfaces and abstract classes MUST be honoured fully
  by all implementations.
- **Interface Segregation**: Interfaces MUST be narrow and role-specific. No class or
  component MUST be forced to depend on methods it does not use.
- **Dependency Inversion**: High-level modules MUST depend on abstractions (TypeScript
  interfaces/types), not on concrete implementations. Dependency injection MUST be used
  for services, repositories, and external integrations.

**Rationale**: SOLID principles produce code that is maintainable, testable, and extensible.
In a TypeScript + TypeORM + React stack, strict adherence prevents tight coupling between
layers (UI ↔ service ↔ repository ↔ database) and reduces the cost of change.

### II. User Experience First

The frontend MUST prioritise clear, responsive, and accessible user interactions. All UI work
MUST use a modern CSS utility framework (Tailwind CSS is the project standard). The following
rules apply:

- Components MUST be responsive across common viewport sizes (mobile, tablet, desktop).
- Interactive elements MUST meet WCAG 2.1 AA accessibility standards (keyboard navigation,
  ARIA labels, sufficient colour contrast).
- Visual feedback (loading states, error states, success confirmations) MUST be present for
  all async operations.
- UI components MUST be decomposed following SRP: one component, one visual responsibility.
- Raw CSS or inline styles MUST NOT be used except where Tailwind utilities cannot express
  the required style.

**Rationale**: Room dimension management is an inherently visual and interactive domain.
A consistent, accessible, modern UI directly determines whether the application is usable.

### III. Code Quality & Readability

All TypeScript code (frontend and backend) MUST meet the following quality standards:

- **Strict TypeScript**: `strict: true` MUST be enabled in all `tsconfig.json` files.
  `any` types MUST NOT be used; use `unknown` with type guards where dynamic types are
  unavoidable.
- **Linting**: ESLint with `@typescript-eslint/recommended` rules MUST be configured and
  MUST pass with zero errors before any code is merged.
- **Formatting**: Prettier MUST be configured project-wide. All committed code MUST be
  Prettier-formatted (enforced via pre-commit hook with Husky + lint-staged).
- **Naming**: Variables, functions, and classes MUST use descriptive, intention-revealing
  names. Abbreviations MUST NOT be used except for widely-understood domain terms.
- **No magic values**: Numeric literals and string constants MUST be extracted into named
  constants or TypeScript enums.
- **Function length**: Functions and methods MUST NOT exceed 40 lines. Extract helpers if
  needed.

**Rationale**: Consistent, readable code reduces onboarding time and review friction.
Strict TypeScript catches entire classes of runtime errors at compile time, which is
especially important in a data-driven UI application.

### IV. Testing Standards

Automated tests MUST be written for all business logic, API endpoints, and critical UI
interactions. The following standards apply:

- **Unit tests**: All service-layer and utility functions MUST have unit tests using
  **Jest** (backend) or **Vitest** (frontend).
- **Component tests**: React components MUST be tested with **React Testing Library**;
  tests MUST assert on user-visible behaviour, not implementation details.
- **API integration tests**: All REST endpoints MUST have integration tests using
  **Supertest** executed against a test database (no mocking of the database layer).
- **Coverage**: Business logic MUST maintain ≥ 80% line/branch coverage. Coverage reports
  MUST be generated on CI.
- **Test-first for business logic**: Service and repository logic MUST follow
  Red–Green–Refactor. Tests MUST be written and confirmed failing before implementation.
- **Linting of tests**: Test files MUST also pass ESLint and Prettier checks.

**Rationale**: Integration tests against a real database (MySQL in Docker) prevent mock/prod
divergence. React Testing Library's user-centric approach ensures tests remain valid under
refactors.

### V. Consistent Domain Model

Room dimensions are the core domain. TypeORM entities (e.g., `Room`, `Wall`, `Dimension`)
MUST be the single source of truth for domain structure throughout the application:

- Entity definitions MUST reside in a dedicated `entities/` directory and MUST be shared
  (or mirrored via DTOs) between API and frontend type contracts.
- No ad-hoc or duplicate representations of the same domain concept are permitted without
  documented justification.
- Database migrations MUST be generated via TypeORM and version-controlled; schema changes
  MUST NOT be applied manually.
- DTOs MUST be used at API boundaries; entities MUST NOT be serialised directly to API
  responses.

**Rationale**: A single authoritative domain model prevents semantic drift between the
database schema, API contracts, and UI state — a common failure mode in full-stack
TypeScript applications.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend language | TypeScript (strict mode) |
| Frontend framework | React 18+ |
| CSS framework | Tailwind CSS |
| Backend language | TypeScript (strict mode) |
| Backend runtime | Node.js (LTS) |
| ORM | TypeORM |
| Database | MySQL 8+ |
| Containerisation | Docker + Docker Compose |
| Frontend unit/component testing | Vitest + React Testing Library |
| Backend unit/integration testing | Jest + Supertest |
| UI end-to-end testing | Playwright |
| Linting | ESLint + `@typescript-eslint/recommended` |
| Formatting | Prettier |
| Pre-commit hooks | Husky + lint-staged |
| API documentation | TODO(SWAGGER_TOOL): confirm library at scaffold time |
| Structured logging | TODO(OBSERVABILITY_TOOL): confirm library at scaffold time |

**Docker requirements**:
- All services (frontend dev server, API, MySQL) MUST be defined in `docker-compose.yml`.
- The production build MUST be containerised with a multi-stage `Dockerfile`.
- Environment variables MUST be managed via `.env` files (with `.env.example` committed);
  secrets MUST NOT be committed to the repository.
- The full application stack MUST start with a single `docker compose up` command.

## Testing Methodology

This project follows the **Testing Pyramid**: the majority of tests are fast, isolated unit
tests at the base; a smaller suite of E2E integration tests exercises full feature flows
against a real database; a focused set of Playwright UI tests validates user-facing journeys
in a real browser. Higher pyramid tiers are slower and more costly to maintain — they MUST
NOT be used as a substitute for the tier below.

```
        /‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
       /   UI (E2E)      \      ← Playwright: user journeys in browser
      /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
     / Integration (API)   \   ← Jest + Supertest: full API flows, real DB in Docker
    /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
   /    Unit (base layer)    \  ← Jest / Vitest: all logic, all externals mocked
  /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
```

### Tier 1 — Unit Tests (base layer)

- **Scope**: Every service, utility function, TypeORM repository method, React hook,
  and non-trivial component logic MUST have unit tests.
- **Isolation**: All external dependencies (database, HTTP clients, file system, timers)
  MUST be mocked. Unit tests MUST NOT make real network calls or open real database
  connections.
- **Tools**: Jest (backend), Vitest (frontend).
- **Coverage gate**: ≥ 80% line and branch coverage across all business logic. Coverage
  is measured at this tier only; E2E and UI tests do not count toward the coverage target.
- **Speed**: The full unit test suite MUST complete in under 60 seconds to keep the
  Red–Green–Refactor loop fast.

### Tier 2 — Integration / E2E Tests (API layer)

- **Scope**: Every REST endpoint MUST have at least one integration test covering its
  primary happy path and its principal error paths.
- **Database**: Tests run against a dedicated **MySQL container in Docker** — a real
  database engine populated with fixture data, not a mock or in-memory substitute.
  This ensures SQL queries, TypeORM migrations, and constraint behaviour are validated.
- **Isolation**: Each test suite MUST start with a clean, known database state (seed
  scripts or transaction rollback per test). Tests MUST be independent and runnable in
  any order.
- **Tools**: Jest + Supertest (backend). A `docker-compose.test.yml` (or override file)
  MUST define the test database service.
- **Trigger**: This suite MUST run on every PR in CI before merge is permitted.

### Tier 3 — UI End-to-End Tests (browser layer)

- **Scope**: Each user-facing feature described in `spec.md` MUST have at least one
  Playwright test that exercises the complete user journey in a real browser.
- **Focus**: Tests MUST be written from the user's perspective — assert on what the user
  sees and can do, not on internal implementation details (no asserting on class names or
  component tree structure).
- **Tools**: Playwright. Tests MUST run against the full application stack
  (`docker compose up`) using a seeded test database.
- **Stability**: Flaky Playwright tests MUST be fixed or quarantined immediately; flakiness
  MUST NOT be accepted as normal. Use Playwright's built-in auto-wait and avoid
  `waitForTimeout` calls.
- **Trigger**: This suite MUST run on every PR that modifies frontend code or API contracts.

### Test File Conventions

- Unit tests: co-located with the file under test as `*.test.ts` or in a `__tests__/`
  directory adjacent to the module.
- Integration tests: `tests/integration/` at the relevant project root.
- Playwright UI tests: `tests/e2e/` at the repository root, organised by feature.
- All test files MUST pass ESLint and Prettier checks (same standards as production code).

**Rationale**: The testing pyramid ensures the fastest possible feedback for the most
common types of defect (unit bugs), while integration and UI tiers catch contract and
interaction failures that unit tests cannot. Playwright's user-centric model aligns
directly with Principle II (User Experience First).

## API Design Standards

All API endpoints MUST follow a versioned RESTful structure and be fully documented.

### URL Structure & Versioning

- All endpoints MUST be prefixed with `/api/v{n}/` (e.g., `/api/v1/rooms`).
- Resource names MUST be plural nouns in kebab-case (e.g., `/api/v1/room-dimensions`).
- Nested resources MUST reflect ownership (e.g., `/api/v1/rooms/{id}/walls`).
- A new API version (`v2`, `v3`, …) MUST be created for any breaking change to an existing
  contract; old versions MUST remain functional until explicitly deprecated and communicated.

### HTTP Methods & Status Codes

Endpoints MUST use HTTP methods and status codes semantically:

| Operation | Method | Success code |
|-----------|--------|-------------|
| Retrieve collection | GET | 200 OK |
| Retrieve single resource | GET | 200 OK |
| Create resource | POST | 201 Created |
| Full replacement | PUT | 200 OK |
| Partial update | PATCH | 200 OK |
| Delete resource | DELETE | 204 No Content |

Error codes MUST be used as follows:

| Scenario | Code |
|----------|------|
| Malformed request / validation failure | 400 Bad Request |
| Missing or invalid authentication | 401 Unauthorized |
| Authenticated but insufficient permissions | 403 Forbidden |
| Resource not found | 404 Not Found |
| Business rule violation | 422 Unprocessable Entity |
| Unexpected server error | 500 Internal Server Error |

### Swagger / OpenAPI Documentation

- Every endpoint MUST be annotated such that the Swagger UI is fully generated and
  discoverable at `/api/docs` in all non-production environments.
- Request bodies, query parameters, path parameters, and all response shapes MUST be
  described in the OpenAPI spec.
- The OpenAPI spec MUST be kept in sync with the implementation; a CI check MUST fail
  if the spec diverges from the actual route definitions.
- The spec file MUST be committed to the repository alongside the source code.

**Rationale**: Versioned REST with Swagger documentation ensures the API is a stable,
discoverable contract for the frontend and any future integrations.

## Error Handling & Observability

Error information MUST be contained within the application and MUST NOT be surfaced to
API consumers in raw form.

### Error Response Contract

All error responses MUST use a consistent JSON shape:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource could not be found."
  }
}
```

- `code` MUST be a machine-readable, SCREAMING_SNAKE_CASE string defined in a central
  error catalogue.
- `message` MUST be a safe, user-facing string that contains NO internal detail, stack
  traces, database messages, or file paths.
- Stack traces, query errors, and internal context MUST be written to the structured log
  only — never to the API response.

### Structured Logging

- The API MUST emit structured (JSON) logs for every request, error, and significant
  business event.
- Every log entry MUST include: `timestamp`, `level`, `requestId`, `method`, `path`,
  `statusCode`, and `durationMs` at minimum.
- Errors MUST be logged at `ERROR` level with full stack trace and all available context.
- A unique `requestId` (e.g., UUID v4) MUST be generated per request and included in
  both the log output and the `X-Request-Id` response header, enabling engineers to
  correlate client-reported issues with server logs.
- Log levels MUST be configurable via environment variable (`LOG_LEVEL`) without code
  changes.

**Rationale**: Safe error responses protect the application from information disclosure.
Structured logs with request IDs allow engineers to investigate any incident by correlating
the ID the frontend surfaces with the full server-side context.

## Security & Dependency Management

### Secrets Management

- Secrets (API keys, database credentials, tokens) MUST NOT be committed to the repository
  under any circumstances — including in git history.
- All secrets MUST be injected via environment variables defined in `.env` files.
- `.env` MUST be listed in `.gitignore`; `.env.example` with placeholder values MUST be
  committed and kept current.
- A pre-commit hook MUST scan for common secret patterns (e.g., via `detect-secrets` or
  equivalent) and block commits containing them.

### Security Review

- Every PR MUST include a security review checkpoint that verifies:
  - No secrets or credentials have been introduced.
  - User-supplied input is validated at the API boundary (via DTO validation).
  - No new SQL injection, XSS, or path traversal vectors have been introduced.
  - Authentication and authorisation are enforced on all new endpoints.
- The reviewer MUST explicitly confirm the security checkpoint is passed before approving.

### Dependency Currency

- All direct dependencies MUST be reviewed for known vulnerabilities before each PR is
  merged (`npm audit` or equivalent MUST pass with zero high/critical findings).
- Dependencies MUST be kept current: outdated packages MUST be updated as part of the
  feature or fix branch that touches the relevant code, not deferred to a separate ticket
  unless the update constitutes a breaking change.
- Automated dependency scanning (e.g., Dependabot or Renovate) MUST be enabled on the
  repository.

### New Package Evaluation

Before adding any new dependency, the author MUST document in the PR description:

1. **Maintenance status**: Is the package actively maintained? When was the last release?
   Are issues/PRs being responded to?
2. **Licence**: Is the licence compatible with this project (MIT, Apache-2.0, ISC
   preferred; GPL and proprietary require explicit approval)?
3. **Performance impact**: What is the package's bundle size contribution? Does it
   introduce significant runtime overhead?
4. **Alternatives considered**: Why was this package chosen over built-in language
   features or existing dependencies?

Packages failing these criteria MUST NOT be merged without explicit documented justification.

**Rationale**: Supply chain attacks and licence violations are real risks. Evaluating
packages at the point of introduction is cheaper than remediating them after adoption.

## Code Review Standards

All code changes MUST go through Pull Request review before merging to `main`.

### PR Size

- A single PR MUST NOT change more than **500 lines within any single file** (generated
  files, lock files, and migration files are exempt).
- A PR SHOULD NOT change more than **20 files** in total. Exceeding this is a soft limit;
  the author MUST add a comment explaining why the scope could not be reduced.
- PRs that exceed these limits without justification MUST be split before review.

### Review Requirements

- Every PR MUST receive at least one approving review before merge.
- The reviewer MUST verify all applicable Constitution Check Gates (see Development Workflow).
- Reviewers MUST NOT approve a PR that fails linting, has failing tests, or has
  unresolved security review checkpoints.
- The author MUST respond to all review comments before requesting re-review.

### Review Checklist

Reviewers MUST check the following on every PR:

- [ ] SOLID Gate: no mixed concerns, dependencies via interfaces
- [ ] UX Gate: visual feedback present, Tailwind used, accessibility considered
- [ ] Quality Gate: strict TS, ESLint clean, Prettier formatted, no magic values
- [ ] Testing Gate: unit tests for new logic, integration tests for new endpoints, ≥ 80% coverage
- [ ] Domain Model Gate: TypeORM entities/DTOs used correctly, migrations committed
- [ ] Security Gate: no secrets, input validated, no new attack vectors, `npm audit` clean
- [ ] API Gate (if applicable): versioned URL, correct HTTP codes, Swagger annotations present
- [ ] Dependency Gate (if new packages added): maintenance, licence, performance documented

**Rationale**: Small, focused PRs are easier to review correctly. An explicit checklist
ensures constitution compliance is verified on every change, not just recalled from memory.

## Branching Strategy

This project uses **GitHub Flow**: `main` is always deployable; all work is done on
short-lived branches that merge back to `main` via Pull Request.

### Branch Naming

All branches MUST be prefixed with one of the following type tokens, followed by a
slash and a concise kebab-case description:

| Prefix | When to use |
|--------|-------------|
| `feature/` | New user-facing functionality |
| `bug/` | Bug fixes |
| `refactor/` | Code restructuring with no behaviour change |
| `chore/` | Tooling, dependencies, CI, configuration |
| `docs/` | Documentation-only changes |
| `test/` | Adding or fixing tests with no production code change |

**Examples**: `feature/room-canvas`, `bug/dimension-overflow`, `chore/docker-compose-setup`

Rules:
- Branch names MUST be lowercase and use hyphens, not underscores or spaces.
- Branches MUST be short-lived (merged within the sprint / feature cycle).
- Stale branches (unmerged and inactive for > 2 weeks) MUST be deleted or rebased.
- Direct commits to `main` are PROHIBITED; all changes MUST arrive via Pull Request.

### Commit Message Convention

Commit messages MUST follow this format:

```
<type>: <imperative short description>
```

Where `<type>` matches the branch prefix in use:

| Type | Example commit message |
|------|----------------------|
| `feature` | `feature: add room canvas rendering` |
| `bug` | `bug: fix wall dimension rounding error` |
| `refactor` | `refactor: extract RoomService from controller` |
| `chore` | `chore: add Husky pre-commit hooks` |
| `docs` | `docs: document TypeORM migration workflow` |
| `test` | `test: add integration tests for Room API` |

Rules:
- The description MUST be in the imperative mood ("add", "fix", "extract" — not "added" or
  "fixes").
- The description MUST NOT exceed 72 characters.
- A commit MUST represent one logical change. Avoid "and" in commit messages; split instead.
- Multi-line commit bodies are permitted and encouraged for non-trivial changes.

**Rationale**: Consistent branch and commit naming makes the git history scannable, simplifies
changelog generation, and clarifies intent at code review time.

## Development Workflow

- All work MUST be done on typed prefix branches (e.g., `feature/room-canvas`,
  `bug/wall-overlap`). See Branching Strategy above for the full prefix list.
- Every feature branch MUST have a spec (`spec.md`) before implementation begins.
- The Constitution Check in `plan.md` MUST be completed before Phase 0 research proceeds.
- All linting and formatting checks MUST pass before a PR is opened.
- All tests MUST pass (including integration tests against the Docker test database)
  before a PR can be merged.
- `npm audit` MUST pass with zero high/critical findings before a PR can be merged.
- The `main` branch MUST remain in a runnable state (`docker compose up` succeeds) at all times.
- Commits MUST be atomic and scoped to a single task or logical unit, following the commit
  message convention defined in Branching Strategy.

**Constitution Check Gates** (referenced in `plan-template.md`):

1. **SOLID Gate**: Does this feature's design respect Single Responsibility and Dependency
   Inversion? Are all dependencies injected via interfaces? Flag violations in the
   Complexity Tracking table.
2. **UX Gate**: Does this feature deliver clear visual feedback and meet accessibility
   requirements? Is Tailwind CSS used consistently?
3. **Quality Gate**: Is TypeScript strict mode satisfied? Are ESLint and Prettier configured
   to cover new files? Are naming and function-length rules followed?
4. **Testing Gate**: Are Tier 1 unit tests written for all new service logic with externals
   mocked? Are Tier 2 integration tests present for all new endpoints against the Docker
   test database? For UI features, is there a Tier 3 Playwright test covering the user
   journey? Is ≥ 80% coverage maintained at the unit tier?
5. **Domain Model Gate**: Do new entities conform to the TypeORM entity structure? Are DTOs
   used at API boundaries? Are migrations generated and committed?
6. **Security Gate**: Are secrets absent from all committed files? Is input validated at
   API boundaries? Does `npm audit` pass? If new packages were added, is the evaluation
   documented? Has the security review checklist been completed?
7. **API Gate** *(API changes only)*: Does the endpoint follow `/api/v{n}/` versioning?
   Are HTTP status codes used correctly? Are Swagger annotations present and complete?
   Is the error response shape consistent with the error catalogue?

## Governance

This constitution supersedes all other development practices and guidelines for this project.
Any decision that conflicts with a principle in this document MUST be resolved by amending
the constitution first.

**Amendment procedure**:
1. Identify the principle or section to change and document the motivation.
2. Propose the amendment (PR or written proposal) with a rationale.
3. Update the constitution file, bump the version per the versioning policy below, and
   update `LAST_AMENDED_DATE`.
4. Propagate changes to affected templates by running `/speckit.constitution` after any
   amendment.

**Versioning policy**:
- **MAJOR**: Backward-incompatible changes; principle removal or fundamental redefinition.
- **MINOR**: New principle or section added; materially expanded guidance.
- **PATCH**: Clarifications, wording fixes, non-semantic refinements, tech version bumps.

**Compliance**: All PRs MUST pass all applicable Constitution Check Gates listed in the
Development Workflow section. Violations require a documented justification entry in the
plan's Complexity Tracking table before the PR can be merged.

**Version**: 2.3.0 | **Ratified**: 2026-03-17 | **Last Amended**: 2026-03-17
