# Tasks: Room Dimension Capture

**Input**: Design documents from `/specs/001-room-dimension-capture/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api.md ✓, quickstart.md ✓

**Tests**: Included — Testing Gate in plan.md mandates all three tiers (unit, integration, Playwright E2E).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Exact file paths are included in all descriptions

## Path Conventions

- `backend/` — Express + TypeScript API (TypeORM, class-validator, pino)
- `frontend/` — React 18 SPA (Vite, Tailwind CSS)
- `tests/e2e/` — Playwright end-to-end tests
- Root — Docker Compose, env config, Husky

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialise all project directories, tooling, and Docker orchestration before any feature work begins.

- [ ] T001 Create root project structure: `backend/`, `frontend/`, `tests/e2e/` directories; root `package.json` with workspace scripts (`test`, `lint`, `format`, `format:check`)
- [ ] T002 Create `docker-compose.yml` with services: `frontend` (port 3000), `backend` (port 4000), `mysql` (port 3306); create `docker-compose.test.yml` with `mysql-test` service
- [ ] T003 Create `.env.example` with variables: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `API_PORT`, `LOG_LEVEL`, `NODE_ENV`, `VITE_API_URL`
- [ ] T004 [P] Initialise backend Node.js project: `backend/package.json` with dependencies (express, typeorm, mysql2, class-validator, class-transformer, pino, pino-http, swagger-jsdoc, swagger-ui-express, reflect-metadata); devDependencies (typescript, @types/*, jest, ts-jest, supertest, eslint, @typescript-eslint/recommended, prettier); create `backend/tsconfig.json` (strict mode, decorators enabled); create `backend/Dockerfile` as a **multi-stage build** (stage 1: `builder` — install deps + compile TS; stage 2: `production` — copy compiled output + production deps only)
- [ ] T005 [P] Initialise frontend React project with Vite: `frontend/package.json` with dependencies (react, react-dom, react-router-dom v6, tailwindcss); devDependencies (vite, vitest, @testing-library/react, @testing-library/user-event, eslint, prettier, typescript); create `frontend/tsconfig.json` (strict mode); create `frontend/vite.config.ts`; create `frontend/tailwind.config.js`; create `frontend/Dockerfile` as a **multi-stage build** (stage 1: `builder` — install deps + run `vite build`; stage 2: `production` — serve `dist/` via nginx)
- [ ] T006 [P] Initialise Playwright E2E project: `tests/e2e/package.json` with `@playwright/test`; create `tests/e2e/playwright.config.ts` pointing to `http://localhost:3000`
- [ ] T007 Configure Husky + lint-staged at repo root: pre-commit hook runs (1) `npm run lint`, (2) `npm run format:check` across both `backend/` and `frontend/`, and (3) `detect-secrets scan` (or `gitleaks detect`) to block commits containing secret patterns — install `detect-secrets` as a dev dependency and commit a `.secrets.baseline` file
- [ ] T008 Create GitHub Actions CI workflow in `.github/workflows/ci.yml`: (1) run `npm run lint` + `npm run format:check`; (2) spin up MySQL via `services:` and run backend unit + integration tests with coverage report (`jest --coverage`); (3) run frontend unit tests with coverage (`vitest run --coverage`); (4) on any frontend or contracts change, run Playwright tests against `docker compose up`; enforce ≥ 80% line/branch coverage gate; fail PR if any check fails
- [ ] T009 Create `.github/dependabot.yml` enabling Dependabot for `backend/` (npm ecosystem), `frontend/` (npm ecosystem), and `.github/workflows/` (GitHub Actions); set weekly schedule and auto-assign to maintainer

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure, shared frontend scaffolding, and AppSettings (unit of measurement) that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Backend Core Infrastructure

- [ ] T008 Create environment config module in `backend/src/config/env.ts` that reads and validates all `.env` variables, exporting typed constants (no `process.env` usage outside this file)
- [ ] T009 Create TypeORM DataSource config in `backend/src/config/dataSource.ts` using env constants; configure entity auto-discovery, migration path `src/migrations/**`, synchronize: false
- [ ] T010 Create error catalogue in `backend/src/errors/ErrorCodes.ts` with `SCREAMING_SNAKE_CASE` constants: `VALIDATION_ERROR`, `NOT_FOUND`, `INTERNAL_ERROR`; create `AppError` class in `backend/src/errors/AppError.ts` wrapping code + message + HTTP status
- [ ] T011 Implement global error-handling middleware in `backend/src/middleware/errorHandler.ts` that maps `AppError` to `{ error: { code, message } }` shape; unknown errors map to `INTERNAL_ERROR` 500; never leaks stack traces
- [ ] T012 [P] Implement DTO validation middleware in `backend/src/middleware/validateDto.ts` using `class-transformer` `plainToInstance` + `class-validator` `validate`; rejects invalid bodies with 400 `VALIDATION_ERROR` before reaching controller
- [ ] T013 [P] Configure `pino` + `pino-http` request logger middleware in `backend/src/middleware/requestLogger.ts`; set `X-Request-Id` response header from `req.id`; log level from `env.LOG_LEVEL`
- [ ] T014 Create API path constants in `backend/src/constants/routes.ts` (all `/api/v1/` paths); create measurement unit constants in `backend/src/constants/units.ts` (`'m' | 'cm' | 'ft' | 'in'`)
- [ ] T015 Create Express app factory in `backend/src/app.ts`: register `requestLogger`, `express.json()`, `validateDto` middleware; mount all routers under `/api/v1`; mount Swagger UI at `/api/docs` (non-production); register `errorHandler` last; export factory function (not singleton)
- [ ] T016 Create backend entry point `backend/src/index.ts` that calls app factory, initialises TypeORM DataSource, starts server on `env.API_PORT`

