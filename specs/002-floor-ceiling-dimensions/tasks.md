# Tasks: Floor and Ceiling Dimensions

**Input**: Design documents from `/specs/002-floor-ceiling-dimensions/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/api.md ✅

**Organization**: Tasks grouped by user story (US1 = Floor Dimensions P1, US2 = Ceiling
Dimensions P2) so each story can be implemented, tested, and demoed independently.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1 or US2)

---

## Phase 1: Setup

**Purpose**: Manually author the migration file using the fully-specified schema in `data-model.md`. This can be done before the entity is created because the schema is known from the design documents — do NOT use `migration:generate` (which requires the entity to exist first).

- [X] T001 Manually author TypeORM migration `AddSurfaceDimension` in `backend/src/migrations/[timestamp]-AddSurfaceDimension.ts` — creates `surface_dimension` table with `id`, `surface_type` (enum: floor/ceiling), `width` (decimal 10,4), `length` (decimal 10,4), `room_id` (FK → room.id CASCADE DELETE), `created_at`, `updated_at`, and UNIQUE constraint on `(room_id, surface_type)`; follow existing migration file patterns in `backend/src/migrations/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared domain infrastructure that MUST be complete before any user story begins.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

- [X] T002 Create `SurfaceDimension` TypeORM entity in `backend/src/entities/SurfaceDimension.ts` — fields: `id`, `surfaceType` (enum: 'floor'|'ceiling'), `width` (decimal), `length` (decimal), `roomId` (FK), `createdAt`, `updatedAt`; `@Unique(['roomId', 'surfaceType'])` decorator
- [X] T003 [P] Create `UpsertSurfaceDimensionDto` in `backend/src/dto/surface-dimension/UpsertSurfaceDimensionDto.ts` — `width: number` and `length: number`, both decorated with `@IsNumber()` and `@IsPositive()`
- [X] T004 [P] Create `SurfaceDimensionResponseDto` in `backend/src/dto/surface-dimension/SurfaceDimensionResponseDto.ts` — fields: `id`, `surfaceType`, `width`, `length`, `roomId`, `createdAt`, `updatedAt`
- [X] T005 Create `ISurfaceDimensionRepository` interface in `backend/src/repositories/ISurfaceDimensionRepository.ts` — methods: `findByRoomAndSurface(roomId, surfaceType)`, `upsert(roomId, surfaceType, dto)`, `delete(roomId, surfaceType)`
- [X] T006 Create `SurfaceDimensionRepository` in `backend/src/repositories/SurfaceDimensionRepository.ts` — TypeORM implementation of `ISurfaceDimensionRepository`; upsert uses find-then-update-or-create pattern with the unique constraint
- [X] T007 Update `Room` entity in `backend/src/entities/Room.ts` — add `@OneToMany(() => SurfaceDimension, ...)` relation with `cascade: ['remove']`
- [X] T008 Run migration (`npm run migration:run` in `backend/`) and verify `surface_dimension` table created in the Docker MySQL instance (depends on T001)
- [X] T009 [P] Add `SurfaceDimensionResponse` and `UpsertSurfaceDimensionRequest` TypeScript interfaces to `frontend/src/types/index.ts`; extend `RoomDetailResponse` with `floorDimension: SurfaceDimensionResponse | null` and `ceilingDimension: SurfaceDimensionResponse | null`

**Checkpoint**: Entity, DTOs, repository, migration, and frontend types in place. User story work can begin.

---

## Phase 3: User Story 1 — Add Floor Dimensions (Priority: P1) 🎯 MVP

**Goal**: Users can add, view, edit, and remove a width × length floor dimension on any room
via three REST endpoints and a dedicated panel on the room detail page.

**Independent Test**: Create a room, open its detail page, click "Add floor dimensions", enter
width 5.0 and length 4.2, save — verify both values appear with the unit label. Edit width to
5.5, save — verify update. Click "Remove" — verify the CTA reappears and no dimension is shown.
Confirm ceiling panel is unaffected throughout.

### Tests for User Story 1

> Write these tests FIRST — confirm they FAIL before implementing the service and controller.

