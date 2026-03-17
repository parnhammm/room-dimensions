# Research: Room Dimension Capture

**Branch**: `001-room-dimension-capture` | **Date**: 2026-03-17

## TypeORM + MySQL — Cascade Deletes

**Decision**: Define cascade deletes on TypeORM `@OneToMany` relations using
`{ cascade: true, onDelete: 'CASCADE' }`.

**Rationale**: FR-003 and FR-012 require that deleting a Room removes all its walls,
segments, and windows, and that deleting a Wall removes all its windows. TypeORM cascade
configuration handles this at the ORM level; the database FK constraint provides a safety
net. Avoids manual service-layer cleanup loops.

**How applied**:
- `Room.walls` → cascade: `['insert', 'update', 'remove']`, DB-level `ON DELETE CASCADE`
- `Room.floorSegments` / `Room.ceilingSegments` → same
- `Wall.windows` → same

---

## Express + TypeScript Structure

**Decision**: Thin controllers, fat services, repository interface abstraction.

**Rationale**: Aligns with SOLID Principle I (SRP) and Principle V (DIP from constitution).
Controllers only extract validated DTOs from requests and delegate to services. Services
contain all business logic and depend on repository interfaces (not concrete TypeORM
classes), making them unit-testable with mocked repositories without spinning up a database.

**Pattern**:
```
Request → Middleware (validate DTO) → Controller → Service → Repository → TypeORM → MySQL
```

---

## Swagger Library

**Decision**: `swagger-jsdoc` + `swagger-ui-express`.

**Rationale**: Resolves `TODO(SWAGGER_TOOL)` from constitution. This combination integrates
with existing Express routes via JSDoc annotations — no code generation or separate spec
maintenance required. `tsoa` was considered but introduces a more opinionated code
generation step that adds complexity for this scale.

**Setup**: OpenAPI spec generated at startup, served at `/api/docs`. Spec file also written
to `backend/src/openapi.json` and committed.

---

## Structured Logging Library

**Decision**: `pino` with `pino-http`.

**Rationale**: Resolves `TODO(OBSERVABILITY_TOOL)` from constitution. `pino` is the fastest
JSON logger for Node.js, outputs structured logs by default, and `pino-http` auto-generates
per-request log entries including `requestId`, `method`, `path`, `statusCode`, and
`responseTime`. `winston` was considered but is slower and requires more configuration to
achieve the same structured output.

**Request ID**: `pino-http` generates a `req.id` UUID per request. This is passed to the
`X-Request-Id` response header and included in all log entries for that request.

---

## DTO Validation

**Decision**: `class-validator` + `class-transformer` with an Express validation middleware.

**Rationale**: Standard in the TypeORM/NestJS ecosystem; works cleanly with plain Express.
Validation middleware transforms the raw request body into a DTO class instance and runs
validators before the controller is called. Invalid requests are rejected at the boundary
with a `400 Bad Request` response — service layer never receives invalid data.

**Positive number rule**: `@IsPositive()` from class-validator handles FR-019 (reject zero
or negative measurements).

---

## React Frontend Tooling

**Decision**: Vite (latest) as the build tool for the React frontend.

**Rationale**: Vite is the current standard for new React + TypeScript projects. It provides
significantly faster HMR than Create React App, native TypeScript support, and a clean
development server configuration. CRA is deprecated and no longer maintained.

---

## Routing (Frontend)

**Decision**: React Router v6 with nested routes.

**Rationale**: Natural fit for the hierarchical data model: House → Rooms → Walls → Windows.
Nested routes keep each level's UI context visible and enable the "3 interactions to reach
wall detail" requirement (SC-003).

**Route structure**:
```
/                         → Room list
/rooms/new                → Create room
/rooms/:roomId            → Room detail (floor/ceiling dimensions + walls list)
/rooms/:roomId/edit       → Edit room
/rooms/:roomId/walls/new  → Add wall
/rooms/:roomId/walls/:wallId        → Wall detail (windows list)
/rooms/:roomId/walls/:wallId/edit   → Edit wall
/settings                 → Unit of measurement
/print                    → Print summary
```

---

## Unsaved Changes Prompt (FR-021)

**Decision**: Custom `useUnsavedChanges` React hook + browser `beforeunload` event.

**Rationale**: React Router v6 provides no built-in navigation blocker in the stable API.
The hook tracks a `isDirty` boolean, prompts via a shared `UnsavedChangesPrompt` modal
component on in-app navigation attempts, and registers `window.beforeunload` for
browser-level navigation (tab close, refresh).

---

## Print Summary (US5 / FR-025–028)

**Decision**: Dedicated `/print` route with `@media print` CSS via Tailwind print variants.

**Rationale**: Browser-native print (Ctrl+P or `window.print()`) produces PDF output
without a server-side PDF library dependency. Tailwind's `print:hidden` and `print:block`
utilities toggle UI chrome visibility for print. The API provides a dedicated
`GET /api/v1/rooms/summary` endpoint that returns all rooms grouped by floor in a single
request, avoiding N+1 fetches on the print page.

---

## AppSettings Singleton

**Decision**: `AppSettings` table with a single row (id = 1), upserted on first access.

**Rationale**: The unit of measurement is a single global value. A dedicated settings table
is preferable to an environment variable because it must be user-editable at runtime. The
singleton pattern (seeded by a migration) keeps it simple without introducing a
key/value store.