### Backend Entities & Migrations

- [ ] T017 Create `Room` TypeORM entity in `backend/src/entities/Room.ts`: columns `id`, `label` (VARCHAR 255 NOT NULL), `floor` (VARCHAR 100 NOT NULL), `createdAt`, `updatedAt`; OneToMany `walls` (cascade insert/update/remove, onDelete CASCADE); OneToMany `dimensionSegments` (same cascades)
- [ ] T018 [P] Create `DimensionSegment` TypeORM entity in `backend/src/entities/DimensionSegment.ts`: columns `id`, `label` (VARCHAR 255 NOT NULL), `measurement` (DECIMAL 10,4 NOT NULL positive), `surfaceType` (ENUM 'floor'|'ceiling' NOT NULL), `roomId` FK, `createdAt`; ManyToOne `room`
- [ ] T019 [P] Create `Wall` TypeORM entity in `backend/src/entities/Wall.ts`: columns `id`, `label`, `width` (DECIMAL 10,4), `height` (DECIMAL 10,4), `roomId` FK, `createdAt`, `updatedAt`; ManyToOne `room`; OneToMany `windows` (cascade insert/update/remove, onDelete CASCADE)
- [ ] T020 [P] Create `Window` TypeORM entity in `backend/src/entities/Window.ts`: columns `id`, `label`, `width` (DECIMAL 10,4), `height` (DECIMAL 10,4), `wallId` FK, `createdAt`, `updatedAt`; ManyToOne `wall`
- [ ] T021 Create `AppSettings` TypeORM entity in `backend/src/entities/AppSettings.ts`: singleton row (id always = 1), column `measurementUnit` (ENUM 'm'|'cm'|'ft'|'in' NOT NULL DEFAULT 'm'), `updatedAt`
- [ ] T022 Generate initial TypeORM migration creating all five tables with FK constraints and cascade rules in `backend/src/migrations/`; seed `AppSettings` row (id=1, unit='m') in same migration

### Backend Repository Interfaces & Implementations

- [ ] T023 Create repository interfaces in `backend/src/repositories/`: `IRoomRepository`, `IDimensionSegmentRepository`, `IWallRepository`, `IWindowRepository`, `IAppSettingsRepository` — each defines the async methods services will call (find, findOne, save, delete); create concrete TypeORM implementations alongside each interface

### Backend Repository Unit Tests *(constitution Tier 1 — repositories MUST have unit tests)*

- [ ] T106 [P] Write Jest unit tests for `RoomRepository` in `backend/src/repositories/__tests__/RoomRepository.test.ts`: mock TypeORM `DataSource`; cover `findAll`, `findById` (found + not-found), `save`, `delete`
- [ ] T107 [P] Write Jest unit tests for `DimensionSegmentRepository` in `backend/src/repositories/__tests__/DimensionSegmentRepository.test.ts`: cover `findByRoomAndSurface` ordering, `findById`, `save`, `delete`
- [ ] T108 [P] Write Jest unit tests for `WallRepository` in `backend/src/repositories/__tests__/WallRepository.test.ts`: cover `findByRoom` ordering, `findById` with windows, `save`, `delete`
- [ ] T109 [P] Write Jest unit tests for `WindowRepository` in `backend/src/repositories/__tests__/WindowRepository.test.ts`: cover `findByWall` ordering, `findById`, `save`, `delete`
- [ ] T110 [P] Write Jest unit tests for `AppSettingsRepository` in `backend/src/repositories/__tests__/AppSettingsRepository.test.ts`: cover `findSingleton` (returns default when absent), `upsert`

### Test Database Isolation Helper *(constitution Tier 2 — clean state per test suite)*

- [ ] T111 Create test database helper in `backend/tests/helpers/dbSetup.ts`: exports `setupTestDb()` (initialise DataSource against `docker-compose.test.yml` MySQL, run migrations) and `teardownTestDb()` (drop all data via `TRUNCATE` in FK-safe order, then close connection); all integration test suites MUST call these in `beforeAll`/`afterAll`

### Backend AppSettings (unit display — needed by all stories)

- [ ] T024 Create Settings DTOs in `backend/src/dto/settings/UpdateSettingsDto.ts` (`@IsIn(['m','cm','ft','in'])`) and `backend/src/dto/settings/SettingsResponseDto.ts`
- [ ] T025 Implement `SettingsService` in `backend/src/services/SettingsService.ts`: `getSettings()` fetches singleton (upsert on first call); `updateSettings(dto)` updates unit; depends on `IAppSettingsRepository`
- [ ] T026 Implement `SettingsController` in `backend/src/controllers/SettingsController.ts` (GET and PATCH handlers, delegates to `SettingsService`); create `backend/src/routes/settings.ts` mounting at `/settings`

### Frontend Shared Scaffolding