- [X] T010 [P] [US1] Write unit tests for `SurfaceDimensionService` in `backend/src/services/__tests__/SurfaceDimensionService.test.ts` — cover: get returns dimension when present, get throws `SURFACE_DIMENSION_NOT_FOUND` when absent, upsert creates new record, upsert updates existing record, delete removes record, delete throws when not present, room-not-found cases; mock `ISurfaceDimensionRepository` and `IRoomRepository`
- [X] T011 [P] [US1] Write integration tests for floor endpoints in `backend/tests/integration/surfaceDimension.test.ts` — cover: `GET /api/v1/rooms/:roomId/floor-dimensions` returns 200 or 404; `PUT` returns 200 on create and on update; `PUT` returns 400 on missing field, zero, or negative value; `DELETE` returns 204; `DELETE` returns 404 when not set; `DELETE /rooms/:roomId` cascades to remove floor dimension

### Implementation for User Story 1

- [X] T012 [US1] Implement `SurfaceDimensionService` in `backend/src/services/SurfaceDimensionService.ts` — inject `ISurfaceDimensionRepository`; methods: `getForRoom(roomId, surfaceType)`, `upsert(roomId, surfaceType, dto)`, `delete(roomId, surfaceType)`; throw typed errors for room-not-found and dimension-not-found cases (depends on T010 tests failing first)
- [X] T013 [US1] Implement `SurfaceDimensionController` floor handlers in `backend/src/controllers/SurfaceDimensionController.ts` — `getFloor`, `upsertFloor`, `deleteFloor`; inject `SurfaceDimensionService`; Swagger `@ApiOperation` annotations on each handler; use standard error catalogue codes (`SURFACE_DIMENSION_NOT_FOUND`, `ROOM_NOT_FOUND`, `VALIDATION_ERROR`)
- [X] T014 [US1] Create `surfaceDimensions` route module in `backend/src/routes/surfaceDimensions.ts` — register `GET /floor-dimensions`, `PUT /floor-dimensions`, `DELETE /floor-dimensions` with `validateDto` middleware on PUT
- [X] T015 [US1] Mount `surfaceDimensions` router on the rooms router in `backend/src/routes/rooms.ts` — nested under `/:roomId` so paths resolve to `/api/v1/rooms/:roomId/floor-dimension`
- [X] T016 [US1] Update `RoomService.getById` in `backend/src/services/RoomService.ts` to eager-load the room's `floorDimension` (SurfaceDimension where surfaceType = 'floor') and populate `floorDimension` on the response
- [X] T017 [US1] Update `RoomDetailResponseDto` in `backend/src/dto/room/RoomDetailResponseDto.ts` — add `floorDimension: SurfaceDimensionResponseDto | null`
- [X] T018 [P] [US1] Implement `surfaceDimensionApi.ts` in `frontend/src/services/surfaceDimensionApi.ts` — functions: `getFloorDimension(roomId)`, `upsertFloorDimension(roomId, data)`, `deleteFloorDimension(roomId)`; each wraps `fetch` with error handling returning typed `SurfaceDimensionResponse`
- [X] T019 [US1] Implement `SurfaceDimensionPanel` component in `frontend/src/components/dimensions/SurfaceDimensionPanel.tsx` — accepts `roomId: number`, `surfaceType: 'floor' | 'ceiling'`, `initialDimension: SurfaceDimensionResponse | null`; renders: (a) CTA button when no dimension set, (b) width + length form when adding/editing, (c) display view with edit and remove buttons when set; uses `UnsavedChangesPrompt` on navigation away; all form states use Tailwind CSS; ARIA labels on inputs; loading and error feedback on async operations
- [X] T020 [P] [US1] Write RTL component tests for `SurfaceDimensionPanel` in `frontend/src/components/dimensions/__tests__/SurfaceDimensionPanel.test.tsx` — cover: CTA renders when no dimension; form appears on CTA click; submit calls upsert API; validation error shown for zero/negative input; display mode shows width and length with unit; remove button calls delete API and returns to CTA; unsaved changes prompt fires on navigation away; **clearing width/length fields and clicking save does NOT remove the dimension — only the explicit Remove button triggers deletion** (FR-011)
- [X] T021 [US1] Add floor `SurfaceDimensionPanel` to `RoomDetailPage` in `frontend/src/pages/RoomDetailPage.tsx` — pass `surfaceType="floor"` and `initialDimension={room.floorDimension}`; position within the room detail layout alongside existing segment and wall sections

