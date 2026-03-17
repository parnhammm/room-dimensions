# Feature Specification: Overhaul Release Cleanup

**Feature Branch**: `003-overhaul-cleanup`
**Created**: 2026-03-17
**Status**: Draft
**Input**: User description: "We want to do an overhaul release for this application. There are a number of items we want to clean up. We want to upgrade the node version to latest for both the frontend and backend, updating any dependencies necessary. We want to ensure that test data from test runs does not get written into the database used by the app running locally and is properly cleaned down after a test run. We want to ensure that the segment feature supports the width and height dimensions added in spec 2. We also want to ensure that the standards we use in the dockerfile are up to date."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Test Run Isolation (Priority: P1)

A developer runs the automated test suite against their local development environment.
Today, test records (rooms, walls, segments, dimensions) accumulate in the same database
the developer uses to test the running application, causing confusion and manual cleanup.
After this change, tests run against a fully isolated environment that is automatically
cleaned up after each run, leaving the developer's working database untouched.

**Why this priority**: Data pollution from test runs directly corrupts the developer's
working state and can cause false positives or negatives in subsequent test runs.
This is a correctness and reliability issue that affects every development session.

**Independent Test**: Run the full automated test suite, then inspect the local
development database and confirm zero test-generated records exist. Run the suite a
second time and confirm results are consistent regardless of prior run state.

**Acceptance Scenarios**:

1. **Given** the developer's local application database contains real working data,
   **When** the automated test suite is run, **Then** no records are written to or
   removed from the local application database.
2. **Given** a previous test run has completed, **When** a new test run starts,
   **Then** the test environment begins from a clean, known state regardless of what
   the previous run left behind.
3. **Given** a test run fails mid-way through, **When** the developer inspects the
   test environment, **Then** any partial test data is cleaned up, not left orphaned.
4. **Given** the test suite has completed (pass or fail), **When** the developer
   checks the local application, **Then** all application data is exactly as it was
   before the test run began.

---

### User Story 2 - Segment Width and Length Support (Priority: P2)

A homeowner enters dimension segments for a room surface (floor or ceiling). Currently,
each segment captures only a single linear measurement and a label. After this change,
each segment can optionally carry a width and a length in addition to the existing
measurement, making it consistent with the surface dimension model introduced in
spec 002. Users can capture richer detail — for example, recording both the perimeter
measurement of a sub-area and its rectangular footprint — all within a single segment
entry.

**Why this priority**: Users who have already adopted the floor/ceiling width × length
model from spec 002 expect the segment-based view of those same surfaces to offer the
same depth of measurement. Unifying the data model across both features reduces confusion.

**Independent Test**: Open a room's floor surface, add a new segment with a label,
a measurement value, a width of 3.0, and a length of 2.5. Save and verify all four
values are stored and displayed. Edit the width to 3.2 and confirm only that value
changes. Add a second segment with only a label and measurement (no width/length) and
confirm it saves correctly — width and length are optional on a segment.

**Acceptance Scenarios**:

1. **Given** a room's floor surface, **When** a user adds a segment with a label,
   measurement, width, and length, **Then** all four values are saved and displayed
   alongside the correct unit of measurement.
2. **Given** an existing segment with width and length, **When** the user updates
   the width, **Then** only the width changes; measurement and length are unaffected.
3. **Given** a new segment, **When** the user provides only a label and measurement
   (omitting width and length), **Then** the segment saves successfully — width and
   length are optional.
4. **Given** a user enters a width or length of zero or a negative number on a segment,
   **When** they attempt to save, **Then** the system rejects the entry and displays
   a clear error explaining that width and length must be positive when provided.
5. **Given** the print summary is viewed, **When** a room surface has segments with
   width and length values set, **Then** those values are displayed per segment in
   the print output.

---

### User Story 3 - Runtime and Container Modernisation (Priority: P3)

A developer or operator builds and runs the application. The application currently
targets an older runtime version and uses Dockerfile patterns that have since been
superseded by more secure and efficient alternatives. After this change, the application
runs on the latest stable long-term-support runtime, all package dependencies are
compatible and up to date, and the container build follows current best-practice
standards for image size, layer caching, and security.

**Why this priority**: Runtime and container hygiene is essential for long-term
supportability and security but does not directly affect end-user functionality today.
It is lower priority than functional correctness issues.

**Independent Test**: Build the container image from scratch on a clean machine,
start the full application stack, and verify that all existing features (rooms, walls,
segments, dimensions, print summary) function correctly. Confirm the runtime version
reported by the running container matches the target version.

**Acceptance Scenarios**:

1. **Given** the application source, **When** the container image is built,
   **Then** the build completes without errors and the resulting container reports
   the latest stable LTS runtime version.
