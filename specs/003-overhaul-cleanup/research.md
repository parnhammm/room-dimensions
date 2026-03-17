# Research: Overhaul Release Cleanup

**Branch**: `003-overhaul-cleanup` | **Date**: 2026-03-17

## Node.js Runtime Upgrade

**Decision**: Upgrade from `node:20-alpine` to `node:22-alpine`

**Rationale**: Node 22 is the current Active LTS line (codename "Jod"), entering Active LTS in
October 2024 and supported until April 2027. Node 20 entered Maintenance LTS in October 2024
and reaches EOL in April 2026 — making it unsuitable for a new release. Node 22 is the
authoritative upgrade target.

**Alternatives considered**:
- Node 20 (Maintenance): EOL April 2026 — not viable for a forward-looking release
- Node 23 (Current, non-LTS): Released October 2024, no LTS designation; not suitable for
  production use

**Impact on dependencies**: Node 22 drops support for older OpenSSL / V8 APIs. All current
dependencies (Express 4, TypeORM 0.3, class-validator 0.14, mysql2 3, Vitest 1, React 18)
are compatible with Node 22. One required change: `@types/node` must be upgraded from
`^20.11.0` to `^22.0.0` so TypeScript type definitions match the runtime version. `ts-jest`
^29.1.2 is compatible with Node 22 — no change required there.

---

## Dockerfile Best Practices

**Decision**: Add non-root `node` user to the production stage of the backend Dockerfile.
Frontend production image uses `nginx:alpine` which runs as nginx user by default — no change
needed to the production stage. Only the production build image is in scope (dev convenience
images excluded per spec assumption).

**Rationale**: Running as root inside a container is a CIS Docker Benchmark and OWASP Container
Security Standard violation. The `node:alpine` base image ships with a built-in `node` user
(UID 1000). Adding `USER node` to the production stage is the minimal, idiomatic change.

**Non-root pattern for backend production stage**:
```dockerfile
# Stage 2: Production
FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json ./
COPY backend/package.json ./backend/
RUN npm ci --workspace=backend --omit=dev
COPY --from=builder /app/backend/dist ./backend/dist
# Hand ownership of all files to the non-root node user
RUN chown -R node:node /app
USER node
WORKDIR /app/backend
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

**Alternatives considered**:
- Creating a custom `appuser`: More steps; `node` user already present in the official image
- `--chown` on individual COPY statements: Works but `chown -R` after all COPY ops is
  equivalent and simpler given multi-workspace layout

---

## Test Isolation Strategy

**Decision**: Set test DB environment variables via Jest `setupFiles` so that `AppDataSource`
(initialized at module load time) connects to the test database, not the dev database.

**Rationale**: Routes construct repositories using the module-level `AppDataSource` singleton.
Changing `createApp()` to accept a DataSource argument would require passing it through every
route factory, touching 5+ route files. By contrast, injecting env vars before module evaluation
via a Jest `setupFiles` script is a single-file change that makes all downstream code
automatically target the test DB — consistent with the 12-factor app pattern.

**Implementation**:
1. Add `backend/tests/helpers/setTestEnv.ts` — sets `process.env.DB_PORT = '3307'`,
   `process.env.DB_DATABASE = 'room_dimensions_test'`, `process.env.DB_PASSWORD = 'testpassword'`
   before any module loads.
2. Reference it in `jest.config.js` as `setupFiles: ['<rootDir>/tests/helpers/setTestEnv.ts']`.
3. Remove `AppDataSource.initialize()` call from `dbSetup.ts` — tests will use `testDataSource`
   for direct DB setup/teardown, while `AppDataSource` (now also pointing to the test DB via
   env vars) serves HTTP requests from `createApp()`.
4. The `docker-compose.test.yml` already maps port 3307 → container port 3306 for the test DB.

**Cleanup at beginning of run**: `setupTestDb()` already calls `truncateAll()` before each
suite, satisfying FR-002 (clean state at start). Mid-run failures leave data in the test DB
only; subsequent run start cleans it. FR-004 (dev DB untouched) is satisfied because
`AppDataSource` now connects to the test DB.

**Alternatives considered**:
- DataSource injection via `createApp(ds)`: Correct but invasive — touches all 5 route files
  and all integration tests
- Separate test app entry point: Duplicates app wiring, harder to keep in sync
- Per-test transaction rollback: Requires wrapping every test in a transaction; complex with
  supertest HTTP layer

---

## Segment Width and Length

**Decision**: Add two optional nullable `decimal(10,4)` columns — `width` and `length` — to
the `dimension_segment` table via a new TypeORM migration. Both frontend and backend DTOs and
response contracts must be updated. No data migration required for existing rows (nullable
columns default to NULL).

**Rationale**: Matches the established pattern from `SurfaceDimension` (spec 002) which uses
`decimal(10,4)` for its `width` and `length` columns. Keeping the same precision and type
ensures consistency across the data model.

**Validation rules**:
- Both fields are independently optional (FR-007)
- When provided, each must be > 0; zero and negative rejected (FR-008)
- Existing segments with NULL width/length continue to work unchanged (FR-011)

---

## Test Coverage Gaps

**Decision**: Add missing unit tests to reach the existing 80% threshold already configured in
`jest.config.js` and `vite.config.ts`.

**Current coverage gaps identified**:

Backend:
- `SettingsService` — no unit test exists; covers `getSettings` and `updateSettings` paths

Frontend (all in `src/services/`):
- `apiClient.ts` — base Axios instance; test error interceptor and base URL
- `roomsService.ts` — CRUD wrappers; test each method + error propagation
- `segmentsService.ts` — segment CRUD; test each method + error propagation
- `surfaceDimensionApi.ts` — floor/ceiling dimension calls; test each method
- `wallsService.ts` — wall CRUD
- `windowsService.ts` — window CRUD

**Approach**: Unit tests using `vi.mock` (Vitest) for frontend and `jest.mock` for backend.
Service client tests mock `apiClient` at the module level to verify correct HTTP verbs, URLs,
and request bodies without hitting a real server.

**Coverage gate**: Already configured (`coverageThreshold` / `thresholds`). After adding the
missing tests, the gate will enforce the threshold automatically on every run.