**Checkpoint**: Floor dimension add/edit/remove is fully functional end-to-end. US1 independently testable.

---

## Phase 4: User Story 2 — Add Ceiling Dimensions (Priority: P2)

**Goal**: Users can independently add, view, edit, and remove a width × length ceiling
dimension on any room. Ceiling and floor dimensions are always independent. Ceiling
dimensions also appear in the print summary.

**Independent Test**: Open a room with no dimensions set. Leave floor panel untouched. Click
"Add ceiling dimensions", enter width 4.8 and length 3.0, save — verify ceiling values appear
with unit. Edit ceiling width to 5.0, verify update. Click ceiling "Remove" — verify CTA
reappears. Verify floor panel is unaffected throughout. Navigate to print summary — verify
ceiling dimension appears for the room.

### Tests for User Story 2

> Confirm integration tests for ceiling endpoints FAIL before adding ceiling controller handlers.

- [X] T022 [P] [US2] Add ceiling integration tests to `backend/tests/integration/surfaceDimension.test.ts` — cover: `GET /ceiling-dimensions` returns 200 or 404; `PUT /ceiling-dimensions` returns 200 on create and update, 400 on invalid input; `DELETE /ceiling-dimensions` returns 204 or 404; floor endpoints unaffected when ceiling is modified

### Implementation for User Story 2

- [X] T023 [US2] Add ceiling handlers to `SurfaceDimensionController` in `backend/src/controllers/SurfaceDimensionController.ts` — `getCeiling`, `upsertCeiling`, `deleteCeiling`; follow the same pattern as floor handlers; add Swagger annotations
- [X] T024 [US2] Register ceiling routes in `backend/src/routes/surfaceDimensions.ts` — `GET /ceiling-dimensions`, `PUT /ceiling-dimensions`, `DELETE /ceiling-dimensions`
- [X] T025 [US2] Update `RoomService.getById` in `backend/src/services/RoomService.ts` to also eager-load `ceilingDimension` and populate it on the room detail response
- [X] T026 [US2] Update `RoomDetailResponseDto` in `backend/src/dto/room/RoomDetailResponseDto.ts` — add `ceilingDimension: SurfaceDimensionResponseDto | null`
- [X] T027 [P] [US2] Add ceiling API functions to `frontend/src/services/surfaceDimensionApi.ts` — `getCeilingDimension(roomId)`, `upsertCeilingDimension(roomId, data)`, `deleteCeilingDimension(roomId)`
- [X] T028 [US2] Add ceiling `SurfaceDimensionPanel` to `RoomDetailPage` in `frontend/src/pages/RoomDetailPage.tsx` — `surfaceType="ceiling"`, `initialDimension={room.ceilingDimension}`
- [X] T029 [US2] Update `PrintSummaryResponseDto` / `PrintFloorRoom` DTO in `backend/src/dto/print/PrintSummaryResponseDto.ts` — add `floorDimension: SurfaceDimensionResponseDto | null` and `ceilingDimension: SurfaceDimensionResponseDto | null` to each room entry
- [X] T030 [US2] Update print summary query in `backend/src/services/RoomService.ts` to join and include `SurfaceDimension` records for each room in the summary response
- [X] T031 [US2] Update `PrintSummary` component in `frontend/src/components/print/PrintSummary.tsx` — render `floorDimension` and `ceilingDimension` (width × length + unit) for each room when present; no edit controls in print view

**Checkpoint**: Both floor and ceiling dimension CRUD work independently. Print summary includes both. US1 and US2 both independently testable and demonstrable.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: E2E validation, API documentation, and security checks.