2. **Given** the updated runtime, **When** all automated test suites are run,
   **Then** every test suite passes with zero failures and zero lint errors —
   confirming no breaking changes were introduced by the upgrade.
3. **Given** an operator with no prior local setup, **When** they run the standard
   start command, **Then** the full application stack starts correctly using the
   updated runtime and container configuration.
4. **Given** the updated Dockerfile, **When** evaluated against current container
   best practices, **Then** it uses a minimal base image, runs as a non-root user,
   and has no layers that unnecessarily bloat the image size.

---

### User Story 4 - Test Coverage at 80% Threshold (Priority: P4)

A developer making any change to the backend or frontend runs the test suite and sees
a coverage report confirming the project meets its mandated 80% line and branch coverage
threshold. Today, several modules lack tests entirely, meaning bugs in those areas can
ship undetected. After this work, both backend and frontend reach 80% coverage, the gate
is configured to enforce it automatically, and no future PR can drop below the threshold
without being blocked.

**Why this priority**: Coverage is foundational quality infrastructure. It is lower
priority than the functional and isolation work in this release but must be delivered
as part of the overhaul to bring the project into full compliance with its own standards.

**Independent Test**: Run each test suite with coverage reporting enabled. Verify
backend line and branch coverage ≥ 80%. Verify frontend line and branch coverage ≥ 80%.
Introduce a deliberate uncovered function, confirm the gate fails, then remove it and
confirm the gate passes.

**Acceptance Scenarios**:

1. **Given** the backend test suite is run with coverage enabled, **When** the report
   is generated, **Then** line coverage and branch coverage are both ≥ 80% across all
   service and repository modules.
2. **Given** the frontend test suite is run with coverage enabled, **When** the report
   is generated, **Then** line coverage and branch coverage are both ≥ 80% across all
   custom hooks and service client modules.
3. **Given** a developer introduces a new function with no corresponding test,
   **When** the test suite runs, **Then** the coverage gate reports a failure,
   preventing the change from passing the quality check.
4. **Given** the coverage report, **When** a developer examines it, **Then** every
   previously uncovered service method, repository function, hook, and service client
   has at least one test covering its primary logic path and its principal error path.

---

### Edge Cases

- What if a package dependency is incompatible with the latest runtime version? A
  compatible alternative or updated version MUST be identified and adopted; the
  upgrade MUST NOT be blocked by a single incompatible package without a documented
  resolution.
- What if a test run is interrupted (e.g., process kill)? The test environment MUST
  still be left in a clean state on the next run start — cleanup MUST happen at the
  beginning of each run, not only at the end.
- What if a segment already exists with no width or length? Existing segments MUST
  continue to display and function correctly; the new fields are optional and
  additive — no data migration that would break existing records is permitted.
- What if width or length is provided for a segment but the other is omitted? The
  system MUST accept a segment where only width is set, only length is set, or
  both are set — neither field depends on the other being present.
- What if the current coverage already exceeds 80% in one area? No tests are removed;
  the threshold is a floor, not a ceiling. Existing tests that exceed the threshold
  are preserved.
- What if a module is excluded from coverage (e.g., configuration, auto-generated files)?
  Such modules MUST be listed in a committed coverage exclusion configuration; ad-hoc
  inline suppression of coverage reporting is not permitted.
- What if a test is written solely to inflate coverage without asserting meaningful
  behaviour? Such tests MUST be rejected in code review; tests MUST assert on observable
  outcomes, not merely invoke the function.

## Requirements *(mandatory)*

### Functional Requirements

**Test Isolation**

- **FR-001**: The automated test suite MUST run against a dedicated test environment
  that is entirely separate from the local development environment.
- **FR-002**: The test environment MUST be automatically initialised to a clean,
  known state at the start of every test run.
- **FR-003**: All test-generated data MUST be removed from the test environment at the
  completion of each test run, whether the run passes or fails.
- **FR-004**: The local development environment MUST remain completely unmodified by
  any test run — no test records MUST be written to or deleted from it.

**Segment Dimensions**

- **FR-005**: Each dimension segment MUST support an optional width value (a positive
  number) in addition to its existing label and measurement fields.
- **FR-006**: Each dimension segment MUST support an optional length value (a positive
  number) in addition to its existing label and measurement fields.
- **FR-007**: Width and length on a segment are independent and optional; either, both,
  or neither may be provided without affecting the validity of the segment.
- **FR-008**: When a width or length value is provided on a segment, it MUST be a
  positive number. Zero and negative values MUST be rejected with a clear error message.
- **FR-009**: The segment list and detail views MUST display width and length values
  (when present) alongside the existing label, measurement, and unit.
- **FR-010**: The print summary MUST display segment width and length values (when
  present) for each segment within a room surface.
