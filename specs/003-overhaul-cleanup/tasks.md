# Tasks: Overhaul Release Cleanup

**Input**: Design documents from `/specs/003-overhaul-cleanup/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths are included in every description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the test DB is running and review current state before any changes.

- [ ] T001 Verify `docker-compose.test.yml` is running (port 3307 → `room_dimensions_test` DB) and accessible
- [ ] T002 Confirm current `npm test` baseline in `backend/` passes before any changes (captures starting state)
- [ ] T003 [P] Confirm current `npm test` baseline in `frontend/` passes before any changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure that multiple user stories depend on — must complete before story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Upgrade `node:20-alpine` → `node:22-alpine` in `backend/Dockerfile` (both builder and production stages)
- [ ] T005 [P] Upgrade `node:20-alpine` → `node:22-alpine` in `frontend/Dockerfile` (builder stage)
- [ ] T006 Upgrade `@types/node` from `^20.11.0` to `^22.0.0` in `backend/package.json` and run `npm install` in repo root
- [ ] T007 Run `npm run build` in `backend/` to confirm Node 22 + updated types compile cleanly
- [ ] T008 [P] Run `npm run build` in `frontend/` to confirm Node 22 compatible build

**Checkpoint**: Node 22 baseline confirmed — all existing code builds under the new runtime.

---

## Phase 3: User Story 1 — Test Run Isolation (Priority: P1) 🎯 MVP

**Goal**: Automated tests run entirely against the test DB (port 3307, `room_dimensions_test`)
and never write to or read from the dev DB (port 3306, `room_dimensions`).

**Independent Test**: Run `npm test` in `backend/`, then inspect the dev DB — row count in
every table must be identical to before the test run. Run tests twice and confirm identical results.

### Implementation for User Story 1

- [ ] T009 [US1] Create `backend/tests/helpers/setTestEnv.ts` — sets `process.env.DB_PORT='3307'`, `process.env.DB_DATABASE='room_dimensions_test'`, `process.env.DB_PASSWORD='testpassword'`, `process.env.DB_HOST='localhost'` before any module loads
- [ ] T010 [US1] Add `setupFiles: ['<rootDir>/tests/helpers/setTestEnv.ts']` to `backend/jest.config.js` so env vars are injected before `dataSource.ts` is evaluated
- [ ] T011 [US1] Remove `AppDataSource.initialize()` and `AppDataSource.destroy()` calls from `backend/tests/helpers/dbSetup.ts` — `AppDataSource` now auto-connects to test DB via env vars; `testDataSource` remains for direct setup/teardown
- [ ] T012 [US1] Run full backend integration test suite (`npm test` in `backend/`) and confirm all tests pass and only the test DB is touched

**Checkpoint**: Dev DB is never touched by test runs. US1 complete and verified.

---

## Phase 4: User Story 2 — Segment Width and Length Support (Priority: P2)

**Goal**: Each dimension segment optionally carries `width` and `length` values alongside the
existing `label` and `measurement`. Both frontend and backend updated; existing data unaffected.

**Independent Test**: Create a segment with all four fields via the API and UI, verify all
values persist. Create a second segment with no width/length and confirm it saves. Attempt to
save width=0 and confirm a 400 error with a clear message.

### Backend — Data Model and API

- [ ] T013 [US2] Add nullable `width decimal(10,4)` and `length decimal(10,4)` columns to the `DimensionSegment` entity in `backend/src/entities/DimensionSegment.ts`
- [ ] T014 [US2] Create TypeORM migration `backend/src/migrations/<timestamp>-AddSegmentWidthLength.ts` — ALTER TABLE to add `width` and `length` nullable columns
- [ ] T015 [US2] Add optional `@IsOptional() @IsPositive() width?: number` and `length?: number` fields to `backend/src/dto/segment/CreateSegmentDto.ts`
- [ ] T016 [US2] Add optional `@IsOptional() @IsPositive() width?: number` and `length?: number` fields to `backend/src/dto/segment/UpdateSegmentDto.ts`
- [ ] T017 [US2] Add `width: number | null` and `length: number | null` fields to `backend/src/dto/segment/SegmentResponseDto.ts`
- [ ] T018 [US2] Update `toResponse()` mapper in `backend/src/services/DimensionSegmentService.ts` to include `width: s.width !== null ? Number(s.width) : null` and `length` equivalently
- [ ] T018b [US2] Update `backend/tests/unit/DimensionSegmentService.test.ts` to add cases: `toResponse()` maps `width`/`length` as `Number(s.width)` when set and `null` when not; `addSegment()` with `width` and `length` in the dto persists and returns them; `updateSegment()` with only `width` changed leaves `length` unchanged
- [ ] T019 [US2] Update Swagger JSDoc annotations in `backend/src/routes/segments.ts` to document `width` and `length` as optional positive number fields on create/update/response schemas
- [ ] T020 [US2] Update print summary mapper in `backend/src/services/RoomService.ts` — include `width` and `length` on each segment entry (omit when null) in the `mapSegments` helper
- [ ] T021 [US2] Add integration test cases to `backend/tests/integration/segments.test.ts`: (a) POST with `width: 3.0` and `length: 2.5` → response includes both fields; (b) PATCH with only `width: 3.2` → length unchanged; (c) POST with `width: 0` → 400 with clear error message; (d) POST without width/length → response has `width: null, length: null`. Then run `npm test` and confirm all pass.

### Frontend — Types, Service, Form, Display

- [ ] T022 [US2] Add optional `width?: number | null` and `length?: number | null` to the `SegmentResponse` interface in `frontend/src/types/index.ts`
- [ ] T023 [US2] Add optional `width?: number` and `length?: number` to `CreateSegmentInput` and `UpdateSegmentInput` interfaces in `frontend/src/services/segmentsService.ts`
- [ ] T024 [US2] Add `width` and `length` number input fields to `frontend/src/components/dimensions/SegmentForm.tsx` — optional, validate > 0 client-side, show error message per FR-008
- [ ] T025 [US2] Update segment display in `frontend/src/components/dimensions/SegmentList.tsx` to show `width × length` alongside measurement when both (or either) are present, with the app unit
- [ ] T026 [US2] Update `frontend/src/components/print/PrintSummary.tsx` to render `width` and `length` per segment in the floor/ceiling segment rows when present (FR-010)
- [ ] T027 [US2] Run frontend unit test suite (`npm test` in `frontend/`) to confirm existing tests still pass; manually verify segment form shows new fields and displays them correctly

**Checkpoint**: Segments with and without width/length work end-to-end. US2 complete.

---

## Phase 5: User Story 3 — Runtime and Container Modernisation (Priority: P3)

**Goal**: Backend production image runs as a non-root user; both images report Node 22.
Dockerfile layer ordering follows current best practices.

**Independent Test**: `docker build` both images successfully; `docker run --rm <image> whoami`
returns `node` for backend; `docker run --rm <image> node --version` returns `v22.x.x`.

### Implementation for User Story 3

- [ ] T028 [US3] Add `RUN chown -R node:node /app` and `USER node` to the production stage of `backend/Dockerfile` (after all COPY and npm ci steps, before EXPOSE/CMD)
- [ ] T029 [US3] Verify layer order in `backend/Dockerfile` is optimal: COPY package*.json → npm ci → COPY dist → chown → USER (minimise cache-busting layers)
- [ ] T030 [US3] Run `docker build -t room-backend -f backend/Dockerfile .` from repo root and confirm build succeeds with no errors
- [ ] T031 [US3] Confirm `docker run --rm room-backend whoami` outputs `node` and `docker run --rm room-backend node --version` outputs `v22.x.x`
- [ ] T032 [P] [US3] Run `docker build -t room-frontend -f frontend/Dockerfile .` and confirm build succeeds; frontend uses `nginx:alpine` production stage so no user change needed
- [ ] T033 [US3] Run full application stack via `docker compose up --build -d` and verify rooms API (`curl localhost:4000/api/v1/rooms`) returns 200 and UI loads at port 3000

**Checkpoint**: Both containers build and run under Node 22 with non-root backend user. US3 complete.

---

## Phase 6: User Story 4 — Test Coverage at 80% Threshold (Priority: P4)

**Goal**: Backend and frontend both reach ≥ 80% line and branch coverage; coverage gate
blocks any run that drops below the threshold (gate already configured in jest.config.js
and vite.config.ts — we just need the missing tests).

**Independent Test**: Run `npm test -- --coverage` in each workspace; confirm both Lines and
Branches ≥ 80% in the coverage summary. Introduce a deliberate uncovered function and confirm
the run fails; remove it and confirm it passes.

### Hook Coverage Audit

- [X] T033b [US4] Run `npx vitest run --coverage --reporter=verbose` in `frontend/` and inspect per-file coverage for all files under `frontend/src/hooks/`. List any hook file below 80% line or branch coverage and add corresponding test tasks before T042.

### Backend — Missing Unit Test

- [X] T034 [US4] Create `backend/tests/unit/SettingsService.test.ts` — unit tests covering `getSettings()` (returns measurementUnit from repo) and `updateSettings()` (calls upsert with new unit, returns updated dto), including primary error path (repo throws)

### Frontend — Missing Service Client Tests

- [X] T035 [P] [US4] Create `frontend/src/services/__tests__/apiClient.test.ts` — unit tests for the `request` helper: success path (200 returns parsed body), error path (non-2xx throws `ApiClientError` with correct code and message)
- [X] T036 [P] [US4] Create `frontend/src/services/__tests__/roomsService.test.ts` — mock `apiClient`; verify `getRooms`, `createRoom`, `updateRoom`, `deleteRoom` call correct HTTP verb and URL; verify error propagation
- [X] T037 [P] [US4] Create `frontend/src/services/__tests__/segmentsService.test.ts` — mock `apiClient`; verify `getSegments`, `addSegment` (with and without width/length), `updateSegment`, `deleteSegment` call correct endpoints; verify width/length forwarded in request body
- [X] T038 [P] [US4] Create `frontend/src/services/__tests__/surfaceDimensionApi.test.ts` — mock `apiClient`; verify get/create/update/delete surface dimension calls for floor and ceiling surface types
- [X] T039 [P] [US4] Create `frontend/src/services/__tests__/wallsService.test.ts` — mock `apiClient`; verify CRUD methods call correct endpoints and propagate errors
- [X] T040 [P] [US4] Create `frontend/src/services/__tests__/windowsService.test.ts` — mock `apiClient`; verify CRUD methods call correct endpoints and propagate errors
- [X] T041 [US4] Run `npm test -- --coverage` in `backend/` and confirm Lines ≥ 80% and Branches ≥ 80% in coverage summary output
- [X] T042 [US4] Run `npm test -- --coverage` in `frontend/` and confirm Lines ≥ 80% and Branches ≥ 80% in coverage summary output

**Checkpoint**: Both workspaces meet the 80% coverage gate. US4 complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, consistency checks, and documentation.

- [X] T043 Run `npm run lint` in `backend/` and confirm zero errors
- [X] T044 [P] Run `npm run lint` in `frontend/` and confirm zero errors
- [X] T045 Run `npm test` in `backend/` (without coverage flag) and confirm all tests pass and test DB is used
- [X] T046 [P] Run `npm test` in `frontend/` and confirm all tests pass
- [X] T047 Build and start full stack with `docker compose up --build -d` and execute the quickstart.md acceptance scenarios for all four user stories
- [X] T048 Run `npm audit` in repo root and confirm zero high or critical vulnerabilities after Node 22 + dependency updates
- [X] T049 Update `backend/.env.example` (if it exists) to document `DB_PORT` and `DB_DATABASE` test env var overrides for new-developer onboarding

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — can start immediately after foundational
- **US2 (Phase 4)**: Depends on Phase 2 — independent of US1
- **US3 (Phase 5)**: Depends on Phase 2 — independent of US1 and US2
- **US4 (Phase 6)**: Depends on US2 (segmentsService test covers new width/length fields) — otherwise independent
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Independent — only needs Phase 2 complete
- **US2 (P2)**: Independent — only needs Phase 2 complete
- **US3 (P3)**: Independent — only needs Phase 2 complete
- **US4 (P4)**: Depends on US2 for complete segment service tests; US4 backend test (T034) is independent

### Within Each User Story

- Backend entity → migration → DTOs → service → routes (sequential)
- Frontend types → service → form → display (sequential)
- Backend and frontend halves of US2 can run in parallel after T013/T014 complete
- All US4 frontend service tests (T035–T040) are fully parallel

### Parallel Opportunities

- T004 and T005 (Dockerfile upgrades): parallel
- T007 and T008 (build verification): parallel
- T028/T030/T031 (backend container) and T032 (frontend container): T032 parallel with others
- T035–T040 (frontend service tests): all parallel
- T043 and T044 (lint checks): parallel
- T045 and T046 (final test runs): parallel

---

## Parallel Example: User Story 4

```bash
# All frontend service tests can run in parallel:
Task: "Create apiClient.test.ts in frontend/src/services/__tests__/"
Task: "Create roomsService.test.ts in frontend/src/services/__tests__/"
Task: "Create segmentsService.test.ts in frontend/src/services/__tests__/"
Task: "Create surfaceDimensionApi.test.ts in frontend/src/services/__tests__/"
Task: "Create wallsService.test.ts in frontend/src/services/__tests__/"
Task: "Create windowsService.test.ts in frontend/src/services/__tests__/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup — verify baseline
2. Complete Phase 2: Foundational — Node 22 upgrade
3. Complete Phase 3: User Story 1 — test isolation
4. **STOP and VALIDATE**: Confirm dev DB is untouched after test run
5. Continue with US2, US3, US4

### Incremental Delivery

1. Setup + Foundational → Node 22 baseline ✅
2. US1 → test isolation ✅ — no more dev DB pollution
3. US2 → segment width/length ✅ — richer dimension data
4. US3 → non-root container ✅ — security-hardened image
5. US4 → 80% coverage gate ✅ — quality infrastructure locked in
6. Polish → full validation pass

---

## Notes

- `[P]` tasks affect different files and have no dependency on incomplete sibling tasks
- `[Story]` label maps each task to its user story for traceability
- Coverage gate (80% lines + branches) is already configured — new tests just need to hit the gaps
- `setTestEnv.ts` must appear in `setupFiles` (not `setupFilesAfterFramework`) so env vars land before any module is imported
- Migration timestamp: use `Date.now()` or current epoch (e.g., `1742200000000-AddSegmentWidthLength.ts`)
- Commit after each phase or logical group; tag checkpoint completions in commit messages