- [X] T032 [P] Write Playwright E2E test in `tests/e2e/surface-dimensions.spec.ts` — one complete user journey: create a room; add floor dimensions (width + length), verify display; edit floor width, verify update; remove floor dimensions, verify CTA returns; add ceiling dimensions, verify display independent of floor; navigate to print summary, verify both dimensions shown; verify that invalid inputs (zero, negative, one field only) are rejected with visible error messages; **assert that the PUT `/floor-dimensions` response time is ≤ 2000ms using Playwright's `page.waitForResponse` timing to validate SC-002**
- [X] T033 Review Swagger annotations on all 6 endpoints in `backend/src/controllers/SurfaceDimensionController.ts` — verify request body, path parameters, all response shapes (200, 204, 400, 404), and error codes are fully documented; confirm Swagger UI at `/api/docs` renders all 6 operations correctly
- [X] T034 Run `npm audit` from repository root — resolve any high or critical findings before marking tasks complete
- [X] T035 Validate against `specs/002-floor-ceiling-dimensions/quickstart.md` — start the full stack with `docker compose up`, run migration, and manually exercise the complete floor and ceiling dimension CRUD flow to confirm quickstart instructions are accurate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user story work
- **Phase 3 (US1)**: Depends on Phase 2 — write tests first (T010, T011), then implement
- **Phase 4 (US2)**: Depends on Phase 2 — can start in parallel with Phase 3 after Foundational is done, or sequentially after Phase 3
- **Phase 5 (Polish)**: Depends on Phase 3 and Phase 4 being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependency on US2
- **US2 (P2)**: Can start after Foundational — no dependency on US1 (same entity, different surfaceType)

### Within Each User Story

1. Tests written first (T010/T011 for US1, T022 for US2) — confirmed failing
2. Service before controller (T012 before T013)
3. Controller before routes (T013 before T014)
4. Routes before mounting (T014 before T015)
5. Backend complete before frontend integration (T015-T017 before T021/T028)
6. Frontend API service before component (T018 before T019)
7. Component before page integration (T019 before T021)

### Parallel Opportunities

Within Phase 2: T003 ‖ T004 ‖ T009 can run in parallel (different files)

Within Phase 3:
- T010 ‖ T011 (different test files, write simultaneously)
- T018 ‖ T020 (API service and component tests are independent)

Within Phase 4:
- T022 ‖ T027 (integration tests and frontend API additions are independent)

---

## Parallel Example: User Story 1

```text
# Step 1 — Write tests in parallel (both fail initially):
T010: SurfaceDimensionService unit tests
T011: Floor endpoint integration tests

# Step 2 — Implement service (unblocks controller):
T012: SurfaceDimensionService

# Step 3 — Controller + frontend API in parallel (different layers):
T013: SurfaceDimensionController (floor handlers)
T018: surfaceDimensionApi.ts (floor functions)

# Step 4 — Routes + component in parallel:
T014: surfaceDimensions routes (floor)
T019: SurfaceDimensionPanel component
T020: SurfaceDimensionPanel RTL tests

# Step 5 — Wire up:
T015: Mount router on rooms
T021: Add floor panel to RoomDetailPage
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T009)
3. Complete Phase 3: User Story 1 (T010–T021)
4. **STOP and VALIDATE**: GET/PUT/DELETE floor-dimension endpoints work; floor panel in UI is functional; unit and integration tests pass
5. Demo floor dimension CRUD to stakeholder

### Incremental Delivery

1. Setup + Foundational → domain infrastructure ready
2. User Story 1 → floor dimension CRUD live (MVP)
3. User Story 2 → ceiling dimension CRUD + print summary live
4. Polish → Playwright E2E, Swagger, audit clean

### Parallel Team Strategy

After Foundational (Phase 2):
- **Developer A**: US1 backend (T010–T017)
- **Developer B**: US1 frontend (T018–T021) — unblocked once T009 types are done
- After US1: both pivot to US2 and Polish in parallel

---

## Notes

- `[P]` tasks target different files with no shared incomplete dependencies — safe to parallelise
- Tests (T010, T011, T022) MUST be written and confirmed failing before the implementation tasks they cover
- `SurfaceDimensionPanel` is intentionally surface-type agnostic — one component, parameterised by `surfaceType` prop
- The `surfaceType` enum values ('floor', 'ceiling') MUST be extracted as named constants — no magic strings
- Commit after each completed task or logical group; follow `feature: <imperative description>` commit convention
- Stop at Phase 3 checkpoint to validate US1 independently before beginning US2
