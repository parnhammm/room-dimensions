# API Contract: Room Dimension Capture

**Base URL**: `/api/v1`
**Documentation**: `GET /api/docs` (Swagger UI, non-production only)
**Content-Type**: `application/json` for all requests and responses

## Error Response Shape

All error responses use:

```json
{
  "error": {
    "code": "SCREAMING_SNAKE_CASE_CODE",
    "message": "Human-readable safe message."
  }
}
```

## Standard Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `VALIDATION_ERROR` | 400 | Request body failed DTO validation |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Rooms

### GET /api/v1/rooms

Returns all rooms ordered by floor (alphabetical) then createdAt ASC.

**Response 200**:
```json
[
  { "id": 1, "label": "Kitchen", "floor": "Ground Floor", "createdAt": "...", "updatedAt": "..." }
]
```

---

### POST /api/v1/rooms

Create a new room.

**Request body**:
```json
{ "label": "Kitchen", "floor": "Ground Floor" }
```

**Validation**: `label` non-empty string, `floor` non-empty string.

**Response 201**: `RoomResponseDto`

**Response 400**: `VALIDATION_ERROR`

---

### GET /api/v1/rooms/summary

Returns full room data for the print summary, grouped by floor, ordered alphabetically by
floor then by createdAt ASC within each floor.

**Response 200**: `PrintSummaryResponseDto` (see data-model.md)

---

### GET /api/v1/rooms/:roomId

Returns room detail including floor/ceiling segments and wall summaries.

**Response 200**: `RoomDetailResponseDto`

**Response 404**: `NOT_FOUND`

---

### PATCH /api/v1/rooms/:roomId

Update room label and/or floor. At least one field required.

**Request body**:
```json
{ "label": "Open Kitchen" }
```

**Response 200**: `RoomResponseDto`

**Response 400**: `VALIDATION_ERROR`

**Response 404**: `NOT_FOUND`

---

### DELETE /api/v1/rooms/:roomId

Delete room and all associated data (segments, walls, windows).

**Response 204**: No content

**Response 404**: `NOT_FOUND`

---

## Dimension Segments

### GET /api/v1/rooms/:roomId/segments?surface=floor|ceiling

Returns segments for the specified surface, ordered by `createdAt ASC`.

**Query param**: `surface` — required, one of `floor` | `ceiling`

**Response 200**:
```json
[
  { "id": 1, "label": "North Base", "measurement": 4.5, "surfaceType": "floor", "createdAt": "..." }
]
```

**Response 400**: `VALIDATION_ERROR` (missing or invalid `surface` param)

**Response 404**: `NOT_FOUND` (room not found)

---

### POST /api/v1/rooms/:roomId/segments

Add a dimension segment to a room surface.

**Request body**:
```json
{ "label": "North Base", "measurement": 4.5, "surfaceType": "floor" }
```

**Validation**: `label` non-empty, `measurement` > 0, `surfaceType` one of `floor|ceiling`.

**Response 201**: `SegmentResponseDto`

**Response 400**: `VALIDATION_ERROR`

**Response 404**: `NOT_FOUND` (room not found)

---

### PATCH /api/v1/rooms/:roomId/segments/:segmentId

Update a dimension segment's label and/or measurement.

**Request body**:
```json
{ "label": "Updated Label", "measurement": 5.0 }
```

**Validation**: If provided, `label` non-empty and `measurement` > 0.

**Response 200**: `SegmentResponseDto`

**Response 400**: `VALIDATION_ERROR`

**Response 404**: `NOT_FOUND`

---

### DELETE /api/v1/rooms/:roomId/segments/:segmentId

Delete a dimension segment.

**Response 204**: No content

**Response 404**: `NOT_FOUND`

---

## Walls

### GET /api/v1/rooms/:roomId/walls

Returns all walls for a room ordered by `createdAt ASC`.

**Response 200**:
```json
[
  { "id": 1, "label": "North Wall", "width": 5.0, "height": 2.4, "createdAt": "...", "updatedAt": "..." }
]
```

**Response 404**: `NOT_FOUND` (room not found)

---

### POST /api/v1/rooms/:roomId/walls

Add a wall to a room.

**Request body**:
```json
{ "label": "North Wall", "width": 5.0, "height": 2.4 }
```

**Validation**: `label` non-empty, `width` > 0, `height` > 0.

**Response 201**: `WallSummaryResponseDto`

**Response 400**: `VALIDATION_ERROR`

**Response 404**: `NOT_FOUND` (room not found)

---

### GET /api/v1/rooms/:roomId/walls/:wallId

Returns wall detail including all windows ordered by `createdAt ASC`.

**Response 200**: `WallDetailResponseDto`

**Response 404**: `NOT_FOUND`

---

### PATCH /api/v1/rooms/:roomId/walls/:wallId

Update wall label, width, and/or height.

**Request body**:
```json
{ "width": 5.5 }
```

**Response 200**: `WallSummaryResponseDto`

**Response 400**: `VALIDATION_ERROR`

**Response 404**: `NOT_FOUND`

---

### DELETE /api/v1/rooms/:roomId/walls/:wallId

Delete wall and all associated windows.

**Response 204**: No content

**Response 404**: `NOT_FOUND`

---

## Windows

### GET /api/v1/rooms/:roomId/walls/:wallId/windows

Returns all windows for a wall ordered by `createdAt ASC`.

**Response 200**:
```json
[
  { "id": 1, "label": "Bay Window", "width": 1.2, "height": 1.0, "createdAt": "...", "updatedAt": "..." }
]
```

**Response 404**: `NOT_FOUND` (wall not found)

---

### POST /api/v1/rooms/:roomId/walls/:wallId/windows

Add a window to a wall.

**Request body**:
```json
{ "label": "Bay Window", "width": 1.2, "height": 1.0 }
```

**Validation**: `label` non-empty, `width` > 0, `height` > 0.

**Response 201**: `WindowResponseDto`

**Response 400**: `VALIDATION_ERROR`

**Response 404**: `NOT_FOUND` (wall not found)

---

### PATCH /api/v1/rooms/:roomId/walls/:wallId/windows/:windowId

Update window label, width, and/or height.

**Request body**:
```json
{ "height": 1.2 }
```

**Response 200**: `WindowResponseDto`

**Response 400**: `VALIDATION_ERROR`

**Response 404**: `NOT_FOUND`

---

### DELETE /api/v1/rooms/:roomId/walls/:wallId/windows/:windowId

Delete a window.

**Response 204**: No content

**Response 404**: `NOT_FOUND`

---

## Settings

### GET /api/v1/settings

Returns the current app-level unit of measurement.

**Response 200**:
```json
{ "measurementUnit": "m" }
```

---

### PATCH /api/v1/settings

Update the app-level unit of measurement.

**Request body**:
```json
{ "measurementUnit": "ft" }
```

**Validation**: `measurementUnit` one of `m | cm | ft | in`.

**Response 200**: `SettingsResponseDto`

**Response 400**: `VALIDATION_ERROR`