- [ ] T027 Create shared TypeScript types in `frontend/src/types/index.ts` mirroring all API DTOs: `RoomResponse`, `RoomDetailResponse`, `SegmentResponse`, `WallSummaryResponse`, `WallDetailResponse`, `WindowResponse`, `SettingsResponse`, `PrintSummaryResponse`; export measurement unit type `Unit = 'm' | 'cm' | 'ft' | 'in'` — **IMPORTANT: never export a type named `Window` (shadows DOM global); always use `WindowResponse`**
- [ ] T028 Create typed API client base in `frontend/src/services/apiClient.ts`: wraps `fetch` with base URL from `import.meta.env.VITE_API_URL`; handles JSON parsing; throws typed error objects mapping API error shape to `{ code, message }`; no axios dependency
- [ ] T029 Create API path constants in `frontend/src/constants/api.ts` mirroring all `/api/v1/` routes (no magic strings in service files)
- [ ] T030 [P] Create `LoadingSpinner` component in `frontend/src/components/shared/LoadingSpinner.tsx` (Tailwind spinner, aria-label)
- [ ] T031 [P] Create `ErrorMessage` component in `frontend/src/components/shared/ErrorMessage.tsx` (displays API error message, accessible role="alert")
- [ ] T032 [P] Create `EmptyState` component in `frontend/src/components/shared/EmptyState.tsx` (message + optional action button, for empty lists and print-no-data)
- [ ] T033 [P] Create `UnsavedChangesPrompt` modal component in `frontend/src/components/shared/UnsavedChangesPrompt.tsx` (Save / Discard buttons, blocks navigation)
- [ ] T034 [P] Implement `useUnsavedChanges` hook in `frontend/src/hooks/useUnsavedChanges.ts`: tracks `isDirty` boolean; registers `window.beforeunload` handler; exposes `markDirty`, `markClean`, `promptIfDirty` for in-app nav
- [ ] T035 Implement `SettingsContext` + `useSettings` hook in `frontend/src/hooks/useSettings.ts` + `frontend/src/context/SettingsContext.tsx`: fetches `/api/v1/settings` on mount; exposes `unit` and `updateUnit(newUnit)`; wrap app in provider

### Frontend Hook Unit Tests *(constitution Tier 1 — React hooks MUST have unit tests)*

- [ ] T112 [P] Write Vitest unit tests for `useUnsavedChanges` in `frontend/src/hooks/__tests__/useUnsavedChanges.test.ts`: cover initial clean state, `markDirty` sets isDirty, `markClean` clears it, `beforeunload` listener registered/unregistered, `promptIfDirty` triggers prompt modal
- [ ] T113 [P] Write Vitest unit tests for `useSettings` in `frontend/src/hooks/__tests__/useSettings.test.ts`: mock `apiClient`; cover initial fetch, returned unit value, `updateUnit` calls PATCH and updates context, error state when fetch fails

### Frontend Routing & Navigation

- [ ] T036 Configure React Router v6 in `frontend/src/App.tsx` with all routes: `/`, `/rooms/new`, `/rooms/:roomId`, `/rooms/:roomId/edit`, `/rooms/:roomId/walls/new`, `/rooms/:roomId/walls/:wallId`, `/rooms/:roomId/walls/:wallId/edit`, `/settings`, `/print`; add `<Outlet/>` layout with Navigation
- [ ] T037 Create `Navigation` component in `frontend/src/components/shared/Navigation.tsx`: links to `/` (Rooms), `/settings` (Settings), `/print` (Print Summary); hidden in print media via `print:hidden` Tailwind class
- [ ] T038 Implement `UnitSelector` component in `frontend/src/components/settings/UnitSelector.tsx` (radio/select for m/cm/ft/in, WCAG 2.1 AA)
- [ ] T039 Implement `SettingsPage` in `frontend/src/pages/SettingsPage.tsx` (route: `/settings`): renders `UnitSelector`, calls `updateUnit`, shows `LoadingSpinner`/`ErrorMessage` states

**Checkpoint**: Foundation complete — all user stories can now begin. AppSettings and unit display are functional.

---

## Phase 3: User Story 1 — Manage Rooms (Priority: P1) 🎯 MVP

**Goal**: Homeowner can create, list, edit, and delete rooms (label + floor assignment). All nested data cascades on delete.

**Independent Test**: Create "Living Room" on "Ground Floor" → verify in list → rename to "Lounge" → verify update → delete → verify gone.

### Backend — User Story 1

- [ ] T040 [P] [US1] Create Room DTOs in `backend/src/dto/room/CreateRoomDto.ts` (`@IsNotEmpty()` label + floor), `UpdateRoomDto.ts` (both optional, at least one required via custom validator), `RoomResponseDto.ts`, `RoomDetailResponseDto.ts` (extends response + `floorSegments`, `ceilingSegments`, `walls`)

> ⚠️ **TDD (Red phase)**: Write T043 and T044 next. Run them and confirm they **FAIL** before writing T041/T042.

- [ ] T043 [P] [US1] Write Jest unit tests for `RoomService` in `backend/tests/unit/RoomService.test.ts`: mock `IRoomRepository`; cover listRooms ordering, createRoom validation path, updateRoom NOT_FOUND, deleteRoom NOT_FOUND — assert response time < 2000ms on key operations (SC-002)
- [ ] T044 [P] [US1] Write Jest + Supertest integration tests for rooms endpoints in `backend/tests/integration/rooms.test.ts`: use `dbSetup` helper (T111); cover all five room endpoints (GET list, POST create, GET detail, PATCH update, DELETE cascade); assert response times < 2000ms (SC-002)

> ✅ **TDD (Green phase)**: Implement to make the tests above pass.

