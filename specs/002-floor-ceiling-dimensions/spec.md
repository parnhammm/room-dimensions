# Feature Specification: Floor and Ceiling Dimensions

**Feature Branch**: `002-floor-ceiling-dimensions`
**Created**: 2026-03-17
**Status**: Draft
**Input**: User description: "We need to support adding in dimensions for the floor and ceiling. We should support a width and a height"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Floor Dimensions (Priority: P1)

A homeowner opens a room and enters a width and length for the floor. They can then view the
saved values, update them at any time, or clear them if they were entered in error. The floor
dimensions represent the overall rectangular footprint of the floor surface.

**Why this priority**: Capturing the floor's width and length is the core of this feature.
It is the most common measurement a homeowner needs and is completely self-contained.

**Independent Test**: Open a room, enter a floor width of 5.0 and a floor length of 4.2,
save, and verify both values are displayed correctly. Edit the width to 5.5, save, and verify
the updated value persists. Clear/remove the floor dimensions and verify the room is still
accessible with no floor dimension shown.

**Acceptance Scenarios**:

1. **Given** a room exists with no floor dimensions, **When** the user enters a floor width of
   5.0 and a floor length of 4.2 and saves, **Then** both values are saved and displayed
   alongside the correct unit of measurement.
2. **Given** a room with floor dimensions saved, **When** the user updates the width to 5.5
   and saves, **Then** the new width is reflected and the length remains unchanged.
3. **Given** a room with floor dimensions saved, **When** the user removes the floor
   dimensions, **Then** no floor width or length is shown for that room.
4. **Given** the user enters a width or length of zero or a negative number, **When** they
   attempt to save, **Then** the system rejects the input and displays a clear error message
   prompting entry of a valid positive value.

---

### User Story 2 - Add Ceiling Dimensions (Priority: P2)

Having set floor dimensions, the homeowner can also enter a separate width and length for the
ceiling. Ceiling dimensions are managed independently from floor dimensions, allowing for
rooms where the ceiling measurement differs from the floor (e.g., due to structural features
or measurement variations).

**Why this priority**: Ceiling dimensions extend the same simple model as floor dimensions.
Independently testable — the ceiling panel works the same way as the floor panel regardless
of whether floor dimensions have been entered.

**Independent Test**: Open a room, leave floor dimensions empty, enter a ceiling width of 4.8
and a ceiling length of 3.0, save, and verify the ceiling values are stored and displayed
without affecting the floor dimensions panel. Edit one ceiling value and verify the update.

**Acceptance Scenarios**:

1. **Given** a room exists, **When** the user enters a ceiling width and length and saves,
   **Then** the ceiling dimensions are stored and displayed independently of the floor
   dimensions.
2. **Given** a room has both floor and ceiling dimensions saved, **When** the user updates the
   ceiling width, **Then** only the ceiling width changes; floor dimensions are unaffected.
3. **Given** a room has ceiling dimensions saved, **When** the user removes the ceiling
   dimensions, **Then** no ceiling width or length is shown and the floor dimensions remain
   unchanged.
4. **Given** the user enters a ceiling dimension of zero or negative, **When** they attempt to
   save, **Then** the system rejects the input and displays a clear error message.

---

### Edge Cases

- What does the user see when a room has no floor or ceiling dimensions yet? A
  call-to-action (e.g., "Add floor dimensions" / "Add ceiling dimensions") is displayed in
  place of the form. Activating it reveals the width and length entry fields.

- What happens when a user enters only a width without a length (or vice versa)? Both width
  and length must be provided together; a partial entry (one field filled, one empty) must be
  rejected with a clear message indicating both fields are required.
- What happens when a room is deleted? All associated floor and ceiling dimensions must be
  permanently removed along with the room.
- What happens if the user navigates away from an unsaved dimension entry? The system must
  prompt the user to save or discard changes before navigating away; silent discard is not
  permitted.
- What happens when the app-level unit of measurement is changed after dimensions have been
  saved? Stored numeric values are unaffected; only the displayed unit label changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each room MUST support a floor dimension consisting of exactly two values:
  width and length.
- **FR-002**: Each room MUST support a ceiling dimension consisting of exactly two values:
  width and length, managed independently from the floor dimension.
