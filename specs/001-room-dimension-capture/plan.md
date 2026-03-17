# Implementation Plan: Room Dimension Capture

**Branch**: `001-room-dimension-capture` | **Date**: 2026-03-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-room-dimension-capture/spec.md`

## Summary

A full-stack web application enabling a homeowner to capture, manage, and print room
dimension data for an entire house. Core data: rooms (labelled, floor-assigned), floor/ceiling
dimension segments (unlimited, supporting non-rectangular shapes), walls (labelled, width ×
height), and windows (optional per wall, labelled, width × height). A single app-level unit
of measurement is configurable. A print-optimised summary view is required.

Technical approach: React 18 + TypeScript frontend (Tailwind CSS), Node.js + TypeScript REST
API (Express, TypeORM), MySQL 8 persistence, all services containerised with Docker Compose.
Swagger UI at `/api/docs`. Structured JSON logging via pino. DTO validation via
class-validator.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) — frontend and backend
**Primary Dependencies**: React 18, Tailwind CSS, Express 4, TypeORM 0.3, class-validator,
  pino, swagger-jsdoc + swagger-ui-express
**Storage**: MySQL 8+ via TypeORM (migrations version-controlled)
**Testing**: Vitest + React Testing Library (frontend unit/component), Jest + Supertest
  (backend unit/integration), Playwright (UI E2E)
**Target Platform**: Web browser (desktop-first), Docker + Docker Compose
**Project Type**: Web application (React SPA + REST API)
**Performance Goals**: All CRUD operations persist within 2 seconds (SC-002); full room list
  renders within 1 second
**Constraints**: Single user (no auth), Docker-containerised, offline not required
**Scale/Scope**: Single household (~10–50 rooms), single concurrent user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Check

1. **SOLID Gate** ✅
   - Each Express controller handles one resource (SRP).
   - Services depend on repository interfaces, not concrete TypeORM repositories (DIP).
   - React components decomposed to single visual responsibility.

2. **UX Gate** ✅
   - Save/discard prompt on unsaved-changes navigation (FR-021).
   - Loading and error states required for all async operations.
   - Tailwind CSS throughout; WCAG 2.1 AA for interactive elements.
   - Print summary uses `@media print` CSS — no nav/edit chrome in print output.

3. **Quality Gate** ✅
   - `strict: true` in all `tsconfig.json` files.
   - ESLint `@typescript-eslint/recommended` + Prettier enforced via Husky.
   - No magic values — measurement unit options, API paths, error codes in constants.

4. **Testing Gate** ✅
   - Tier 1: unit tests for all service logic (Jest backend, Vitest frontend), externals mocked.
   - Tier 2: integration tests for every REST endpoint via Supertest against MySQL Docker container.
   - Tier 3: Playwright tests for all 5 user stories.

5. **Domain Model Gate** ✅
   - TypeORM entities: `Room`, `DimensionSegment`, `Wall`, `Window`, `AppSettings`.
   - DTOs used at all API boundaries; entities never serialised directly.
   - Cascade deletes defined at entity level (room→segments/walls→windows).
   - Migrations generated via TypeORM CLI and committed.

6. **Security Gate** ✅
   - No auth required (single user, local deployment).
   - All request bodies validated via class-validator DTOs before reaching service layer.
   - Error responses expose only safe `{ error: { code, message } }` shape.
   - Secrets (DB credentials) via `.env`; `.env.example` committed.
   - `npm audit` must pass before merge.

7. **API Gate** ✅
   - All endpoints prefixed `/api/v1/`.
   - Semantic HTTP methods and status codes (see contracts/).
   - Swagger UI at `/api/docs`; OpenAPI spec committed.

**No violations. No Complexity Tracking entries required.**

## Project Structure

### Documentation (this feature)

```text
specs/001-room-dimension-capture/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output — REST API contract
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── entities/            # TypeORM entity classes
│   │   ├── Room.ts
│   │   ├── DimensionSegment.ts
│   │   ├── Wall.ts
│   │   ├── Window.ts
│   │   └── AppSettings.ts
│   ├── dto/                 # class-validator request/response DTOs
│   │   ├── room/
│   │   ├── segment/
│   │   ├── wall/
│   │   ├── window/
│   │   └── settings/
│   ├── services/            # Business logic (depend on repository interfaces)
│   │   ├── RoomService.ts
│   │   ├── DimensionSegmentService.ts
│   │   ├── WallService.ts
│   │   ├── WindowService.ts
│   │   └── SettingsService.ts
│   ├── repositories/        # TypeORM repository wrappers + interfaces
│   ├── controllers/         # Express route handlers (thin — delegate to services)
│   ├── routes/              # Express Router definitions
│   ├── middleware/          # Error handler, request logger, DTO validation
│   ├── errors/              # Error catalogue (SCREAMING_SNAKE_CASE codes)
│   ├── config/              # Environment config, data source setup
│   ├── migrations/          # TypeORM migration files (committed)
│   └── app.ts               # Express app factory
├── tests/
│   ├── unit/                # Jest — services with mocked repositories
│   └── integration/         # Jest + Supertest — full HTTP stack, real DB
├── Dockerfile
├── tsconfig.json
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── rooms/           # RoomList, RoomForm, RoomCard
│   │   ├── dimensions/      # SegmentList, SegmentForm (floor & ceiling)
│   │   ├── walls/           # WallList, WallForm, WallDetail
│   │   ├── windows/         # WindowList, WindowForm
│   │   ├── settings/        # UnitSelector
│   │   ├── print/           # PrintSummary
│   │   └── shared/          # UnsavedChangesPrompt, EmptyState, LoadingSpinner, ErrorMessage
│   ├── pages/               # Top-level route pages
│   ├── services/            # API client (typed fetch wrappers)
│   ├── hooks/               # useUnsavedChanges, useSettings, etc.
│   └── types/               # Shared TypeScript types (mirrored from API DTOs)
├── tests/                   # Vitest + React Testing Library
├── Dockerfile
├── tsconfig.json
└── package.json

tests/
└── e2e/                     # Playwright — organised by user story
    ├── us1-manage-rooms.spec.ts
    ├── us2-floor-ceiling-dimensions.spec.ts
    ├── us3-manage-walls.spec.ts
    ├── us4-windows.spec.ts
    └── us5-print-summary.spec.ts

docker-compose.yml           # All services: frontend, backend, mysql
docker-compose.test.yml      # Test database service
.env.example
```

**Structure Decision**: Web application (frontend + backend). React SPA served separately
from the Node.js API. MySQL managed by Docker Compose. The frontend communicates with the
backend exclusively via the versioned REST API.

## Complexity Tracking

> No constitution violations — table not required.