- [ ] T041 [US1] Implement `RoomService` in `backend/src/services/RoomService.ts`: `listRooms()` ordered by floor ASC then createdAt ASC; `getRoom(id)` with detail relations; `createRoom(dto)`; `updateRoom(id, dto)`; `deleteRoom(id)` (TypeORM cascade handles nested removal); depends on `IRoomRepository`; throws `AppError(NOT_FOUND)` when room absent
- [ ] T042 [US1] Implement `RoomController` in `backend/src/controllers/RoomController.ts` (thin handlers: extract DTO → call service → respond); create `backend/src/routes/rooms.ts` mounting GET `/`, POST `/`, GET `/:roomId`, PATCH `/:roomId`, DELETE `/:roomId` — **register `GET /summary` route BEFORE `/:roomId` to prevent "summary" matching as roomId**

### Frontend — User Story 1

- [ ] T045 [US1] Create rooms API service in `frontend/src/services/roomsService.ts`: `getRooms()`, `getRoom(id)`, `createRoom(dto)`, `updateRoom(id, dto)`, `deleteRoom(id)` — typed with `apiClient`
- [ ] T046 [P] [US1] Implement `RoomCard` component in `frontend/src/components/rooms/RoomCard.tsx`: displays label + floor; Edit and Delete buttons; calls `onDelete` prop with confirmation; WCAG 2.1 AA
- [ ] T047 [P] [US1] Implement `RoomList` component in `frontend/src/components/rooms/RoomList.tsx`: renders list of `RoomCard`; shows `EmptyState` when no rooms; shows `LoadingSpinner` and `ErrorMessage` for async states
- [ ] T048 [P] [US1] Implement `RoomForm` component in `frontend/src/components/rooms/RoomForm.tsx`: controlled inputs for label and floor (free-form text); uses `useUnsavedChanges`; validates non-empty fields client-side before submit; shows `ErrorMessage` on API error
- [ ] T049 [US1] Implement `RoomListPage` in `frontend/src/pages/RoomListPage.tsx` (route: `/`): fetches rooms, renders `RoomList`, "Add Room" button linking to `/rooms/new`
- [ ] T050 [US1] Implement `CreateRoomPage` in `frontend/src/pages/CreateRoomPage.tsx` (route: `/rooms/new`): renders `RoomForm` in create mode; on success redirects to `/`
- [ ] T051 [US1] Implement `EditRoomPage` in `frontend/src/pages/EditRoomPage.tsx` (route: `/rooms/:roomId/edit`): fetches room, renders `RoomForm` pre-populated; on success redirects to `/rooms/:roomId`

### Frontend Tests — User Story 1

- [ ] T052 [P] [US1] Write Vitest + RTL unit tests for `RoomList` in `frontend/tests/components/rooms/RoomList.test.tsx`: empty state, populated list, delete confirmation
- [ ] T053 [P] [US1] Write Vitest + RTL unit tests for `RoomForm` in `frontend/tests/components/rooms/RoomForm.test.tsx`: empty label validation, floor validation, dirty/clean state, submit

### E2E — User Story 1

- [ ] T054 [US1] Write Playwright E2E test in `tests/e2e/us1-manage-rooms.spec.ts` covering all four acceptance scenarios: create room → verify list; edit label+floor → verify update; delete → verify cascade removal; multi-room list view

**Checkpoint**: User Story 1 is fully functional and independently testable. MVP deliverable.

---

## Phase 4: User Story 2 — Capture Floor and Ceiling Dimensions (Priority: P2)

**Goal**: Homeowner can add, edit, and delete labelled dimension segments on both the floor and ceiling surface of a room independently. Unlimited segments for non-rectangular shapes.

**Independent Test**: Open a room → define 5 floor segments → verify all saved → edit one → verify update → delete one → verify removed → confirm ceiling panel is empty and independent.

### Backend — User Story 2

- [ ] T055 [P] [US2] Create Segment DTOs in `backend/src/dto/segment/CreateSegmentDto.ts` (`@IsNotEmpty()` label, `@IsPositive()` measurement, `@IsIn(['floor','ceiling'])` surfaceType), `UpdateSegmentDto.ts` (label optional `@IsNotEmpty()`, measurement optional `@IsPositive()`), `SegmentResponseDto.ts`

> ⚠️ **TDD (Red phase)**: Write T058 and T059 next. Confirm they **FAIL** before writing T056/T057.

- [ ] T058 [P] [US2] Write Jest unit tests for `DimensionSegmentService` in `backend/tests/unit/DimensionSegmentService.test.ts`: mock repositories; cover getSegments floor/ceiling independence, addSegment room-not-found, updateSegment/deleteSegment not-found paths
- [ ] T059 [P] [US2] Write Jest + Supertest integration tests for segments endpoints in `backend/tests/integration/segments.test.ts`: use `dbSetup` helper (T111); cover GET with `?surface=floor`, GET with `?surface=ceiling`, POST, PATCH, DELETE; verify floor/ceiling independence in same room; assert response times < 2000ms

> ✅ **TDD (Green phase)**: Implement to make the tests above pass.

- [ ] T056 [US2] Implement `DimensionSegmentService` in `backend/src/services/DimensionSegmentService.ts`: `getSegments(roomId, surfaceType)` ordered by createdAt ASC; `addSegment(roomId, dto)` validates room exists; `updateSegment(roomId, segId, dto)`; `deleteSegment(roomId, segId)`; depends on `IDimensionSegmentRepository` + `IRoomRepository`
- [ ] T057 [US2] Implement `DimensionSegmentController` in `backend/src/controllers/DimensionSegmentController.ts`; create `backend/src/routes/segments.ts` mounting under `/rooms/:roomId/segments`: GET `/?surface=floor|ceiling`, POST `/`, PATCH `/:segmentId`, DELETE `/:segmentId`; validate `surface` query param

