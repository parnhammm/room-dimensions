# Quickstart: Room Dimension Capture

**Branch**: `001-room-dimension-capture` | **Date**: 2026-03-17

## Prerequisites

- Docker and Docker Compose installed
- Node.js LTS (for local development outside Docker)
- `cp .env.example .env` — fill in any required values

## Start the Full Stack

```bash
docker compose up
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Swagger UI | http://localhost:4000/api/docs |
| MySQL | localhost:3306 |

## Environment Variables

Copy `.env.example` to `.env`. Required variables:

```
# Database
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=roomdims
DB_PASSWORD=<your-password>
DB_DATABASE=room_dimensions

# API
API_PORT=4000
LOG_LEVEL=info
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:4000
```

## Run Migrations

Migrations run automatically on backend startup via TypeORM. To run manually:

```bash
cd backend && npm run migration:run
```

To generate a new migration after entity changes:

```bash
cd backend && npm run migration:generate -- src/migrations/MigrationName
```

## Run Tests

```bash
# Tier 1 — Unit tests (no Docker required)
cd frontend && npm run test:unit
cd backend && npm run test:unit

# Tier 2 — Integration tests (requires Docker test database)
docker compose -f docker-compose.test.yml up -d
cd backend && npm run test:integration
docker compose -f docker-compose.test.yml down

# Tier 3 — Playwright E2E (requires full stack)
docker compose up -d
npm run test:e2e
docker compose down
```

## Lint & Format

```bash
# Both frontend and backend
npm run lint        # ESLint (must pass with zero errors)
npm run format      # Prettier (formats in-place)
npm run format:check  # CI check — exits non-zero if formatting differs
```

## Manual Validation Checklist (run after each feature)

1. Open http://localhost:3000
2. Create a room, assign it to a floor → verify it appears in the room list
3. Add 6 dimension segments to the floor surface → verify all are listed
4. Add segments to the ceiling surface → verify they are independent from floor segments
5. Add 2 walls to the room → verify both appear with correct width and height
6. Add a window to one wall → verify it appears when viewing that wall only
7. Navigate to Settings → change unit to `ft` → verify all measurements display `ft`
8. Navigate to Print Summary → verify all rooms, segments, walls, and windows are listed
9. Use browser print (Ctrl+P) → verify no navigation or edit controls appear in preview
10. Edit and delete a room → verify cascade removal of all associated data
