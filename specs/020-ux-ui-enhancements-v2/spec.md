# Feature Specification: UX/UI Enhancements v2

**Feature Branch**: `020-ux-ui-enhancements-v2`
**Created**: 2026-02-24
**Status**: Draft
**Input**: User description: "UX/UI Enhancements v2 — a batch of 9 improvements covering breadcrumb navigation, toast notifications, project search/filter, project description on cards, AI progress indicators, export feedback, chat panel resize, responsive traceability table, and project archiving."

## Clarifications

### Session 2026-02-24

- Q: What is the relationship between Archive and Delete actions on project cards? → A: Both actions always coexist on all projects (active and archived). Archive hides the project; Delete permanently removes it. No forced workflow.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toast Notifications for System Feedback (Priority: P1)

A user triggers an action (generating a spec, approving a phase, exporting a file) and receives a brief, transient notification confirming success or explaining an error. The notification appears at the edge of the screen and auto-dismisses after a few seconds, replacing the current inline amber/red banners that persist and clutter the interface.

**Why this priority**: Feedback on every user action is foundational UX. Inline banners disrupt layout and require manual dismissal. Toast notifications provide a consistent, non-intrusive feedback channel across the entire application.

**Independent Test**: Can be fully tested by triggering any AI generation, phase approval, or export action and verifying a transient notification appears with the correct message.

**Acceptance Scenarios**:

1. **Given** a user is on the spec page, **When** AI generation completes successfully, **Then** a success toast appears and auto-dismisses after 4 seconds.
2. **Given** a user triggers AI generation, **When** the AI response is malformed, **Then** a warning toast appears explaining the issue.
3. **Given** a user approves a phase, **When** the phase transitions to "reviewed", **Then** a success toast confirms the approval.
4. **Given** a toast is visible, **When** the user clicks the dismiss button on the toast, **Then** the toast disappears immediately.

---

### User Story 2 - Search and Filter Project List (Priority: P1)

A user with multiple projects opens the home page and uses a search bar to quickly find a project by name. They can also sort the project list by name, creation date, or last updated date to organize their view. Filtering and sorting happen instantly on the client side.

**Why this priority**: As the number of projects grows, finding a specific project becomes the most frequent friction point. Search and sort are essential for scaling the project list beyond a handful of entries.

**Independent Test**: Can be fully tested by creating several projects, typing a search term, and verifying only matching projects appear. Changing the sort order and verifying the list reorders correctly.

**Acceptance Scenarios**:

1. **Given** the user has 10+ projects, **When** they type a search term in the search bar, **Then** only projects whose name contains the search term (case-insensitive) are displayed.
2. **Given** the user has filtered the list, **When** they clear the search bar, **Then** all projects reappear.
3. **Given** the project list is visible, **When** the user selects "Sort by name" from the sort dropdown, **Then** projects are listed alphabetically.
4. **Given** the project list is visible, **When** the user selects "Sort by last updated", **Then** the most recently updated project appears first.
5. **Given** a search yields no results, **When** the user views the list, **Then** an empty state message indicates no projects match the search term.

---

### User Story 3 - Project Description on Cards (Priority: P2)

A user viewing the project list sees a short preview of each project's description beneath the project name on each card. This helps distinguish similarly named projects at a glance without needing to open each one.

**Why this priority**: Complements the search feature by giving users visual context to identify the right project without additional clicks.

**Independent Test**: Can be fully tested by creating a project with a description and verifying the description text appears truncated on the project card in the list.

**Acceptance Scenarios**:

1. **Given** a project has a description, **When** the user views the project list, **Then** the card shows the first 2-3 lines of the description with ellipsis if truncated.
2. **Given** a project has no description, **When** the user views the project list, **Then** the card shows a subtle placeholder text (e.g., "No description").
3. **Given** a project has a very long description, **When** the card renders, **Then** the text is visually capped at 3 lines maximum with an ellipsis.

---

### User Story 4 - Breadcrumb Navigation (Priority: P2)

A user working inside a project phase (e.g., Spec, Plan, Tasks) sees a breadcrumb trail at the top of the page showing their location (e.g., "Projects > My Project > Spec"). Each segment is clickable, allowing quick navigation back to the project list or project overview without using the browser back button.

**Why this priority**: Deep navigation without breadcrumbs causes disorientation. This is a standard navigation pattern that improves wayfinding across all project subpages.

