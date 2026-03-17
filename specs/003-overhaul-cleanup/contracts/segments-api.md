# Contract: Segments API (updated for spec 003)

**Branch**: `003-overhaul-cleanup` | **Date**: 2026-03-17

This contract documents the changes to the segments API endpoints. All existing endpoints
are unchanged except for the addition of the optional `width` and `length` fields to request
and response bodies.

---

## POST /api/v1/rooms/:roomId/segments

Creates a new dimension segment for a room surface.

**Request body** (JSON):

| Field         | Type     | Required | Validation                            |
|---------------|----------|----------|---------------------------------------|
| `label`       | string   | Yes      | Non-empty                             |
| `measurement` | number   | Yes      | Positive (> 0)                        |
| `surfaceType` | string   | Yes      | `"floor"` or `"ceiling"`             |
| `width`       | number   | No       | Positive (> 0) when present           |
| `length`      | number   | No       | Positive (> 0) when present           |

**Success response** (201 Created):

```json
{
  "id": 42,
  "label": "Main area",
  "measurement": 12.5,
  "surfaceType": "floor",
  "width": 3.0,
  "length": 2.5,
  "createdAt": "2026-03-17T10:00:00.000Z"
}
```

`width` and `length` are `null` when not provided.

**Error responses**:
- `400 Bad Request` — missing required field, or `width`/`length` ≤ 0
- `404 Not Found` — roomId does not exist

---

## GET /api/v1/rooms/:roomId/segments

Returns all dimension segments for a room.

**Success response** (200 OK):

```json
[
  {
    "id": 42,
    "label": "Main area",
    "measurement": 12.5,
    "surfaceType": "floor",
    "width": 3.0,
    "length": 2.5,
    "createdAt": "2026-03-17T10:00:00.000Z"
  },
  {
    "id": 43,
    "label": "Bay",
    "measurement": 2.1,
    "surfaceType": "floor",
    "width": null,
    "length": null,
    "createdAt": "2026-03-17T10:01:00.000Z"
  }
]
```

Segments without `width`/`length` return `null` for those fields (not omitted).

---

## PATCH /api/v1/rooms/:roomId/segments/:segmentId

Partial update of a dimension segment.

**Request body** (JSON — all fields optional):

| Field         | Type     | Required | Validation                            |
|---------------|----------|----------|---------------------------------------|
| `label`       | string   | No       | Non-empty when present                |
| `measurement` | number   | No       | Positive (> 0) when present           |
| `width`       | number   | No       | Positive (> 0) when present           |
| `length`      | number   | No       | Positive (> 0) when present           |

**Success response** (200 OK): Updated segment object (same shape as POST response).

**Error responses**:
- `400 Bad Request` — provided `width`/`length` ≤ 0
- `404 Not Found` — segment or room not found

---

## DELETE /api/v1/rooms/:roomId/segments/:segmentId

Deletes a segment. No changes to this contract.

**Success response**: `204 No Content`

---

## Print Summary — Segment representation

The print summary endpoint (`GET /api/v1/rooms/print-summary`) includes segments per surface.
Each segment object now includes `width` and `length`:

```json
{
  "unit": "m",
  "floors": [
    {
      "floor": "Ground",
      "rooms": [
        {
          "name": "Living Room",
          "walls": [...],
          "floorSegments": [
            {
              "label": "Main area",
              "measurement": 12.5,
              "width": 3.0,
              "length": 2.5
            }
          ],
          "ceilingSegments": []
        }
      ]
    }
  ]
}
```

`width` and `length` are omitted from the print summary object when `null` (to keep the
payload clean for the print view).