- **FR-003**: Users MUST be able to add, view, edit, and remove the floor width and length
  for any room.
- **FR-004**: Users MUST be able to add, view, edit, and remove the ceiling width and length
  for any room.
- **FR-005**: Width and length values MUST both be positive numbers. The system MUST reject
  zero or negative values and display a clear error message.
- **FR-006**: Both width and length MUST be provided together; saving a dimension with only
  one field filled MUST be rejected with a clear error message.
- **FR-007**: The system MUST display floor and ceiling dimensions alongside the app-level
  unit of measurement.
- **FR-008**: Floor and ceiling dimensions MUST be stored and displayed independently; changes
  to one MUST NOT affect the other.
- **FR-009**: When a room is deleted, its floor and ceiling dimensions MUST be permanently
  removed.
- **FR-010**: When a user attempts to navigate away from an unsaved dimension entry, the
  system MUST prompt the user to save or discard changes. Silent discard is not permitted.
- **FR-011**: Removal of floor or ceiling dimensions MUST be triggered by an explicit
  "Remove" / "Delete" action. Clearing input fields and saving MUST NOT be treated as
  deletion; only the explicit action returns the surface to the "not set" state.
- **FR-012**: Where a room has floor or ceiling width × length dimensions defined, the
  print summary MUST display those values alongside any segment-based outline data for
  that room.

### Key Entities

- **FloorDimension**: The rectangular footprint of a room's floor surface. Consists of a
  width and a length (both positive numbers). Belongs to exactly one room. Optional — a room
  may have no floor dimension defined.
- **CeilingDimension**: The rectangular footprint of a room's ceiling surface. Consists of a
  width and a length (both positive numbers). Belongs to exactly one room. Optional — a room
  may have no ceiling dimension defined. Managed independently from FloorDimension.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can enter, save, and retrieve floor and ceiling dimensions (width and
  length) for a room without data loss.
- **SC-002**: All dimension save and update actions complete and persist within 2 seconds of
  user confirmation.
- **SC-003**: The system correctly prevents saving partial or invalid dimension entries
  (missing field, zero, or negative value) in 100% of attempted invalid submissions.
- **SC-004**: Floor and ceiling dimensions are always displayed with the correct unit of
  measurement as set at the app level.
- **SC-005**: 90% of first-time users can successfully add both floor and ceiling dimensions
  to a room without requiring instructions or assistance.

## Assumptions

- Floor and ceiling dimensions in this feature are rectangular (width × length). They
  coexist independently alongside the segment-based outline model (feature 001); neither
  replaces the other and neither is required.
- A room may exist with no floor or ceiling dimension defined; partial data entry at the
  room level remains valid.
- The unit of measurement is the single app-level setting shared across the application.
  Changing the unit does not convert stored values — only the displayed unit label changes.
- Dimensions are not labelled beyond "floor" and "ceiling" — no free-text name is required
  for these dimension sets.
- There is exactly one floor dimension set and one ceiling dimension set per room; multiple
  sets per surface are out of scope.

## Clarifications

### Session 2026-03-17

- Q: For floor and ceiling surfaces, should the second dimension be called "height" or a horizontal term like "length"? → A: Use **width** and **length** for floor/ceiling dimensions. "Height" is reserved for vertical measurements (e.g., wall height) to avoid confusion with ceiling height.
- Q: How does the width × length model in this feature relate to the segment-based floor/ceiling model in feature 001 — does it replace, supplement, or derive from it? → A: **Supplement** — both models coexist independently on a room. The width × length pair and the segment-based outline are separate, neither is required, and neither replaces the other.
- Q: When a room has no floor or ceiling dimensions entered, what should the user see? → A: A call-to-action (e.g., "Add floor dimensions") that reveals the width and length entry form when activated; empty form fields are not shown by default.
- Q: How does a user remove previously entered floor or ceiling dimensions? → A: Via an explicit "Remove" / "Delete" button; clearing input fields and saving does not constitute deletion. Only the explicit action returns the surface to the "not set" state.
- Q: Should width × length floor and ceiling dimensions appear in the print summary from feature 001? → A: Yes — where defined, these dimensions MUST appear in the print summary for each room alongside any segment-based outline data.
