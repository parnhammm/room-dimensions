# Feature Specification: Room Dimension Capture

**Feature Branch**: `001-room-dimension-capture`
**Created**: 2026-03-17
**Status**: Draft
**Input**: User description: "Build me an application that allows me to capture the dimensions of each room in the house. Each room should support a dimension for the floor and the ceiling, with the ability to support none square or rectangular shapes. Each wall should support optionally the ability to include a window which should also have dimensions set that can be viewed when viewing the wall. These dimensions should be able to be added/edited/deleted as well as labeled. The room should also be labeled and support the ability to define which floor the room is on."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Rooms (Priority: P1)

A homeowner opens the application and creates a new room, giving it a meaningful name (e.g.
"Master Bedroom") and specifying which floor of the house it is on (e.g., Ground Floor, First
Floor). They can later rename the room, move it to a different floor, or delete it entirely.
All rooms in the house are listed so the homeowner can navigate between them.

**Why this priority**: Without the ability to create and organise rooms, no other dimension
capture is possible. This is the foundational entry point for the entire application.

**Independent Test**: Create a room named "Living Room" on "Ground Floor", verify it appears
in the room list with the correct label and floor, rename it to "Lounge" and verify the update
is reflected, then delete it and verify it no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** the application is open with no rooms, **When** the user creates a room named
   "Kitchen" assigned to "Ground Floor", **Then** the room appears in the room list with the
   label "Kitchen" and floor "Ground Floor".
2. **Given** a room named "Kitchen" exists, **When** the user edits the label to "Open Kitchen"
   and changes the floor to "Basement", **Then** the room list reflects the updated label
   and floor assignment.
3. **Given** a room exists, **When** the user deletes it, **Then** the room and all its
   associated walls, windows, and dimension data are permanently removed and it no longer
   appears in the room list.
4. **Given** multiple rooms exist across different floors, **When** the user views the room
   list, **Then** all rooms are displayed with their labels and floor assignments visible.

---

### User Story 2 - Capture Floor and Ceiling Dimensions (Priority: P2)

Having created a room, the homeowner captures the shape and dimensions of the room's floor
and ceiling. Because many rooms have non-rectangular shapes (e.g., L-shaped living rooms,
rooms with bay windows or alcoves), the homeowner defines the outline by specifying each
straight side or segment of the shape with a label and a measurement. Floor and ceiling
dimensions are managed independently, allowing for rooms where the two outlines differ
(e.g., rooms with sloped ceilings or partial mezzanines).

**Why this priority**: Capturing accurate floor and ceiling shapes is the primary purpose of
the application. Support for non-rectangular shapes is the core differentiator — it reflects
real-world room geometry that a simple four-value form cannot capture.

**Independent Test**: Open a room, define an L-shaped floor using five labelled segments,
verify all segments are saved with their labels and measurements, edit one segment, verify the
update persists, then delete a segment and verify it is removed. Confirm the ceiling
dimensions panel is empty and independent.

**Acceptance Scenarios**:

1. **Given** a room exists with no floor dimensions, **When** the user adds a floor dimension
   segment labelled "North Base" with a measurement of 4.5, **Then** the segment appears in
   the floor dimension list with the correct label and value.
2. **Given** a room with floor dimension segments, **When** the user adds five or more
   segments, **Then** all segments are saved and displayed without any restriction on count
   or shape type.
3. **Given** a floor dimension segment exists, **When** the user edits its label and
   measurement, **Then** the updated values are saved and displayed correctly.
4. **Given** a floor dimension segment exists, **When** the user deletes it, **Then** it is
   removed from the floor dimension list and the remaining segments are unaffected.
5. **Given** a room with floor dimensions defined, **When** the user views the ceiling
   dimensions panel, **Then** the ceiling list is independent — it has its own segments and
   changes to ceiling dimensions do not affect the floor dimensions.

---

### User Story 3 - Manage Walls (Priority: P3)

