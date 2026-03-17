# API Contracts: Floor and Ceiling Dimensions (002)

Base URL prefix: `/api/v1`

All error responses conform to the project-standard error shape:
```json
{ "error": { "code": "ERROR_CODE", "message": "Human-readable message." } }
```

---

## Surface Dimension Endpoints

Both floor and ceiling surfaces share identical endpoint shapes. The surface type is
encoded in the URL path (`floor-dimensionss` / `ceiling-dimensionss`), not in the request body.

---

### GET /api/v1/rooms/:roomId/floor-dimensions

Retrieve the floor dimension (width × length) for a room.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `roomId` | integer | ID of the room |

**Success response — 200 OK**

```json
{
  "id": 1,
  "surfaceType": "floor",
  "width": 5.0,
  "length": 4.2,
  "roomId": 3,
  "createdAt": "2026-03-17T10:00:00.000Z",
  "updatedAt": "2026-03-17T10:00:00.000Z"
}
```

**Error responses**

| Code | Scenario | Error code |
|------|----------|------------|
| 404 | Room not found | `ROOM_NOT_FOUND` |
| 404 | Floor dimension not set for this room | `SURFACE_DIMENSION_NOT_FOUND` |

---

### PUT /api/v1/rooms/:roomId/floor-dimensions

Create or replace the floor dimension for a room (upsert).

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `roomId` | integer | ID of the room |

**Request body**

```json
{
  "width": 5.0,
  "length": 4.2
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `width` | number | Yes | Positive decimal (> 0) |
| `length` | number | Yes | Positive decimal (> 0) |

**Success response — 200 OK** (resource created or replaced)

```json
{
  "id": 1,
  "surfaceType": "floor",
  "width": 5.0,
  "length": 4.2,
  "roomId": 3,
  "createdAt": "2026-03-17T10:00:00.000Z",
  "updatedAt": "2026-03-17T10:05:00.000Z"
}
```

**Error responses**

| Code | Scenario | Error code |
|------|----------|------------|
| 400 | Missing `width` or `length` | `VALIDATION_ERROR` |
| 400 | `width` or `length` is zero or negative | `VALIDATION_ERROR` |
| 404 | Room not found | `ROOM_NOT_FOUND` |

---

### DELETE /api/v1/rooms/:roomId/floor-dimensions

Remove the floor dimension for a room. Returns the room to "not set" state.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `roomId` | integer | ID of the room |

**Success response — 204 No Content**

**Error responses**

| Code | Scenario | Error code |
|------|----------|------------|
| 404 | Room not found | `ROOM_NOT_FOUND` |
| 404 | Floor dimension not set (nothing to delete) | `SURFACE_DIMENSION_NOT_FOUND` |

---

### GET /api/v1/rooms/:roomId/ceiling-dimensions

Identical shape to `GET /floor-dimensions`. Returns `"surfaceType": "ceiling"`.

---

### PUT /api/v1/rooms/:roomId/ceiling-dimensions

Identical shape to `PUT /floor-dimensions`. Upserts the ceiling dimension.
Returns `"surfaceType": "ceiling"` in the response.

---

### DELETE /api/v1/rooms/:roomId/ceiling-dimensions

Identical shape to `DELETE /floor-dimensions`. Removes the ceiling dimension.

---

## Modified Endpoint: GET /api/v1/rooms/:roomId (Room Detail)

The room detail response is extended to include surface dimensions alongside existing
segment and wall data.

**Additional fields in response body**

```json
{
  "id": 3,
  "label": "Living Room",
  "floor": "Ground Floor",
  "floorDimension": {
    "id": 1,
    "surfaceType": "floor",
    "width": 5.0,
    "length": 4.2,
    "roomId": 3,
    "createdAt": "2026-03-17T10:00:00.000Z",
    "updatedAt": "2026-03-17T10:00:00.000Z"
  },
  "ceilingDimension": null,
  "segments": [...],
  "walls": [...]
}
```

`floorDimension` and `ceilingDimension` are `null` when no dimension has been set for
that surface.

---

## Modified Endpoint: GET /api/v1/rooms/summary (Print Summary)

Each room entry in the print summary is extended with the same `floorDimension` and
`ceilingDimension` fields (nullable), so the print view can display width × length
alongside segment-based outline data.

---

## Error Code Catalogue (additions)

| Error code | HTTP status | Description |
|------------|-------------|-------------|
| `SURFACE_DIMENSION_NOT_FOUND` | 404 | No surface dimension record exists for the specified room and surface type |