**Independent Test**: Can be fully tested by navigating to any project phase page and verifying the breadcrumb renders with correct segments and each segment navigates to the expected destination.

**Acceptance Scenarios**:

1. **Given** the user is on a project's spec page, **When** they view the breadcrumb, **Then** it shows "Projects > [Project Name] > Spec" with each segment being a clickable link.
2. **Given** the user clicks the "Projects" segment in the breadcrumb, **When** the navigation completes, **Then** they are on the project list page.
3. **Given** the user clicks the project name segment, **When** the navigation completes, **Then** they are on the project overview page.
4. **Given** the user is on the project overview page, **When** they view the breadcrumb, **Then** it shows "Projects > [Project Name]" (no third segment).
5. **Given** the project name is very long, **When** the breadcrumb renders, **Then** the name is truncated with an ellipsis to prevent layout overflow.

---

### User Story 5 - Progress Indicator for AI Operations (Priority: P2)

A user triggers an AI operation (generating spec/plan/tasks, running deep analysis) and sees a visual progress indicator instead of plain "Generating..." text. The indicator provides a sense that work is actively happening, such as an animated skeleton preview or pulsing progress bar.

**Why this priority**: AI operations can take several seconds. A richer progress indicator reduces perceived wait time and prevents users from thinking the app is frozen.

**Independent Test**: Can be fully tested by triggering any AI generation and verifying the progress indicator is visible, animated, and disappears when the operation completes.

**Acceptance Scenarios**:

1. **Given** a user triggers spec generation, **When** the operation begins, **Then** an animated progress indicator replaces the static "Generating..." text.
2. **Given** an AI operation is in progress, **When** content begins streaming in, **Then** the indicator shows that content is actively being received.
3. **Given** an AI operation completes, **When** the result is rendered, **Then** the progress indicator disappears and the final content is shown.
4. **Given** an AI operation fails, **When** the error occurs, **Then** the progress indicator is replaced by an error toast notification.

---

### User Story 6 - Export Success Feedback (Priority: P3)

A user exports a phase or all phases as a ZIP file and sees a brief toast notification confirming the export was successful. Currently, clicking export triggers a file download with no visual confirmation.

**Why this priority**: Closes the feedback loop on export actions. Low effort, high polish — builds on the toast notification system from User Story 1.

**Independent Test**: Can be fully tested by clicking any export button and verifying a success toast appears after the file downloads.

**Acceptance Scenarios**:

1. **Given** a user clicks "Export Spec", **When** the download completes, **Then** a toast shows "Spec exported successfully".
2. **Given** a user clicks the ZIP export button, **When** the download completes, **Then** a toast shows "All phases exported as ZIP".
3. **Given** an export fails (e.g., no content to export), **When** the error occurs, **Then** an error toast explains the issue.

---

### User Story 7 - Responsive Traceability Table (Priority: P3)

A user viewing the traceability matrix on a narrow viewport (tablet or small laptop) can horizontally scroll through the plan and task columns while the requirement label column stays fixed on the left side. This ensures they always know which requirement they are inspecting.

**Why this priority**: The traceability matrix has many columns and currently overflows on smaller screens without clear affordance for horizontal scrolling.

**Independent Test**: Can be fully tested by viewing the traceability page on a narrow viewport and verifying the first column stays fixed while the remaining columns scroll horizontally.

**Acceptance Scenarios**:

1. **Given** the viewport is narrower than the full table width, **When** the user scrolls horizontally, **Then** the first column (requirement labels) remains fixed in place.
2. **Given** the user is on a wide viewport, **When** the table fits entirely, **Then** no horizontal scroll is shown and the table behaves normally.
3. **Given** the user scrolls horizontally, **When** they look at any row, **Then** the requirement label for that row is always visible.

---

### User Story 8 - Chat Panel Resize (Priority: P3)

A user on desktop can drag the left edge of the chat panel to make it wider or narrower. The panel width is remembered between sessions. This allows users to allocate more screen space to the chat when having longer conversations or to the main content when editing.

**Why this priority**: The chat panel has a fixed width that may not suit all users or screen sizes. Resize gives users control over their workspace layout.

**Independent Test**: Can be fully tested by dragging the chat panel's left edge, verifying the width changes, closing and reopening the panel, and verifying the width persists.