### Frontend — User Story 2

- [ ] T060 [US2] Create segments API service in `frontend/src/services/segmentsService.ts`: `getSegments(roomId, surface)`, `addSegment(roomId, dto)`, `updateSegment(roomId, segId, dto)`, `deleteSegment(roomId, segId)`
- [ ] T061 [P] [US2] Implement `SegmentForm` component in `frontend/src/components/dimensions/SegmentForm.tsx`: inputs for label (text) and measurement (positive number); shows unit suffix from `useSettings`; uses `useUnsavedChanges`; validates positive measurement client-side; inline within panel (no separate page)
- [ ] T062 [P] [US2] Implement `SegmentList` component in `frontend/src/components/dimensions/SegmentList.tsx`: renders all segments for one surface with label, measurement, and unit; inline edit mode via `SegmentForm`; delete with confirmation; `EmptyState` when empty; `LoadingSpinner`/`ErrorMessage` states
- [ ] T063 [US2] Implement `RoomDetailPage` in `frontend/src/pages/RoomDetailPage.tsx` (route: `/rooms/:roomId`): fetches room detail; renders room label + floor header; two collapsible panels — "Floor Dimensions" and "Ceiling Dimensions" each containing a `SegmentList`; "Edit Room" link to `/rooms/:roomId/edit`; walls section placeholder (populated in US3)

### Frontend Tests — User Story 2

- [ ] T064 [P] [US2] Write Vitest + RTL unit tests for `SegmentList` in `frontend/tests/components/dimensions/SegmentList.test.tsx`: empty state, list render with unit, inline edit/delete, floor/ceiling label distinction
- [ ] T065 [P] [US2] Write Vitest + RTL unit tests for `SegmentForm` in `frontend/tests/components/dimensions/SegmentForm.test.tsx`: positive-only validation (zero rejected, negative rejected), dirty state

### E2E — User Story 2

- [ ] T066 [US2] Write Playwright E2E test in `tests/e2e/us2-floor-ceiling-dimensions.spec.ts` covering all five acceptance scenarios: add floor segment → verify; add 5+ segments → verify all saved; edit segment → verify; delete segment → verify; confirm ceiling panel is independent

**Checkpoint**: User Stories 1 + 2 are both independently testable.

---

## Phase 5: User Story 3 — Manage Walls (Priority: P3)

**Goal**: Homeowner can add walls to a room with label, width, and height. Walls can be listed, edited, and deleted. Deletion cascades to windows.

**Independent Test**: Open room → add "South Wall" with width/height → verify in list → edit label+dimensions → verify update → delete → verify removal.

### Backend — User Story 3

- [ ] T067 [P] [US3] Create Wall DTOs in `backend/src/dto/wall/CreateWallDto.ts` (`@IsNotEmpty()` label, `@IsPositive()` width and height), `UpdateWallDto.ts`, `WallSummaryResponseDto.ts`, `WallDetailResponseDto.ts` (extends summary + `windows: WindowResponseDto[]`)

> ⚠️ **TDD (Red phase)**: Write T070 and T071 next. Confirm they **FAIL** before writing T068/T069.

- [ ] T070 [P] [US3] Write Jest unit tests for `WallService` in `backend/tests/unit/WallService.test.ts`: mock repositories; cover getWalls ordering, addWall room-not-found, updateWall/deleteWall not-found, delete cascades
- [ ] T071 [P] [US3] Write Jest + Supertest integration tests for walls endpoints in `backend/tests/integration/walls.test.ts`: use `dbSetup` helper (T111); cover all five wall endpoints; verify cascade deletion removes windows; assert response times < 2000ms

> ✅ **TDD (Green phase)**: Implement to make the tests above pass.

- [ ] T068 [US3] Implement `WallService` in `backend/src/services/WallService.ts`: `getWalls(roomId)` ordered by createdAt ASC; `getWall(roomId, wallId)` with windows; `addWall(roomId, dto)` validates room exists; `updateWall(roomId, wallId, dto)`; `deleteWall(roomId, wallId)` (cascade removes windows); depends on `IWallRepository` + `IRoomRepository`
- [ ] T069 [US3] Implement `WallController` in `backend/src/controllers/WallController.ts`; create `backend/src/routes/walls.ts` mounting under `/rooms/:roomId/walls`: GET `/`, POST `/`, GET `/:wallId`, PATCH `/:wallId`, DELETE `/:wallId`

### Frontend — User Story 3

