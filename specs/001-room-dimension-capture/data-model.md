# Data Model: Room Dimension Capture

**Branch**: `001-room-dimension-capture` | **Date**: 2026-03-17

## Entity Overview

```
AppSettings (singleton)

Room
  ├── DimensionSegment[] (surfaceType: 'floor')
  ├── DimensionSegment[] (surfaceType: 'ceiling')
  └── Wall[]
        └── Window[]
```

Walls and DimensionSegments are independent children of Room with no enforced relationship
between them (clarification Q1).

---

## Entity: Room

**Table**: `room`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PK, AUTO_INCREMENT | |
| `label` | VARCHAR(255) | NOT NULL | Non-empty; duplicates allowed |
| `floor` | VARCHAR(100) | NOT NULL | Free-form text (e.g., "Ground Floor", "1") |
| `createdAt` | DATETIME | NOT NULL, DEFAULT NOW | Set on insert |
| `updatedAt` | DATETIME | NOT NULL, DEFAULT NOW ON UPDATE | Set on update |

**Relations**:
- `walls`: OneToMany → `Wall` (cascade insert/update/remove, DB ON DELETE CASCADE)
- `dimensionSegments`: OneToMany → `DimensionSegment` (cascade, DB ON DELETE CASCADE)

**Validation rules** (enforced via DTO):
- `label`: non-empty string
- `floor`: non-empty string

---

## Entity: DimensionSegment

**Table**: `dimension_segment`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PK, AUTO_INCREMENT | |
| `label` | VARCHAR(255) | NOT NULL | Non-empty; duplicates allowed |
| `measurement` | DECIMAL(10,4) | NOT NULL | Positive; stored to 4dp |
| `surfaceType` | ENUM('floor','ceiling') | NOT NULL | Distinguishes floor vs ceiling |
| `roomId` | INT | NOT NULL, FK → room.id | ON DELETE CASCADE |
| `createdAt` | DATETIME | NOT NULL, DEFAULT NOW | Defines display order (creation order) |

**Relations**:
- `room`: ManyToOne → `Room`

**Validation rules** (enforced via DTO):
- `label`: non-empty string
- `measurement`: positive number (> 0)
- `surfaceType`: one of `'floor'` | `'ceiling'`

**Note**: Floor and ceiling segments are stored in the same table, distinguished by
`surfaceType`. Ordered by `createdAt ASC` (creation order, clarification Q2).

---

## Entity: Wall

**Table**: `wall`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PK, AUTO_INCREMENT | |
| `label` | VARCHAR(255) | NOT NULL | Non-empty; duplicates allowed |
| `width` | DECIMAL(10,4) | NOT NULL | Positive |
| `height` | DECIMAL(10,4) | NOT NULL | Positive |
| `roomId` | INT | NOT NULL, FK → room.id | ON DELETE CASCADE |
| `createdAt` | DATETIME | NOT NULL, DEFAULT NOW | Defines display order |
| `updatedAt` | DATETIME | NOT NULL, DEFAULT NOW ON UPDATE | |

**Relations**:
- `room`: ManyToOne → `Room`
- `windows`: OneToMany → `Window` (cascade insert/update/remove, DB ON DELETE CASCADE)

**Validation rules** (enforced via DTO):
- `label`: non-empty string
- `width`: positive number (> 0)
- `height`: positive number (> 0)

---

## Entity: Window

**Table**: `window`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PK, AUTO_INCREMENT | |
| `label` | VARCHAR(255) | NOT NULL | Non-empty; duplicates allowed |
| `width` | DECIMAL(10,4) | NOT NULL | Positive |
| `height` | DECIMAL(10,4) | NOT NULL | Positive |
| `wallId` | INT | NOT NULL, FK → wall.id | ON DELETE CASCADE |
| `createdAt` | DATETIME | NOT NULL, DEFAULT NOW | Defines display order |
| `updatedAt` | DATETIME | NOT NULL, DEFAULT NOW ON UPDATE | |

**Relations**:
- `wall`: ManyToOne → `Wall`

**Validation rules** (enforced via DTO):
- `label`: non-empty string
- `width`: positive number (> 0)
- `height`: positive number (> 0)

---

## Entity: AppSettings

**Table**: `app_settings`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PK, always = 1 | Singleton row |
| `measurementUnit` | ENUM('m','cm','ft','in') | NOT NULL, DEFAULT 'm' | App-level unit |
| `updatedAt` | DATETIME | NOT NULL, DEFAULT NOW ON UPDATE | |

**Pattern**: Single row seeded by migration. Service uses upsert (insert if not exists,
update if exists) to guarantee the singleton invariant.

**Validation rules** (enforced via DTO):
- `measurementUnit`: one of `'m'` | `'cm'` | `'ft'` | `'in'`

---

## Cascade Delete Summary

| Delete action | Cascades to |
|---------------|------------|
| Delete Room | All DimensionSegments for that room, all Walls for that room, all Windows for those walls |
| Delete Wall | All Windows for that wall |
| Delete DimensionSegment | Nothing |
| Delete Window | Nothing |

---

## DTO Definitions (API boundary types)

### Room DTOs

```typescript
// CreateRoomDto
{ label: string; floor: string }

// UpdateRoomDto
{ label?: string; floor?: string }  // at least one field required

// RoomResponseDto
{ id: number; label: string; floor: string; createdAt: string; updatedAt: string }

// RoomDetailResponseDto extends RoomResponseDto
{
  floorSegments: SegmentResponseDto[];
  ceilingSegments: SegmentResponseDto[];
  walls: WallSummaryResponseDto[];
}
```

### DimensionSegment DTOs

```typescript
// CreateSegmentDto
{ label: string; measurement: number; surfaceType: 'floor' | 'ceiling' }

// UpdateSegmentDto
{ label?: string; measurement?: number }

// SegmentResponseDto
{ id: number; label: string; measurement: number; surfaceType: 'floor' | 'ceiling'; createdAt: string }
```

### Wall DTOs

```typescript
// CreateWallDto
{ label: string; width: number; height: number }

// UpdateWallDto
{ label?: string; width?: number; height?: number }

// WallSummaryResponseDto
{ id: number; label: string; width: number; height: number; createdAt: string; updatedAt: string }

// WallDetailResponseDto extends WallSummaryResponseDto
{ windows: WindowResponseDto[] }
```

### Window DTOs

```typescript
// CreateWindowDto
{ label: string; width: number; height: number }

// UpdateWindowDto
{ label?: string; width?: number; height?: number }

// WindowResponseDto
{ id: number; label: string; width: number; height: number; createdAt: string; updatedAt: string }
```

### Settings DTO

```typescript
// UpdateSettingsDto
{ measurementUnit: 'm' | 'cm' | 'ft' | 'in' }

// SettingsResponseDto
{ measurementUnit: 'm' | 'cm' | 'ft' | 'in' }
```

### Print Summary DTO

```typescript
// PrintSummaryResponseDto
{
  unit: 'm' | 'cm' | 'ft' | 'in';
  floors: {
    floor: string;
    rooms: {
      id: number;
      label: string;
      floorSegments: SegmentResponseDto[];
      ceilingSegments: SegmentResponseDto[];
      walls: WallDetailResponseDto[];
    }[];
  }[];
}
```
