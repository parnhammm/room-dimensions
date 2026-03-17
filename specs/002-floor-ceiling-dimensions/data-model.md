# Data Model: Floor and Ceiling Dimensions (002)

## New Entity: SurfaceDimension

**TypeORM entity** — represents the simple rectangular (width × length) footprint of one
surface (floor or ceiling) within a room. At most one record per surface per room.

### Fields

| Field | DB Column | Type | Nullable | Constraints |
|-------|-----------|------|----------|-------------|
| `id` | `id` | int | No | Primary key, auto-increment |
| `surfaceType` | `surface_type` | enum ('floor', 'ceiling') | No | Part of unique constraint |
| `width` | `width` | decimal(10,4) | No | > 0 |
| `length` | `length` | decimal(10,4) | No | > 0 |
| `roomId` | `room_id` | int (FK) | No | FK → room.id, CASCADE DELETE |
| `createdAt` | `created_at` | datetime | No | Auto-set on insert |
| `updatedAt` | `updated_at` | datetime | No | Auto-set on insert and update |

**Unique constraint**: `(room_id, surface_type)` — at most one floor record and one ceiling
record per room.

### Relationships

```
Room (1) ────────── (0..2) SurfaceDimension
                           surfaceType: 'floor' | 'ceiling'
```

- A Room may have zero, one, or two SurfaceDimension records (at most one per surface type).
- Deleting a Room cascades to delete its SurfaceDimension records.
- SurfaceDimension is independent of DimensionSegment — the two models coexist on the same
  room without any enforced relationship.

### Validation rules

- `width` MUST be a positive decimal (> 0). Zero and negative values are rejected.
- `length` MUST be a positive decimal (> 0). Zero and negative values are rejected.
- Both `width` and `length` MUST be provided together. A partial submission (one field only)
  is rejected with a 400 Bad Request.
- `surfaceType` MUST be one of the two allowed enum values; all other values are rejected.

---

## New DTOs

### UpsertSurfaceDimensionDto

Used as the request body for `PUT /api/v1/rooms/:roomId/floor-dimension` and
`PUT /api/v1/rooms/:roomId/ceiling-dimension`.

| Field | Type | Validation |
|-------|------|------------|
| `width` | number | Required, `@IsNumber`, `@IsPositive` |
| `length` | number | Required, `@IsNumber`, `@IsPositive` |

### SurfaceDimensionResponseDto

Returned by GET, PUT endpoints.

| Field | Type |
|-------|------|
| `id` | number |
| `surfaceType` | `'floor' \| 'ceiling'` |
| `width` | number |
| `length` | number |
| `roomId` | number |
| `createdAt` | string (ISO 8601) |
| `updatedAt` | string (ISO 8601) |

---

## Modified DTOs

### RoomDetailResponseDto (updated)

The existing room detail response (returned by `GET /api/v1/rooms/:roomId`) should be
extended to include the surface dimensions alongside existing segment data:

| New field | Type |
|-----------|------|
| `floorDimension` | `SurfaceDimensionResponseDto \| null` |
| `ceilingDimension` | `SurfaceDimensionResponseDto \| null` |

### PrintFloorRoom / PrintSummaryResponseDto (updated)

Each room entry in the print summary response gains:

| New field | Type |
|-----------|------|
| `floorDimension` | `SurfaceDimensionResponseDto \| null` |
| `ceilingDimension` | `SurfaceDimensionResponseDto \| null` |

---

## Database Migration

**Migration name**: `AddSurfaceDimension`

Actions:
1. Create table `surface_dimension` with all fields described above.
2. Add UNIQUE constraint on `(room_id, surface_type)`.
3. Add foreign key `room_id → room(id)` with `ON DELETE CASCADE`.

No existing table alterations required — this is a purely additive change.

---

## Frontend Types (additions to `src/types/index.ts`)

```typescript
export interface SurfaceDimensionResponse {
  id: number;
  surfaceType: 'floor' | 'ceiling';
  width: number;
  length: number;
  roomId: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSurfaceDimensionRequest {
  width: number;
  length: number;
}
```

**Updates to existing types:**

```typescript
// RoomDetailResponse — add:
floorDimension: SurfaceDimensionResponse | null;
ceilingDimension: SurfaceDimensionResponse | null;

// PrintFloorRoom — add:
floorDimension: SurfaceDimensionResponse | null;
ceilingDimension: SurfaceDimensionResponse | null;
```

---

## State Transitions

```
[Not Set]
    │
    │ PUT (width + length provided)
    ▼
[Set] ──── PUT (new values) ────► [Set] (updated)
    │
    │ DELETE
    ▼
[Not Set]
```

- The "Not Set" state is represented by the absence of a SurfaceDimension record (NULL /
  404 from the API).
- Transition from [Not Set] to [Set] is an upsert (PUT creates the record).
- Transition from [Set] to [Set] is an upsert (PUT replaces the record).
- Transition from [Set] to [Not Set] requires an explicit DELETE action (FR-011).
