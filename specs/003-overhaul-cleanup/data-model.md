# Data Model: Overhaul Release Cleanup

**Branch**: `003-overhaul-cleanup` | **Date**: 2026-03-17

## Changed Entities

### DimensionSegment (modified)

Represents a single labeled measurement for a room surface (floor or ceiling).
Two new optional columns are added; all existing columns are unchanged.

| Field         | Type              | Nullable | Validation                        | Notes                             |
|---------------|-------------------|----------|-----------------------------------|-----------------------------------|
| `id`          | int (PK, auto)    | No       | —                                 | Unchanged                         |
| `label`       | varchar(255)      | No       | Required, non-empty               | Unchanged                         |
| `measurement` | decimal(10,4)     | No       | Required, > 0                     | Unchanged                         |
| `surfaceType` | enum(floor,ceil.) | No       | Required                          | Unchanged                         |
| `roomId`      | int (FK → Room)   | No       | Required                          | Unchanged                         |
| `createdAt`   | datetime          | No       | Auto                              | Unchanged                         |
| `width`       | decimal(10,4)     | **Yes**  | When present: must be > 0         | **New** — optional horizontal dim |
| `length`      | decimal(10,4)     | **Yes**  | When present: must be > 0         | **New** — optional horizontal dim |

**Terminology note**: Both new fields are horizontal dimensions (floor/ceiling surface).
"Height" is reserved for vertical measurements (wall height). This is consistent with
`SurfaceDimension` (spec 002) which uses `width` and `length` for the same surface types.

**Backward compatibility**: Existing rows will have `NULL` for `width` and `length`.
No data migration is required. The columns are purely additive.

**TypeORM column decorators**:
```typescript
@Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, default: null })
width!: number | null;

@Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, default: null })
length!: number | null;
```

## Migration

**File**: `backend/src/migrations/<timestamp>-AddSegmentWidthLength.ts`

```sql
ALTER TABLE dimension_segment
  ADD COLUMN width  DECIMAL(10,4) NULL DEFAULT NULL,
  ADD COLUMN length DECIMAL(10,4) NULL DEFAULT NULL;
```

The migration is non-destructive: no existing column is modified or removed.

## No Other Entity Changes

All other entities (`Room`, `Wall`, `Window`, `SurfaceDimension`, `AppSettings`) are unchanged
by this feature. The Node upgrade and test isolation work requires no schema changes.

## DTO Changes

### Backend

**`CreateSegmentDto`** — add two optional fields:
```typescript
@IsOptional()
@IsNumber()
@Min(0.0001, { message: 'width must be a positive number' })
width?: number;

@IsOptional()
@IsNumber()
@Min(0.0001, { message: 'length must be a positive number' })
length?: number;
```

**`UpdateSegmentDto`** — same two optional fields (identical validation).

**`SegmentResponseDto`** — add two optional fields:
```typescript
width: number | null;
length: number | null;
```

### Frontend

**`Segment` type** (in `frontend/src/types/`):
```typescript
width?: number | null;
length?: number | null;
```

**`CreateSegmentRequest` / `UpdateSegmentRequest`** types:
```typescript
width?: number;
length?: number;
```