- **FR-011**: Existing segments that have no width or length MUST continue to function
  and display correctly without modification.

**Runtime and Container Modernisation**

- **FR-012**: The application runtime MUST be upgraded to the latest stable
  long-term-support version across all services (frontend and backend).
- **FR-013**: All package dependencies MUST be reviewed and updated to versions
  compatible with the upgraded runtime, with no known high or critical
  vulnerabilities remaining.
- **FR-014**: The Dockerfile(s) MUST conform to current best-practice standards:
  minimal base image, non-root execution, efficient layer ordering.
- **FR-015**: All existing automated tests MUST pass without modification after the
  runtime upgrade — any failures MUST be fixed as part of this work.

**Test Coverage**

- **FR-016**: The backend test suite MUST report ≥ 80% line coverage and ≥ 80% branch
  coverage across all service and repository modules when run with coverage enabled.
- **FR-017**: The frontend test suite MUST report ≥ 80% line coverage and ≥ 80% branch
  coverage across all custom hooks and service client modules when run with coverage enabled.
- **FR-018**: Every backend service method MUST have at least one test covering its
  primary success path and at least one test covering its primary failure or error path.
- **FR-019**: Every custom hook and service client function MUST have at least one test
  covering its primary behaviour and at least one covering its error or empty state.
- **FR-020**: The coverage gate MUST be configured to fail the test run automatically
  if either backend or frontend drops below 80% on any subsequent run; this configuration
  MUST be committed to the repository.
- **FR-021**: Files excluded from coverage measurement (configuration, migrations,
  auto-generated code) MUST be listed in a committed exclusion configuration — inline
  suppression is not permitted.

### Key Entities

- **DimensionSegment**: An individual labeled measurement for a room surface (floor or
  ceiling). Gains two optional new attributes: `width` (positive number, optional) and
  `length` (positive number, optional). Existing `label` and `measurement` attributes
  are unchanged and remain required.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero test-generated records appear in the local development database after
  any test run, regardless of whether the run passed or failed.
- **SC-002**: Running the test suite twice in succession produces identical results —
  confirming that test isolation is complete and runs are independent.
- **SC-003**: Existing segments display and behave identically after the change — 100%
  of pre-existing segment records remain accessible and unmodified.
- **SC-004**: Users can add, view, edit, and remove width and length on any segment
  within 2 seconds of initiating the action.
- **SC-005**: The application starts successfully on the latest stable LTS runtime with
  zero changes required to existing startup procedures.
- **SC-006**: All automated test suites pass with zero failures and zero lint errors
  following the runtime upgrade and dependency updates.
- **SC-007**: The container image build completes without errors and the resulting
  image passes a standard security scan with zero high or critical findings.
- **SC-008**: Backend line coverage and branch coverage both reach ≥ 80% as reported
  after this work is complete.
- **SC-009**: Frontend line coverage and branch coverage both reach ≥ 80% as reported
  after this work is complete.
- **SC-010**: A PR that introduces uncovered code is automatically blocked by the
  coverage gate — confirmed by deliberately introducing a gap and observing the failure.
- **SC-011**: Every newly added test asserts at least one meaningful, observable outcome
  (not merely invokes the function), verified through code review.

## Assumptions

- "Latest stable runtime" refers to the current LTS (Long-Term Support) release line
  at the time of implementation, not a release candidate or nightly build.
- Width and length on a segment use the same app-level unit of measurement shared
  across the application — no per-segment unit override is required.
- Segment dimensions use **width and length** (both horizontal), consistent with the
  surface dimension terminology established in spec 002. "Height" is reserved for
  vertical measurements (e.g., wall height) and does not apply to floor or ceiling
  segments.
- Test isolation applies to all automated test tiers: unit tests, integration tests,
  and end-to-end tests. Each tier MUST have its own clean execution context.
- No user-visible data migration is required: existing segments without width/length
  simply display those fields as absent (not as zero).
- The Dockerfile modernisation covers the production build image(s) only; development
  convenience images (e.g., hot-reload dev server) are out of scope for this story.
- Coverage is measured at the unit test tier only, consistent with the project
  constitution. Integration and end-to-end tests do not count toward the 80% target.
- The 80% threshold applies to both line and branch coverage independently; meeting
  one metric but not the other does not satisfy the requirement.
- No existing passing tests are removed or weakened to achieve the target; coverage
  is grown by adding new tests, not by gaming the metric.

## Clarifications

### Session 2026-03-17

- Q: Should the new optional second dimension on a segment be called "length" (horizontal, consistent with spec 002's surface model) or "height" (vertical, like walls)? → A: **Width and length** — segments sit on horizontal surfaces (floor/ceiling); this is consistent with spec 002's established terminology where "height" is reserved for vertical measurements.
