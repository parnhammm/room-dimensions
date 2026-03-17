# Research: Floor and Ceiling Dimensions (002)

## Decision 1: Entity Design — How to store width × length per surface

**Decision**: A dedicated `SurfaceDimension` TypeORM entity with a UNIQUE constraint on
`(roomId, surfaceType)`.

**Rationale**: This mirrors the existing `DimensionSegment` entity's `surfaceType` enum
('floor' | 'ceiling') pattern, keeping the domain model consistent. A separate entity:
- Allows clean CASCADE DELETE via Room → SurfaceDimension
- Is independently queryable and updatable
- Maps naturally to the repository/service/controller stack already established

**Alternatives considered**:
- *Add width + length columns directly to Room* — rejected: violates Single Responsibility;
  the Room entity already has a clear, bounded purpose (label, floor assignment).
- *Embed as JSON column on Room* — rejected: not TypeORM-idiomatic; bypasses class-validator;
  harder to migrate and query.
- *Reuse DimensionSegment with two rows (width, length as separate segments)* — rejected:
  the segment model is for arbitrary-count labelled measurements; forcing width and length
  into it loses the pairing semantics and makes them independently deletable, which FR-006
  explicitly forbids.

---

## Decision 2: HTTP method for create-or-update

**Decision**: `PUT /api/v1/rooms/:roomId/floor-dimensions` (upsert) returning **200 OK** in
all cases.

**Rationale**: There is at most one SurfaceDimension record per surface per room. The client
should not need to know whether a record already exists to decide between POST and PATCH/PUT.
`PUT` (full replacement) with upsert semantics eliminates this complexity. The constitution
maps PUT → 200 OK (full replacement), which is correct here.

**Alternatives considered**:
- *POST for create, PATCH for update (two endpoints)* — rejected: forces the frontend to
  track "does it already exist?" state, adding unnecessary complexity. The spec explicitly
  says users can "add, view, edit, and remove" — a single upsert endpoint serves all write
  cases.
- *POST returning 201 on first create, 200 on subsequent* — rejected: constitution maps POST
  to 201 Created for collection creation; a singleton resource is better modelled with PUT.

---

## Decision 3: Route structure

**Decision**: Two symmetric sub-resources nested under the room:
```
GET    /api/v1/rooms/:roomId/floor-dimensions
PUT    /api/v1/rooms/:roomId/floor-dimensions
DELETE /api/v1/rooms/:roomId/floor-dimensions

GET    /api/v1/rooms/:roomId/ceiling-dimensions
PUT    /api/v1/rooms/:roomId/ceiling-dimensions
DELETE /api/v1/rooms/:roomId/ceiling-dimensions
```

**Rationale**: Matches the existing nested-resource pattern (walls under rooms, windows under
walls). Kebab-case resource names align with the constitution's URL conventions. Symmetric
structure makes the API predictable and the Swagger documentation self-explanatory.

**Alternatives considered**:
- *Single `/surface-dimensions` collection endpoint* — rejected: a collection endpoint
  implies multiple records; the singleton-per-surface semantic is clearer as two named
  sub-resources.
- *Merge into `/dimensions` alongside segments* — rejected: the segment model and the
  width × length model are conceptually distinct (FR-008 requires independence); combining
  them would blur that boundary.

---

## Decision 4: Frontend component design

**Decision**: A single reusable `SurfaceDimensionPanel` component accepting a `surfaceType`
prop ('floor' | 'ceiling'). One instance rendered for floor, one for ceiling on the room
detail page.

**Rationale**: Both surfaces share identical UX behaviour (CTA → form → display → edit →
remove). A single parameterised component respects SRP while eliminating duplication.
This matches the constitution's "one component, one visual responsibility" rule.

**Alternatives considered**:
- *Separate FloorDimensionPanel + CeilingDimensionPanel* — rejected: pure duplication with
  no behavioural difference; violates DRY without justification.

---

## Decision 5: Print summary integration

**Decision**: Extend the existing `GET /api/v1/rooms/summary` endpoint response to include
`floorDimension` and `ceilingDimension` (nullable) on each room entry.

**Rationale**: FR-012 requires width × length to appear in the print summary alongside
segment data. Extending the existing endpoint avoids a breaking change while keeping the
print view as the single source of truth. Both fields are optional (a room may not have
dimensions set).

**Alternatives considered**:
- *Separate print endpoint for feature 002* — rejected: the print summary is a single view;
  splitting it across endpoints would require the frontend to merge data, adding complexity.

---

## Decision 6: Naming — `length` vs `height` for second dimension

**Decision**: The second horizontal dimension is called **`length`** (not `height`) in all
entity fields, DTOs, API contracts, and UI labels. "Height" is reserved for vertical
measurements (wall height, window height).

**Rationale**: Resolved in clarification session 2026-03-17. Avoids confusion between
"ceiling height" (a common measurement homeowners also capture) and the second horizontal
dimension of the ceiling footprint.
