# Feature Specification: Default Overview Tab

**Feature Branch**: `017-default-overview-tab`
**Created**: 2026-02-23
**Status**: Draft
**Input**: User description: "When a user clicks a project card from the project list, the default landing page should be the Overview tab instead of the active phase tab. Currently the project card links directly to the active phase, bypassing the overview dashboard. Change the navigation target so users always land on the project overview dashboard first."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Project Card Opens Overview (Priority: P1)

A user on the project list page clicks on a project card. Instead of being taken directly to the project's active phase (e.g., Spec, Plan, or Tasks), they land on the Overview tab — the project dashboard that shows phase progress, evaluation summaries, and traceability coverage at a glance. This gives the user a holistic view of project health before diving into a specific phase.

**Why this priority**: This is the only user story — it is the entire scope of the change. Users currently bypass the overview dashboard entirely when opening projects from the list, which defeats the purpose of having an overview page.

**Independent Test**: Click any project card from the project list. Verify that the browser navigates to the project's Overview tab and the overview dashboard content is displayed.

**Acceptance Scenarios**:

1. **Given** a user is on the project list page, **When** they click a project card, **Then** they are navigated to that project's Overview tab
2. **Given** a user clicks a project card for a project with no generated content, **When** the Overview tab loads, **Then** the overview dashboard displays correctly (showing empty/locked phase states)
3. **Given** a user clicks a project card for a project with generated content and evaluations, **When** the Overview tab loads, **Then** the overview dashboard displays phase statuses, evaluation summaries, and traceability coverage

---

### Edge Cases

- What happens if the user navigates directly to a phase URL (e.g., bookmarked link)? Navigation to specific phase URLs continues to work as before — this change only affects the project card link target.
- What happens if the overview page has not been implemented yet? Not applicable — the overview page already exists and is functional.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Clicking a project card from the project list MUST navigate the user to the project's Overview tab
- **FR-002**: Direct navigation to specific phase URLs (e.g., via bookmarks or typed URLs) MUST continue to work unchanged

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of project card clicks from the project list navigate to the Overview tab
- **SC-002**: All existing navigation paths (direct URLs, phase tab clicks, browser back/forward) continue to function correctly with zero regressions
- **SC-003**: All existing automated tests pass after the change

## Assumptions

- The Overview tab and dashboard page already exist and are fully functional
- No changes are needed to the Overview page itself — only the navigation target of the project card changes
- This change affects only the project card link; all other navigation entry points remain unchanged
