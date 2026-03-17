# Quickstart: Floor and Ceiling Dimensions (002)

## Prerequisites

- Docker and Docker Compose installed
- Node.js LTS installed
- Feature branch checked out: `002-floor-ceiling-dimensions`

## Setup

```bash
# 1. Install dependencies (from repo root)
npm install

# 2. Start the full application stack
docker compose up
```

The app will be available at `http://localhost:5173`.
The API runs at `http://localhost:3000/api/v1`.
Swagger UI (dev only) at `http://localhost:3000/api/docs`.

## Run the database migration

```bash
# From the backend workspace
cd backend
npm run migration:run
```

This creates the `surface_dimension` table with the required unique constraint and
foreign key to `room`.

## Verify the feature

1. Open the app at `http://localhost:5173`
2. Create or select an existing room
3. On the room detail page, you should see:
   - **"Add floor dimensions"** call-to-action
   - **"Add ceiling dimensions"** call-to-action
4. Click "Add floor dimensions", enter a width and length, and save
5. Verify the saved values appear with the app-level unit
6. Click the edit icon, change a value, save, and verify the update
7. Click "Remove" and confirm the dimension returns to the CTA state
8. Repeat for ceiling dimensions
9. Navigate to the print summary — verify floor/ceiling dimensions appear for the room

## Running tests

```bash
# Backend unit tests
cd backend && npm test

# Backend integration tests (requires Docker test DB)
docker compose -f docker-compose.test.yml up --abort-on-container-exit

# Frontend unit + component tests
cd frontend && npm test

# Frontend coverage
cd frontend && npm run test:coverage

# Playwright E2E (requires full stack running)
npx playwright test tests/e2e/surface-dimensions.spec.ts

# Lint + format checks (from repo root)
npm run lint
npm run format:check
```

## Key files for this feature

**Backend**

| File | Purpose |
|------|---------|
| `backend/src/entities/SurfaceDimension.ts` | TypeORM entity |
| `backend/src/dto/surface-dimension/UpsertSurfaceDimensionDto.ts` | Request body DTO |
| `backend/src/dto/surface-dimension/SurfaceDimensionResponseDto.ts` | Response DTO |
| `backend/src/repositories/ISurfaceDimensionRepository.ts` | Repository interface |
| `backend/src/repositories/SurfaceDimensionRepository.ts` | TypeORM implementation |
| `backend/src/services/SurfaceDimensionService.ts` | Business logic |
| `backend/src/controllers/SurfaceDimensionController.ts` | HTTP controller |
| `backend/src/routes/surfaceDimensions.ts` | Express route registration |
| `backend/src/migrations/[timestamp]-AddSurfaceDimension.ts` | DB migration |

**Frontend**

| File | Purpose |
|------|---------|
| `frontend/src/components/dimensions/SurfaceDimensionPanel.tsx` | CTA + form + display |
| `frontend/src/services/surfaceDimensionApi.ts` | API calls (GET/PUT/DELETE) |
| `frontend/src/types/index.ts` | Updated types |

**Tests**

| File | Purpose |
|------|---------|
| `backend/src/services/__tests__/SurfaceDimensionService.test.ts` | Unit tests |
| `backend/tests/integration/surfaceDimension.test.ts` | API integration tests |
| `frontend/src/components/dimensions/__tests__/SurfaceDimensionPanel.test.tsx` | Component tests |
| `tests/e2e/surface-dimensions.spec.ts` | Playwright E2E |