The homeowner adds walls to a room, giving each wall a label (e.g., "North Wall", "Feature
Wall") and recording its width and height. Walls can be added, edited, and deleted. The
homeowner can view all walls for a room at a glance and navigate into a specific wall to see
its detail.

**Why this priority**: Walls represent the vertical surfaces of the room and are essential
for estimating paint, tiling, or wallpaper coverage. This story is independently usable
without any windows defined.

**Independent Test**: Open a room, add a wall labelled "South Wall" with a specified width
and height, verify it appears in the wall list with correct values, edit the label and
dimensions, verify the update, then delete it and verify removal.

**Acceptance Scenarios**:

1. **Given** a room exists, **When** the user adds a wall labelled "North Wall" with a width
   of 5.0 and a height of 2.4, **Then** the wall appears in the room's wall list with the
   correct label, width, and height.
2. **Given** a wall exists, **When** the user edits its label, width, or height, **Then**
   the updated values are saved and displayed.
3. **Given** a wall exists, **When** the user deletes it, **Then** the wall and all its
   associated windows are permanently removed and no longer appear in the room.
4. **Given** a room has multiple walls, **When** the user views the room, **Then** all walls
   are listed with their labels and dimensions visible.

---

### User Story 4 - Add Windows to Walls (Priority: P4)

When viewing a wall, the homeowner can optionally add one or more windows to it. Each window
has a label (e.g., "Bay Window", "Side Light") and dimensions (width and height). Windows can
be viewed, edited, and deleted when the homeowner is viewing the wall they belong to. Walls
without windows are fully usable and unaffected.

**Why this priority**: Window dimensions are supplementary detail for a wall. The feature
adds value for estimating glazing, blinds, or curtains, but the application is fully usable
without it. It extends P3 without blocking any other story.

**Independent Test**: Open a wall, add a window labelled "Front Bay" with specified width and
height, verify it is displayed when viewing that wall, edit its dimensions, verify the update,
then delete the window and verify it is removed. Verify that a different wall on the same room
shows no windows.

**Acceptance Scenarios**:

1. **Given** a wall exists with no windows, **When** the user adds a window labelled "Bedroom
   Window" with a width of 1.2 and a height of 1.0, **Then** the window appears in the wall's
   window list with the correct label and dimensions.
2. **Given** a wall has one or more windows, **When** the user views that wall, **Then** all
   windows for that wall are displayed with their labels and dimensions.
3. **Given** a window exists on a wall, **When** the user edits the window's label or
   dimensions, **Then** the updated values are saved and displayed.
4. **Given** a window exists on a wall, **When** the user deletes the window, **Then** it is
   removed from the wall and the wall itself remains intact with its own dimensions unchanged.
5. **Given** a wall with no windows, **When** the user views it, **Then** no windows are
   shown and the wall's own dimensions are still accessible.

---

### User Story 5 - Print Summary (Priority: P5)

The homeowner wants a physical or shareable record of their captured room data. They trigger
a print-friendly summary view that displays all rooms (grouped by floor), with each room's
floor and ceiling dimension segments, walls, and windows — all values shown with the
app-level unit. The view is optimised for printing or saving as a PDF.

**Why this priority**: Print/export adds convenience but is not required for the core
capture workflow. All four higher-priority stories must be complete before this adds value.

**Independent Test**: With at least two rooms across different floors, each with walls and
windows defined, trigger the print summary and verify: all rooms appear grouped by floor,
all dimension segments, walls, and windows are listed with labels, measurements, and the
correct unit. Verify the view contains no edit controls.

**Acceptance Scenarios**:

1. **Given** one or more rooms with data exist, **When** the user triggers the print summary,
   **Then** a read-only view is presented listing all rooms grouped by floor, with all their
   floor/ceiling segments, walls, and windows shown.
2. **Given** the print summary is displayed, **When** the user reviews it, **Then** all
   numeric measurements are shown alongside the app-level unit of measurement.
3. **Given** the print summary is displayed, **When** the user initiates a browser/system
   print, **Then** the output is formatted for print (no navigation chrome, edit controls,
   or interactive elements).
4. **Given** no rooms exist, **When** the user triggers the print summary, **Then** an
   appropriate empty-state message is shown rather than a blank page.

---

### Edge Cases

- What happens when a user deletes a room that contains walls and windows? All nested data
  (walls, windows, floor/ceiling dimension segments) must be removed with the room.
- What happens when a user deletes a wall that has associated windows? All windows belonging
  to that wall must be removed.
- What happens if the user attempts to save a dimension with a value of zero or a negative
  number? The system must reject the value and display a clear prompt to enter a positive value.
- What happens if a room has no walls or dimension segments defined? The room should remain
  saveable and listed — partial data entry is valid at any point.
- What happens if the user navigates away from a form mid-edit without saving? The system
  MUST present a prompt asking the user to save or discard their changes before navigating
  away. The user must make an explicit choice; silent discard is not permitted.

## Requirements *(mandatory)*

### Functional Requirements

**Rooms**

- **FR-001**: Users MUST be able to create a room with a non-empty label and a floor
  assignment.
- **FR-002**: Users MUST be able to edit a room's label and floor assignment.
- **FR-003**: Users MUST be able to delete a room; deletion MUST permanently remove the room
  and all its associated floor/ceiling dimension segments, walls, and windows.
- **FR-004**: The system MUST display all rooms in a list with their labels and floor
  assignments visible.
- **FR-005**: Floor assignment MUST accept any user-defined text or number (e.g., "Basement",
  "Ground Floor", "1", "Attic") without restriction to a fixed list.

**Floor and Ceiling Dimensions**

- **FR-006**: Each room MUST have an independent set of floor dimension segments and an
  independent set of ceiling dimension segments.
- **FR-007**: Each dimension segment MUST have a non-empty label and a positive numeric
  measurement value. The unit displayed alongside all measurements is determined by the
  app-level unit setting.
- **FR-008**: The system MUST allow any number of dimension segments per surface (floor or
  ceiling), with no upper limit, to support non-rectangular room shapes.
- **FR-009**: Users MUST be able to add, edit, and delete individual dimension segments for
  both the floor and ceiling surfaces.

**Walls**

- **FR-010**: Users MUST be able to add a wall to a room with a non-empty label, a positive
  width measurement, and a positive height measurement.
- **FR-011**: Users MUST be able to edit a wall's label, width, and height.
- **FR-012**: Users MUST be able to delete a wall; deletion MUST permanently remove the wall
  and all its associated windows.
- **FR-013**: The system MUST display all walls for a room with their labels and dimensions.

**Windows**

- **FR-014**: Users MUST be able to add zero or more windows to any wall.
- **FR-015**: Each window MUST have a non-empty label, a positive width measurement, and a
  positive height measurement.
- **FR-016**: Users MUST be able to edit a window's label, width, and height.
- **FR-017**: Users MUST be able to delete a window from a wall without affecting the wall or
  any other windows on that wall.
- **FR-018**: The system MUST display all windows for a wall with their labels and dimensions
  when the user is viewing that wall.

**Print Summary**

- **FR-025**: The system MUST provide a read-only print summary view listing all rooms
  grouped by floor, showing each room's floor/ceiling dimension segments, walls, and windows
  with their labels and measurements.
- **FR-026**: The print summary MUST display all measurements with the app-level unit of
  measurement.
- **FR-027**: The print summary MUST be formatted for printing — navigation, edit controls,
  and interactive elements MUST NOT appear in the printed output.
- **FR-028**: When no rooms exist, the print summary MUST display an empty-state message
  rather than a blank page.

**Settings**

- **FR-022**: The system MUST provide a single app-level unit of measurement setting,
  selectable from at minimum: metres (m), centimetres (cm), feet (ft), inches (in).
- **FR-023**: The selected unit MUST be displayed consistently alongside all numeric
  measurements throughout the application.
- **FR-024**: The default unit MUST be metres (m). The user MUST be able to change the
  unit at any time; existing stored values are unaffected (conversion is not applied).

**Validation**

- **FR-019**: The system MUST reject any measurement value that is zero or negative and
  display a clear error message prompting entry of a valid positive value.
- **FR-020**: The system MUST require a non-empty label before saving any room, wall, window,
  or dimension segment. Labels are display names only — duplicate labels are permitted at
  all levels (rooms, walls, windows, dimension segments).
- **FR-021**: When a user attempts to navigate away from an unsaved edit, the system MUST
  display a prompt offering the choice to save or discard the changes. Silent discard is
  not permitted.

### Key Entities

- **Room**: A named space in a house, assigned to a floor level. Contains a set of floor
  dimension segments, a set of ceiling dimension segments, and a collection of walls. The
  floor/ceiling segments and walls are independent lists with no enforced relationship.
- **DimensionSegment**: A single labelled measurement contributing to the overall floor or
  ceiling shape of a room. A room's floor or ceiling shape is represented by a collection
  of these segments, enabling non-rectangular outlines. Segments are independent of Wall
  entries.
- **Wall**: A vertical surface within a room. Has a label, a width, and a height. Belongs
  to exactly one room. May have zero or more windows. Walls are defined independently of
  the room's floor/ceiling dimension segments.
- **Window**: An optional rectangular opening in a wall. Has a label, a width, and a height.
  Belongs to exactly one wall.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a room, define its floor plan using six or more labelled
  dimension segments representing a non-rectangular (L-shaped) outline, and retrieve all
  stored data accurately without data loss.
- **SC-002**: All dimension capture actions (add, edit, delete) for rooms, walls, and windows
  complete and persist within 2 seconds of user confirmation.
- **SC-003**: A user can navigate from the room list to a specific wall's window detail and
  back within three interactions.
- **SC-004**: 90% of first-time users can successfully add a room with at least one wall and
  one window without requiring instructions or assistance.
- **SC-005**: The application correctly stores and displays non-rectangular room shapes
  defined by more than four dimension segments, with no truncation or data loss regardless
  of segment count.
- **SC-006**: The print summary presents all rooms, walls, and dimensions for a house with
  ten or more rooms in a single, correctly formatted print view with no missing data.

## Clarifications

### Session 2026-03-17

- Q: Are walls linked to floor/ceiling dimension segments, or are they independent lists? → A: Walls are fully independent — floor/ceiling segments and walls are separate lists with no enforced relationship between them.
- Q: Should the user be able to control display order of walls, dimension segments, and windows? → A: Creation order only — items display in the order they were added; no reordering capability required.
- Q: Must room, wall, and window labels be unique? → A: Duplicates allowed — labels are display names only; no uniqueness enforced at any level.
- Q: Should a unit of measurement be stored alongside numeric values? → A: Single app-level unit setting — user selects one unit (e.g., m, cm, ft) applied to all measurements throughout the application.
- Q: Should the application support data export or sharing? → A: Printable/PDF summary — a read-only print view of all rooms, walls, and dimensions is required; machine-readable export is out of scope.

## Assumptions

- A single user operates the application; no authentication or multi-user support is required
  for this feature.
- The application provides a single unit of measurement setting (e.g., m, cm, ft, in)
  that applies to all measurements. The selected unit is displayed consistently throughout
  the application. The default unit is metres (m).
- Floor assignment is a free-form label entered by the user; the application does not impose
  a fixed list of floor levels.
- A room's floor and ceiling shapes are defined by collections of labelled measurement
  segments. A visual/graphical floor plan drawing tool is out of scope for this feature.
- Windows are always rectangular (width × height). Non-rectangular window shapes are out
  of scope.
- Walls are flat rectangular surfaces (width × height). Shaped or irregular walls are out
  of scope.
- A house is the implicit top-level container. Multi-house support is out of scope.
- Data export to machine-readable formats (CSV, JSON) is out of scope. A print/PDF summary
  view is in scope (User Story 5).
- Walls, dimension segments, and windows are displayed in creation order. User-controlled reordering is out of scope.