**Acceptance Scenarios**:

1. **Given** the chat panel is open on desktop, **When** the user hovers over the left edge, **Then** a resize cursor appears indicating the panel can be dragged.
2. **Given** the user drags the left edge to the left, **When** they release, **Then** the panel is wider (up to a maximum of 640px).
3. **Given** the user drags the left edge to the right, **When** they release, **Then** the panel is narrower (down to a minimum of 320px).
4. **Given** the user has resized the panel, **When** they close and reopen the panel, **Then** the panel opens at the previously set width.
5. **Given** the user is on a mobile device, **When** the chat panel opens, **Then** no resize handle is shown (panel is full-width as before).

---

### User Story 9 - Project Archiving (Priority: P3)

A user who has finished working on a project can archive it to declutter their project list without permanently deleting it. Archived projects are hidden from the default view but can be accessed by toggling a filter. Projects can be unarchived at any time to restore them to the active list.

**Why this priority**: Provides a non-destructive way to manage project clutter. Currently the only option is permanent deletion.

**Independent Test**: Can be fully tested by archiving a project, verifying it disappears from the default list, toggling the filter to see archived projects, and unarchiving to restore it.

**Acceptance Scenarios**:

1. **Given** a user views the project list, **When** they click "Archive" on a project card, **Then** the project is removed from the active project list.
2. **Given** a project has been archived, **When** the user enables the "Show archived" toggle, **Then** archived projects appear in the list with a visual indicator (e.g., muted styling or badge).
3. **Given** an archived project is visible, **When** the user clicks "Unarchive", **Then** the project returns to the active project list.
4. **Given** the user has the "Show archived" toggle enabled, **When** they search/filter projects, **Then** the search applies to both active and archived projects.
5. **Given** an archived project is visible, **When** the user clicks to open it, **Then** they can view all project content as normal (read-only is not required).
6. **Given** an active or archived project is visible, **When** the user clicks "Delete", **Then** the project is permanently removed after confirmation (both Archive and Delete actions are always available regardless of archive status).

---

### Edge Cases

- What happens when the user resizes the chat panel beyond the minimum (320px) or maximum (640px) boundaries? The panel snaps to the boundary.
- What happens when a user archives all projects? The project list shows an empty state for active projects with guidance to check the archive.
- What happens when the search bar is used while the "Show archived" toggle is off? Only active projects are searched.
- What happens when a toast notification triggers while another toast is still visible? Multiple toasts stack vertically without overlapping.
- What happens when the breadcrumb project name changes (inline rename)? The breadcrumb updates immediately to reflect the new name.
- What happens when the traceability table has no requirements? The existing empty state is shown, no sticky column behavior applies.
- What happens when AI generation is cancelled mid-stream? The progress indicator disappears and any partial content is discarded with an informational toast.
- What happens when a user deletes an archived project? The same delete confirmation dialog appears; upon confirmation the project is permanently removed from the database.

## Requirements *(mandatory)*

### Functional Requirements

**Toast Notifications**

- **FR-001**: System MUST display transient toast notifications for all success, error, and warning events across the application.
- **FR-002**: Toast notifications MUST auto-dismiss after 4 seconds for success messages and persist until dismissed for error messages.
- **FR-003**: Multiple simultaneous toasts MUST stack vertically without overlapping.
- **FR-004**: System MUST replace all existing inline amber/red error banners with toast notifications.

**Search & Filter**

- **FR-005**: System MUST provide a search bar on the project list page that filters projects by name (case-insensitive, substring match).
- **FR-006**: System MUST provide a sort dropdown with options: "Last updated" (default), "Name (A-Z)", "Name (Z-A)", "Newest first", "Oldest first".
- **FR-007**: Filtering and sorting MUST be performed client-side with no perceptible delay.
- **FR-008**: System MUST display an empty state message when no projects match the search term.

**Project Description on Cards**

- **FR-009**: Project cards MUST display the project description truncated to a maximum of 3 lines with an ellipsis.
- **FR-010**: Project cards MUST show placeholder text ("No description") when a project has no description.

**Breadcrumb Navigation**

