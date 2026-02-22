# Feature Specification: Rename Project

**Feature Branch**: `012-rename-project`
**Created**: 2026-02-23
**Status**: Draft
**Input**: User description: "Add the ability to rename a project after it has been created. Users should be able to click on the project name in the project layout header and edit it inline. The name should be saved immediately and reflected everywhere the project name is displayed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inline Rename in Project View (Priority: P1)

A user has created a project and wants to change its name. They click on the project name displayed in the project header. The name becomes an editable text field. They type the new name and press Enter (or click away) to confirm. The new name is saved immediately and displayed throughout the application.

**Why this priority**: This is the core feature — users need a way to rename projects directly from the project view, which is the most common context where renaming is desired.

**Independent Test**: Create a project, navigate to it, click the project name, type a new name, press Enter, and verify the name is updated in the header, in the browser, and on the project list when navigating back.

**Acceptance Scenarios**:

1. **Given** a user is viewing a project, **When** they click on the project name in the header, **Then** the name becomes an editable text field pre-filled with the current name.
2. **Given** the project name is in edit mode, **When** the user types a new name and presses Enter, **Then** the name is saved immediately and the field returns to display mode showing the new name.
3. **Given** the project name is in edit mode, **When** the user clicks outside the field (blur), **Then** the name is saved immediately and the field returns to display mode.
4. **Given** the project name is in edit mode, **When** the user presses Escape, **Then** the edit is cancelled, the original name is restored, and the field returns to display mode.
5. **Given** the user renames a project, **When** they navigate back to the project list, **Then** the project card displays the updated name.

---

### User Story 2 - Validation and Error Handling (Priority: P2)

A user attempts to rename a project to an invalid name (empty or whitespace-only). The system prevents the rename and keeps the original name.

**Why this priority**: Validation ensures data integrity and prevents projects from having blank names, but the core rename flow must work first.

**Independent Test**: Attempt to rename a project to an empty string and verify the original name is preserved.

**Acceptance Scenarios**:

1. **Given** the project name is in edit mode, **When** the user clears the field and presses Enter, **Then** the original name is restored and no save occurs.
2. **Given** the project name is in edit mode, **When** the user enters only whitespace and presses Enter, **Then** the original name is restored and no save occurs.
3. **Given** the project name is in edit mode, **When** the user enters the same name (unchanged) and presses Enter, **Then** no save occurs and the field returns to display mode.

---

### Edge Cases

- What happens when the user double-clicks the project name? The field should enter edit mode (same as single click), not select the word.
- What happens if a save fails due to a storage error? The name in the header should revert to the last successfully saved name and display a brief error indication.
- What happens if the user pastes a very long name? The name should be accepted but truncated in display contexts (project card) via standard text overflow handling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to click the project name in the project header to enter inline edit mode.
- **FR-002**: The inline edit field MUST be pre-filled with the current project name and the text MUST be fully selected for easy replacement.
- **FR-003**: System MUST save the new project name immediately when the user presses Enter or the field loses focus (blur).
- **FR-004**: System MUST cancel the rename and restore the original name when the user presses Escape.
- **FR-005**: System MUST reject empty or whitespace-only names and restore the original name without saving.
- **FR-006**: System MUST skip saving when the new name is identical to the current name.
- **FR-007**: The updated project name MUST be reflected on the project card in the project list without requiring a page refresh.
- **FR-008**: The project name edit field MUST be keyboard accessible — users can tab to the name and press Enter to begin editing.

### Key Entities

- **Project**: Existing entity. The `name` field (string, required, non-empty) is the attribute being updated by this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can rename a project in under 3 seconds (click, type, confirm).
- **SC-002**: 100% of rename operations are persisted immediately — navigating away and returning shows the updated name.
- **SC-003**: Invalid rename attempts (empty name) are blocked with zero data loss — the original name is always preserved.
- **SC-004**: The rename interaction is fully keyboard accessible — no mouse required to initiate, confirm, or cancel a rename.

## Assumptions

- There are no restrictions on project name uniqueness — multiple projects may share the same name.
- There is no maximum character limit enforced on project names beyond what the storage layer supports.
- The rename operation does not affect any other project data (phases, evaluations, traceability mappings).