- [ ] T072 [US3] Create walls API service in `frontend/src/services/wallsService.ts`: `getWalls(roomId)`, `getWall(roomId, wallId)`, `addWall(roomId, dto)`, `updateWall(roomId, wallId, dto)`, `deleteWall(roomId, wallId)`
- [ ] T073 [P] [US3] Implement `WallForm` component in `frontend/src/components/walls/WallForm.tsx`: inputs for label (text), width (positive number), height (positive number); shows unit suffix from `useSettings`; uses `useUnsavedChanges`; validates positive measurements client-side
- [ ] T074 [P] [US3] Implement `WallList` component in `frontend/src/components/walls/WallList.tsx`: renders wall cards showing label, width, height, and unit; "View" link to `/rooms/:roomId/walls/:wallId`; Edit/Delete actions; `EmptyState`, `LoadingSpinner`, `ErrorMessage`
- [ ] T075 [US3] Extend `RoomDetailPage` (`frontend/src/pages/RoomDetailPage.tsx`) to render `WallList` section below dimension panels; add "Add Wall" button linking to `/rooms/:roomId/walls/new`
- [ ] T076 [US3] Implement `AddWallPage` in `frontend/src/pages/AddWallPage.tsx` (route: `/rooms/:roomId/walls/new`): renders `WallForm` in create mode; on success redirects to `/rooms/:roomId`
- [ ] T077 [US3] Implement `EditWallPage` in `frontend/src/pages/EditWallPage.tsx` (route: `/rooms/:roomId/walls/:wallId/edit`): fetches wall, renders `WallForm` pre-populated; on success redirects to `/rooms/:roomId/walls/:wallId`

### Frontend Tests — User Story 3

- [ ] T078 [P] [US3] Write Vitest + RTL unit tests for `WallList` in `frontend/tests/components/walls/WallList.test.tsx`: empty state, populated list with unit, delete confirmation
- [ ] T079 [P] [US3] Write Vitest + RTL unit tests for `WallForm` in `frontend/tests/components/walls/WallForm.test.tsx`: positive-only validation, dirty state, pre-population in edit mode

### E2E — User Story 3

- [ ] T080 [US3] Write Playwright E2E test in `tests/e2e/us3-manage-walls.spec.ts` covering all four acceptance scenarios: add wall → verify list; edit label+dimensions → verify; delete → verify cascade; multi-wall list view

**Checkpoint**: User Stories 1, 2, and 3 are all independently testable.

---

## Phase 6: User Story 4 — Add Windows to Walls (Priority: P4)

**Goal**: Homeowner can add windows (label, width, height) to a wall. Windows are visible only when viewing that specific wall. Deletion removes only the window, leaving the wall intact.

**Independent Test**: Open wall → add "Front Bay" window → verify displayed → edit dimensions → verify update → delete → verify removed → confirm different wall shows no windows.

### Backend — User Story 4

- [ ] T081 [P] [US4] Create Window DTOs in `backend/src/dto/window/CreateWindowDto.ts` (`@IsNotEmpty()` label, `@IsPositive()` width and height), `UpdateWindowDto.ts`, `WindowResponseDto.ts`

> ⚠️ **TDD (Red phase)**: Write T084 and T085 next. Confirm they **FAIL** before writing T082/T083.

- [ ] T084 [P] [US4] Write Jest unit tests for `WindowService` in `backend/tests/unit/WindowService.test.ts`: mock repositories; cover addWindow wall-not-found, updateWindow/deleteWindow not-found paths
- [ ] T085 [P] [US4] Write Jest + Supertest integration tests for windows endpoints in `backend/tests/integration/windows.test.ts`: use `dbSetup` helper (T111); cover all four window endpoints; verify wall remains intact after window deletion; verify isolation between walls; assert response times < 2000ms

> ✅ **TDD (Green phase)**: Implement to make the tests above pass.

- [ ] T082 [US4] Implement `WindowService` in `backend/src/services/WindowService.ts`: `getWindows(wallId)` ordered by createdAt ASC; `addWindow(wallId, dto)` validates wall exists; `updateWindow(wallId, windowId, dto)`; `deleteWindow(wallId, windowId)`; depends on `IWindowRepository` + `IWallRepository`
- [ ] T083 [US4] Implement `WindowController` in `backend/src/controllers/WindowController.ts`; create `backend/src/routes/windows.ts` mounting under `/rooms/:roomId/walls/:wallId/windows`: GET `/`, POST `/`, PATCH `/:windowId`, DELETE `/:windowId`

### Frontend — User Story 4

- [ ] T086 [US4] Create windows API service in `frontend/src/services/windowsService.ts`: `getWindows(roomId, wallId)`, `addWindow(roomId, wallId, dto)`, `updateWindow(roomId, wallId, windowId, dto)`, `deleteWindow(roomId, wallId, windowId)`
- [ ] T087 [P] [US4] Implement `WindowForm` component in `frontend/src/components/windows/WindowForm.tsx`: inputs for label (text), width (positive number), height (positive number); unit suffix from `useSettings`; uses `useUnsavedChanges`; positive measurement validation
- [ ] T088 [P] [US4] Implement `WindowList` component in `frontend/src/components/windows/WindowList.tsx`: renders window entries with label, width, height, and unit; inline edit via `WindowForm`; delete with confirmation; `EmptyState`, `LoadingSpinner`, `ErrorMessage`
- [ ] T089 [US4] Implement `WallDetailPage` in `frontend/src/pages/WallDetailPage.tsx` (route: `/rooms/:roomId/walls/:wallId`): fetches wall detail; displays wall label, width, height with unit; renders `WindowList`; "Add Window" inline form toggle; "Edit Wall" link; back link to `/rooms/:roomId`

### Frontend Tests — User Story 4

- [ ] T090 [P] [US4] Write Vitest + RTL unit tests for `WindowList` in `frontend/tests/components/windows/WindowList.test.tsx`: empty state, populated list with unit, edit/delete
- [ ] T091 [P] [US4] Write Vitest + RTL unit tests for `WindowForm` in `frontend/tests/components/windows/WindowForm.test.tsx`: positive-only validation, dirty state

