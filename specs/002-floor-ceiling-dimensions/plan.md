# Implementation Plan: Floor and Ceiling Dimensions

**Branch**: `002-floor-ceiling-dimensions` | **Date**: 2026-03-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-floor-ceiling-dimensions/spec.md`

## Summary

Add a simple rectangular (width × length) dimension to the floor and ceiling of each room,
supplementing the existing segment-based outline model. A new `SurfaceDimension` TypeORM
entity (at most one per surface per room) backs six new REST endpoints (GET, PUT, DELETE for
each surface). The room detail and print summary responses are extended to include the new
dimensions. A reusable `SurfaceDimensionPanel` React component handles the CTA → form →
display → edit → remove lifecycle for both surfaces.

## Technical Context

**Language/Version**: TypeScript 5.3.3 (strict mode) — frontend and backend
**Primary Dependencies**: Express 4.18, TypeORM 0.3, React 18, Tailwind CSS 3, class-validator 0.14, Vitest 1, Jest 29, Playwright
**Storage**: MySQL 8+ in Docker; schema managed via TypeORM migrations
**Testing**: Jest + Supertest (backend unit + integration against Docker DB), Vitest + React Testing Library (frontend), Playwright (E2E browser tests)
**Target Platform**: Web — Node.js LTS server + browser (desktop-primary, responsive)
**Project Type**: Full-stack web application (npm monorepo: `backend/`, `frontend/`, `tests/e2e/`)
**Performance Goals**: All save/update operations persist within 2 seconds of user confirmation (SC-002)
**Constraints**: Single-user, no authentication; width and length must both be positive decimals; both fields required together; one record per surface per room
**Scale/Scope**: At most 2 SurfaceDimension records per room (one floor, one ceiling); total volume proportional to room count

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| 1. SOLID Gate | ✅ Pass | New `SurfaceDimension` entity, `ISurfaceDimensionRepository` interface, `SurfaceDimensionService`, and `SurfaceDimensionController` follow established layered pattern. All dependencies injected via interface. `SurfaceDimensionPanel` has one visual responsibility. |
| 2. UX Gate | ✅ Pass | CTA → form → display → edit → remove flow provides clear affordances. Tailwind CSS used throughout. Loading and error states required on async operations. ARIA labels required on form inputs. |
| 3. Quality Gate | ✅ Pass | TypeScript strict mode; ESLint + Prettier cover all new files; surface type values extracted to a shared constant/enum; no magic values; all functions ≤ 40 lines. |
| 4. Testing Gate | ✅ Pass | Unit tests for `SurfaceDimensionService` (Jest, mocked repo); integration tests for all 6 endpoints (Supertest + Docker MySQL); RTL component tests for `SurfaceDimensionPanel`; one Playwright E2E test covering add/edit/remove for both surfaces. |
| 5. Domain Model Gate | ✅ Pass | New TypeORM entity in `entities/`; DTOs at API boundaries; entities not serialised directly; new migration generated and committed. |
| 6. Security Gate | ✅ Pass | Input validated via class-validator DTOs (width, length: positive numbers); no secrets; `npm audit` expected clean; no new attack vectors (no file paths, no user-controlled SQL). |
| 7. API Gate | ✅ Pass | Endpoints at `/api/v1/rooms/:roomId/floor-dimensions` and `/ceiling-dimensions` (plural nouns per constitution); PUT → 200, DELETE → 204, GET → 200/404; Swagger annotations required; error responses use standard error catalogue shape. |

No violations — Complexity Tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/002-floor-ceiling-dimensions/
├── plan.md              # This file
├── research.md          # Phase 0 — entity design, HTTP semantics, route structure
├── data-model.md        # Phase 1 — entity, DTOs, type updates, state transitions
├── quickstart.md        # Phase 1 — setup, run, test instructions
├── contracts/
│   └── api.md           # Phase 1 — full REST contract for all 6 endpoints + modifications
├── checklists/
│   └── requirements.md  # Spec quality checklist (all items pass)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/src/
├── entities/
│   └── SurfaceDimension.ts          # New TypeORM entity (surfaceType, width, length)
├── dto/
│   └── surface-dimension/
│       ├── UpsertSurfaceDimensionDto.ts     # width + length (both required, positive)
│       └── SurfaceDimensionResponseDto.ts   # Full response shape
├── repositories/
│   ├── ISurfaceDimensionRepository.ts       # Interface (DI boundary)
│   └── SurfaceDimensionRepository.ts        # TypeORM implementation
├── services/
│   └── SurfaceDimensionService.ts           # Business logic (upsert, delete, get)
├── controllers/
│   └── SurfaceDimensionController.ts        # Express controller (6 handlers)
├── routes/
│   └── surfaceDimensions.ts                 # Route registration (mounted on rooms router)
└── migrations/
    └── [timestamp]-AddSurfaceDimension.ts   # Creates surface_dimension table

# Modified files:
backend/src/
├── entities/Room.ts                         # Add OneToMany → SurfaceDimension relation
├── dto/room/RoomDetailResponseDto.ts        # Add floorDimension, ceilingDimension fields
├── dto/print/PrintSummaryResponseDto.ts     # Add floorDimension, ceilingDimension per room
├── services/RoomService.ts                  # Eager-load SurfaceDimensions in detail query
└── routes/rooms.ts                          # Mount surfaceDimensions router

frontend/src/
├── components/dimensions/
│   └── SurfaceDimensionPanel.tsx            # CTA + form + display; accepts surfaceType prop
├── services/
│   └── surfaceDimensionApi.ts               # getFloor/Ceiling, upsert, delete API calls
└── types/index.ts                           # Add SurfaceDimensionResponse, request type;
                                             # extend RoomDetailResponse + PrintFloorRoom

# Modified frontend files:
frontend/src/
├── pages/RoomDetailPage.tsx                 # Add two <SurfaceDimensionPanel> instances
└── components/print/PrintSummary.tsx        # Render floorDimension/ceilingDimension per room

tests/e2e/
└── surface-dimensions.spec.ts              # Playwright: add, edit, remove for both surfaces

# Test files:
backend/src/services/__tests__/
└── SurfaceDimensionService.test.ts          # Unit tests (Jest, mocked repository)
backend/tests/integration/
└── surfaceDimension.test.ts                 # Integration tests (Supertest, Docker MySQL)
frontend/src/components/dimensions/__tests__/
└── SurfaceDimensionPanel.test.tsx           # RTL component tests
```

**Structure Decision**: Web application option (backend + frontend monorepo). All new files
follow the established directory conventions already present in the codebase. No new
top-level directories are required.
