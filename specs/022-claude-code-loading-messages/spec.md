# Feature Specification: Claude Code-Style Loading Messages

**Feature Branch**: `022-claude-code-loading-messages`
**Created**: 2026-02-25
**Status**: Draft
**Input**: User request to replace phase-specific generation status messages with Claude Code-style thinking verbs — a single shared message set used across all phases, with random (not sequential) selection and emoji prefixes retained.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shared Thinking Messages Across All Phases (Priority: P1)

A user clicks "Generate" on any phase page (spec, plan, or tasks) and sees a rotating status message drawn from a single shared set of Claude Code-style thinking verbs with emoji prefixes. The messages are the same regardless of which phase is generating. Messages are selected randomly (not sequentially), and the same message never appears twice in a row.

**Why this priority**: This is the entire feature — replacing the phase-specific message sets with a unified set of thinking verbs that feel like Claude Code's style.

**Independent Test**: Click Generate on spec, plan, and tasks pages → verify the same set of messages is used across all phases, messages appear randomly, and no consecutive repeat occurs.

**Acceptance Scenarios**:

1. **Given** a user clicks Generate on the spec page, **When** the AI is streaming, **Then** a status message appears from the shared thinking verb set (e.g., "Thinking...", "Analyzing...", "Reasoning...").
2. **Given** a user clicks Generate on the plan page, **When** the AI is streaming, **Then** the same shared message set is used (not plan-specific messages).
3. **Given** a user clicks Generate on the tasks page, **When** the AI is streaming, **Then** the same shared message set is used (not tasks-specific messages).
4. **Given** the status area is visible during generation, **When** approximately 3 seconds pass, **Then** a new message is randomly selected from the set, different from the current message.
5. **Given** the current message is "Thinking...", **When** the next message is selected, **Then** it is never "Thinking..." again (no consecutive repeats).
6. **Given** generation ends and starts again, **When** the status reappears, **Then** a randomly selected initial message is shown (not always the same starting message).

---

### Edge Cases

- What happens when generation starts? A random message from the shared set is displayed (not always the first message in the array).
- What happens when the message rotates? A random message is selected, excluding the currently displayed message, preventing consecutive repeats.
- What happens with reduced motion? Behavior is unchanged from 021 — messages still rotate but swap instantly without animation.
- What happens with accessibility? Behavior is unchanged from 021 — `role="status"` and `aria-live="polite"` remain.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use a single shared set of 10 status messages across all phases (spec, plan, tasks), replacing the previous phase-specific message sets.
- **FR-002**: System MUST select messages randomly (not sequentially) during rotation.
- **FR-003**: System MUST avoid displaying the same message consecutively (no repeat of the current message on the next rotation).
- **FR-004**: System MUST select a random initial message when generation starts (not always the same starting message).
- **FR-005**: System MUST retain emoji prefixes on all messages.
- **FR-006**: System MUST continue to accept the `phase` prop for API compatibility (callers pass it, but it no longer affects message selection).
- **FR-007**: System MUST NOT require changes to the three phase page files (`spec/page.tsx`, `plan/page.tsx`, `tasks/page.tsx`).

### Non-Functional Requirements

- **NFR-001**: All existing behavior (3s rotation interval, Framer Motion transitions, reduced motion handling, accessibility attributes, progress bar) MUST be preserved.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All three phase pages display messages from the same shared set of 10 thinking verbs.
- **SC-002**: Messages rotate randomly every 3 seconds with no consecutive repeats.
- **SC-003**: The `phase` prop is accepted but does not influence which messages are shown.
- **SC-004**: All existing and updated tests pass (`npm test`).
- **SC-005**: No lint errors (`npm run lint`).