### E2E — User Story 4

- [ ] T092 [US4] Write Playwright E2E test in `tests/e2e/us4-windows.spec.ts` covering all five acceptance scenarios: add window → verify; multi-window view; edit → verify; delete → wall intact; wall with no windows shows empty state — **SC-003**: assert the journey from room list → room detail → wall detail takes ≤ 3 click interactions

**Checkpoint**: User Stories 1–4 are all independently testable.

---

## Phase 7: User Story 5 — Print Summary (Priority: P5)

**Goal**: Homeowner triggers a read-only print view of all rooms grouped by floor, showing all segments, walls, and windows with measurements and unit. Formatted for browser print / PDF. No edit chrome in output.

**Independent Test**: With 2+ rooms on different floors, each with walls and windows → trigger print → verify rooms grouped by floor → verify all labels and measurements shown with unit → verify no edit controls.

### Backend — User Story 5

- [ ] T093 [US5] Implement `printSummary()` method in `backend/src/services/RoomService.ts`: query all rooms with joined segments, walls, and windows; group by `floor` alphabetically; return `PrintSummaryResponseDto` including current `measurementUnit` from `SettingsService`
- [ ] T094 [US5] Add `GET /rooms/summary` handler to `RoomController` + `backend/src/routes/rooms.ts` (**must be registered before `/:roomId` route** to prevent Express routing conflict); returns `PrintSummaryResponseDto`

### Backend Tests — User Story 5

- [ ] T095 [US5] Write Jest + Supertest integration test for `GET /api/v1/rooms/summary` in `backend/tests/integration/rooms.test.ts`: verify grouping by floor, verify all nested data returned, verify unit present, verify empty-state payload when no rooms

### Frontend — User Story 5

- [ ] T096 [US5] Add `getSummary()` method to `frontend/src/services/roomsService.ts` calling `GET /api/v1/rooms/summary`
- [ ] T097 [US5] Implement `PrintSummary` component in `frontend/src/components/print/PrintSummary.tsx`: read-only layout grouped by floor; for each room shows label, floor, all floor segments, all ceiling segments, all walls with dimensions, and each wall's windows with dimensions; all measurements show unit suffix; Tailwind `print:hidden` hides all interactive elements; `EmptyState` when no rooms
- [ ] T098 [US5] Implement `PrintPage` in `frontend/src/pages/PrintPage.tsx` (route: `/print`): fetches summary; renders `PrintSummary`; "Print" button calls `window.print()`; `Navigation` hidden in print via `print:hidden`; no edit controls rendered anywhere in the print output

### Frontend Tests — User Story 5

- [ ] T099 [US5] Write Vitest + RTL unit tests for `PrintSummary` in `frontend/tests/components/print/PrintSummary.test.tsx`: populated data renders all rooms/segments/walls/windows with unit; empty state; no edit buttons present in render

### E2E — User Story 5

- [ ] T100 [US5] Write Playwright E2E test in `tests/e2e/us5-print-summary.spec.ts` covering all four acceptance scenarios: print shows all rooms grouped by floor with segments/walls/windows; measurements show unit; browser print contains no nav/edit controls; empty state message shown when no rooms — **SC-006**: seed ≥ 10 rooms across ≥ 2 floors; assert all appear with no missing data in the print view

**Checkpoint**: All five user stories are complete and independently testable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: OpenAPI documentation, security hardening, accessibility audit, and final validation.

- [ ] T101 Add Swagger JSDoc `@openapi` annotations to all route handlers across `backend/src/routes/`; configure `swagger-jsdoc` in `backend/src/app.ts` to generate spec at startup; write spec to `backend/src/openapi.json` (committed); verify Swagger UI accessible at `http://localhost:4000/api/docs`; add a CI step in T008's workflow that regenerates the spec and fails if `git diff --exit-code backend/src/openapi.json` detects drift
- [ ] T102 [P] Run `npm audit` in both `backend/` and `frontend/`; fix or document any vulnerabilities; must pass with zero high/critical findings before merge (Security Gate)
- [ ] T103 [P] Audit all frontend components for: (1) WCAG 2.1 AA — accessible labels, focus rings, `role="alert"` on errors, `<label>` associations; (2) **responsive layout** — verify all pages render correctly at 375px (mobile), 768px (tablet), and 1280px (desktop) viewports; fix any violations
- [ ] T104 [P] Verify no magic values remain: all API paths use constants from `backend/src/constants/routes.ts` and `frontend/src/constants/api.ts`; all unit values use the `Unit` type constant; all error codes use `ErrorCodes.ts`; confirm ESLint `max-lines-per-function` rule is configured to enforce the 40-line limit from the constitution (add to `.eslintrc` for both backend and frontend if not already present)
- [ ] T105 Run full quickstart.md manual validation checklist against `docker compose up` stack: verify all 10 checklist items pass end-to-end — for SC-004, manually verify the 3-step path (room list → room detail → wall detail) is discoverable without instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user story phases**
- **US1 (Phase 3)**: Depends on Phase 2 only — no dependencies on US2–US5
- **US2 (Phase 4)**: Depends on Phase 2 only — no dependencies on US1/US3–US5
- **US3 (Phase 5)**: Depends on Phase 2; **RoomDetailPage extension depends on US2 completing T063 first**
- **US4 (Phase 6)**: Depends on Phase 2; wall lookup depends on US3 backend (T068) being complete
- **US5 (Phase 7)**: Depends on Phase 2; print data query depends on all entity data existing (US1–US4 recommended complete for meaningful test data)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Backend Dependency | Frontend Dependency |
|-------|-------------------|---------------------|
| US1 | None (foundational entities only) | None |
| US2 | US1 Room entity + IRoomRepository | US1 `RoomDetailPage` shell from T063 |
| US3 | US2 Room entity; no segment dependency | US2 `RoomDetailPage` (T063) must exist to extend |
| US4 | US3 Wall entity + IWallRepository | US3 `WallDetailPage` shell needed |
| US5 | US1–US4 services for full data; settingsService for unit | All prior pages for meaningful E2E test |