- **FR-011**: System MUST display a breadcrumb trail on all project subpages showing the navigation path (e.g., "Projects > Project Name > Phase").
- **FR-012**: Each breadcrumb segment MUST be a clickable link that navigates to the corresponding page.
- **FR-013**: Long project names in the breadcrumb MUST be truncated with an ellipsis to prevent layout overflow.

**Progress Indicator for AI Operations**

- **FR-014**: System MUST display an animated progress indicator during all AI generation, evaluation, and deep analysis operations.
- **FR-015**: The progress indicator MUST replace the current static "Generating..." text with a visually richer animation (e.g., skeleton preview, pulsing bar).
- **FR-016**: The progress indicator MUST disappear immediately when the operation completes or fails.

**Export Success Feedback**

- **FR-017**: System MUST display a success toast notification after each successful export action, naming the exported artifact.
- **FR-018**: System MUST display an error toast if an export operation fails.

**Chat Panel Resize**

- **FR-019**: System MUST provide a drag handle on the left edge of the chat panel on desktop viewports.
- **FR-020**: Users MUST be able to resize the chat panel between 320px (minimum) and 640px (maximum) width.
- **FR-021**: System MUST persist the user's preferred chat panel width across sessions.
- **FR-022**: The resize handle MUST NOT appear on mobile viewports where the chat panel is full-width.

**Responsive Traceability Table**

- **FR-023**: The traceability matrix MUST be horizontally scrollable when the viewport is narrower than the full table width.
- **FR-024**: The first column (requirement labels) MUST remain fixed (sticky) during horizontal scrolling.

**Project Archiving**

- **FR-025**: Users MUST be able to archive a project from the project card.
- **FR-026**: Archived projects MUST be hidden from the default project list view.
- **FR-027**: System MUST provide a toggle to show/hide archived projects on the project list page.
- **FR-028**: Users MUST be able to unarchive a project to restore it to the active list.
- **FR-029**: Archived projects MUST remain fully accessible (viewable and editable) when opened.
- **FR-030**: Both Archive and Delete actions MUST be available on all projects regardless of archive status. Delete permanently removes the project (with confirmation); Archive soft-hides it.

### Key Entities

- **Project** (extended): Gains an optional archived timestamp to track archive status. A project is considered archived when this timestamp is present and unarchived when it is cleared.
- **Toast Notification**: A transient UI message with a type (success, error, warning), message text, and optional auto-dismiss duration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can locate a specific project from a list of 20+ projects in under 5 seconds using the search bar.
- **SC-002**: All user-initiated actions (generation, approval, export) provide visible feedback within 500ms of completion or failure.
- **SC-003**: Users can identify their current location within the application at all times via the breadcrumb trail.
- **SC-004**: The traceability matrix is fully usable on viewports as narrow as 768px without losing context of which requirement is being viewed.
- **SC-005**: Users can resize the chat panel and have their preference remembered across browser sessions.
- **SC-006**: Users can archive and restore projects without any data loss.
- **SC-007**: Zero transient error/warning banners remain in the application — all transient feedback uses toast notifications. Persistent instructional banners (e.g., "spec must be reviewed") and empty-state banners are exempt.
- **SC-008**: AI operations display animated progress feedback for the entire duration of the operation, eliminating static "Generating..." text.

## Assumptions

- The existing Sonner toast library (already installed and integrated globally) is the notification system. No new notification library is needed.
- Client-side filtering/sorting on the project list is sufficient since all project data is already loaded via Dexie live queries.
- The chat panel resize feature is desktop-only; mobile continues to use full-width overlay behavior.
- Project archiving uses a soft-archive approach (timestamp-based) rather than a separate "archived" boolean, allowing future use of the archive date for display purposes.
- The breadcrumb component is displayed inside the project layout, below the global header and above the phase navigation tabs.
- The progress indicator for AI operations replaces the existing text-based status messages in the same UI locations (section editors, evaluation panel).

## Dependencies

- **User Story 6** (Export Feedback) depends on **User Story 1** (Toast Notifications) being implemented first.
- **User Story 5** (Progress Indicator) should be implemented after **User Story 1** (Toast Notifications) so error states during AI operations use toasts.
- All other stories are independent and can be developed in parallel.

## Out of Scope

- Real-time collaboration or multi-user features.
- Server-side search or pagination (client-side is sufficient for the current data model).
- Custom notification preferences or notification center/history.
- Chat panel resize on mobile devices.
- Bulk archive/unarchive actions.