### Within Each User Story (TDD Order — enforced by constitution Principle IV)

1. **DTOs** (define the interface contract)
2. **Tests — Red phase** (write unit + integration tests; confirm they FAIL)
3. **Implementation — Green phase** (implement service + controller to make tests pass)
4. Backend service complete → Frontend service (parallel possible)
5. Frontend components [P] can run in parallel once services exist
6. Page components depend on their child components

### Parallel Opportunities

- T004, T005, T006 — project initialisations (different directories)
- T017, T018, T019, T020 — entity files (different files, no inter-entity deps at this point)
- T106–T110 — repository unit tests (all independent files)
- T112, T113 — hook unit tests (independent files)
- T030, T031, T032, T033, T034 — shared UI components (independent files)
- Within each story: all `[P]` tagged tasks (different files, no shared dependencies)
- US1 backend + US2 backend — can proceed in parallel once Phase 2 is done
- US1 frontend + US2 frontend — can proceed in parallel once respective backends exist

---

## Parallel Example: User Story 1 Backend (TDD order)

```bash
# Step 1 — Define interface:
Task T040: "Create Room DTOs"

# Step 2 — Red phase (run in parallel, both must FAIL):
Task T043: "Write Jest unit tests for RoomService — confirm FAIL"
Task T044: "Write integration tests for rooms endpoints — confirm FAIL"

# Step 3 — Green phase (sequential, implement to pass):
Task T041: "Implement RoomService (make T043 pass)"
Task T042: "Implement RoomController + routes (make T044 pass)"
```

## Parallel Example: User Story 1 Frontend

```bash
# Once T041/T042 complete, launch in parallel:
Task T046: "Implement RoomCard component"
Task T047: "Implement RoomList component"
Task T048: "Implement RoomForm component"
Task T052: "Write unit tests for RoomList"
Task T053: "Write unit tests for RoomForm"

# Then sequentially (depend on components above):
Task T049: "Implement RoomListPage"
Task T050: "Implement CreateRoomPage"
Task T051: "Implement EditRoomPage"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (rooms CRUD)
4. **STOP and VALIDATE**: Run `tests/e2e/us1-manage-rooms.spec.ts`, run backend integration tests, `docker compose up` + quickstart checklist items 1–2 + 10
5. Deploy/demo if ready — homeowner can create and manage rooms

### Incremental Delivery

1. **Phase 1 + 2** → Foundation + AppSettings ready
2. **+ Phase 3 (US1)** → Rooms CRUD — independently testable → Demo (MVP)
3. **+ Phase 4 (US2)** → Floor/ceiling dimensions — independently testable → Demo
4. **+ Phase 5 (US3)** → Walls — independently testable → Demo
5. **+ Phase 6 (US4)** → Windows — independently testable → Demo
6. **+ Phase 7 (US5)** → Print summary — completes all user stories → Demo
7. **+ Phase 8** → Polish, Swagger, audit → Merge-ready

### Parallel Team Strategy

With multiple developers:

1. Entire team completes Phase 1 + Phase 2 together
2. Once Foundational phase is done:
   - Developer A: US1 (rooms) — backend + frontend
   - Developer B: US2 (dimensions) — backend + frontend
   - Developer C: US3 (walls) — backend + frontend (coordinate RoomDetailPage extension with Dev B)
3. US4 (windows) starts once US3 backend is complete
4. US5 (print) starts once US1–US4 are all complete

---

## Notes

- `[P]` tasks involve different files with no dependency on incomplete tasks in the same phase
- `[US#]` label maps each task to a specific user story for traceability
- Each user story is independently completable and testable
- **TDD**: Within each story's backend section, test tasks appear before implementation tasks — write tests, confirm they FAIL, then implement (constitution Principle IV)
- The `GET /rooms/summary` route (T094) **must be registered before** `GET /rooms/:roomId` in Express to avoid routing conflict
- TypeORM migrations are committed and run automatically on backend startup (`synchronize: false`)
- All DTO validation uses `class-validator` — `@IsPositive()` enforces FR-019 (no zero/negative measurements)
- `useUnsavedChanges` hook must be used in every form component to satisfy FR-021
- Tailwind `print:hidden` / `print:block` variants handle US5 print formatting — no server-side PDF library required
- Frontend type `WindowResponse` (never `Window`) avoids shadowing the DOM global
- All integration test suites must use the `dbSetup` helper (T111) for clean database state per suite
- Repository unit tests (T106–T110) use `__tests__/` co-located with source files per constitution convention
- Hook unit tests (T112–T113) use `__tests__/` co-located with hook source files
- CI (T008) enforces: ≥80% coverage, integration tests on every PR, Playwright on frontend/contract changes, OpenAPI spec drift check
