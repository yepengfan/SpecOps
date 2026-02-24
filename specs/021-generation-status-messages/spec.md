# Feature Specification: Animated Status Messages During Generation

**Feature Branch**: `021-generation-status-messages`
**Created**: 2026-02-24
**Status**: Draft
**Input**: User description: "When users click Generate on spec/plan/tasks pages, the only feedback is the button text changing to 'Generating...' and section-level skeletons. The wait can be several seconds (streaming from Claude). Add a fun, phase-specific animated status message component that rotates witty messages with emoji, making the wait feel shorter. The component should: accept a phase prop (spec, plan, tasks) to show phase-specific messages, accept an isActive prop to control visibility, rotate through 5 messages every 3 seconds, animate message transitions with Framer Motion AnimatePresence (fade and slide), respect prefers-reduced-motion, and show a subtle animated progress bar below messages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rotating Status Messages During Generation (Priority: P1)

A user clicks "Generate" on any phase page (spec, plan, or tasks) and waits for the AI to stream a response. Instead of only seeing "Generating..." on the button, a status area appears below the button showing a rotating message with an emoji — such as "Thinking deeply..." with a brain emoji. The messages change every few seconds, cycling through phase-relevant text. A subtle animated progress bar underneath reinforces a sense of ongoing activity. When generation completes, the status area disappears.

**Why this priority**: This is the core feature — providing engaging visual feedback during the longest wait in the app. Every user encounters this when generating content, and reduced perceived wait time directly improves user satisfaction.

**Independent Test**: Can be fully tested by clicking Generate on any phase page and observing rotating status messages with a progress indicator that disappear when generation completes.

**Acceptance Scenarios**:

1. **Given** a user clicks Generate on the spec page, **When** the AI is streaming a response, **Then** a status area appears below the button showing the first spec-specific message with an emoji.
2. **Given** the status area is visible during generation, **When** approximately 3 seconds pass, **Then** the current message transitions smoothly to the next message in the cycle.
3. **Given** all messages in the cycle have been shown, **When** 3 more seconds pass, **Then** the messages wrap around to the first message and continue cycling.
4. **Given** generation completes (success or error), **When** the streaming finishes, **Then** the status area disappears immediately.
5. **Given** a user clicks Generate again after a previous generation, **When** the status appears, **Then** it starts from the first message in the cycle (not where the previous cycle ended).
6. **Given** the status area is visible, **When** the user looks below the messages, **Then** a subtle animated progress bar is visible, reinforcing that work is ongoing.

---

### User Story 2 - Phase-Specific Message Sets (Priority: P1)

Each generation phase (spec, plan, tasks) shows its own set of thematically appropriate messages. The spec phase shows research and writing-themed messages, the plan phase shows architecture and design messages, and the tasks phase shows breakdown and dependency messages. This gives users a sense that the AI is performing phase-relevant work rather than showing generic loading text.

**Why this priority**: Phase-specific messages reinforce the purpose of each generation step. Without distinct messages, the feature would feel like generic loading text and lose its charm. This is integral to the core value proposition.

**Independent Test**: Can be tested by triggering generation on each of the three phase pages and verifying that each displays its own unique set of messages.

**Acceptance Scenarios**:

1. **Given** a user generates a spec, **When** the status messages rotate, **Then** they see spec-themed messages such as "Crafting requirements..." and "Analyzing constraints...".
2. **Given** a user generates a plan, **When** the status messages rotate, **Then** they see plan-themed messages such as "Architecting the plan..." and "Designing components...".
3. **Given** a user generates tasks, **When** the status messages rotate, **Then** they see tasks-themed messages such as "Breaking down tasks..." and "Mapping dependencies...".
4. **Given** the user switches between phase pages and generates on each, **When** comparing the messages, **Then** no two phases share the same message set.

---

### User Story 3 - Accessible Status Feedback (Priority: P2)

A user who relies on a screen reader or has reduced motion preferences enabled still receives meaningful feedback during generation. The status area is announced by screen readers when messages change. When the user has `prefers-reduced-motion` enabled, messages still rotate on schedule but swap instantly without visual animation effects.

**Why this priority**: Accessibility is essential but not the core differentiator. The status area must work for all users, but the primary value is visual delight for the majority who see animations.

**Independent Test**: Can be tested by enabling `prefers-reduced-motion` in browser settings and verifying messages rotate without animation, and by inspecting the DOM for proper accessibility attributes.

**Acceptance Scenarios**:

1. **Given** `prefers-reduced-motion` is enabled in the user's system, **When** the status messages rotate, **Then** messages change instantly without any fade or slide transition.
2. **Given** a screen reader is active, **When** the status message changes, **Then** the screen reader announces the new message without interrupting current speech.
3. **Given** `prefers-reduced-motion` is enabled, **When** the progress bar is displayed, **Then** it still appears below the messages (the bar's pulsing animation may be reduced per system preference).

---

### Edge Cases

- What happens when generation fails immediately (error before any streaming)? The status area appears briefly then disappears when the generating state becomes false — no stale messages left on screen.
- What happens when the AI response returns before the first 3-second rotation? Only the first message is shown; no rotation occurs. The status area disappears cleanly when generation ends.
- What happens when the user navigates away from the page during generation? The message rotation timer is cleaned up to prevent memory leaks or errors from updating unmounted state.
- What happens when the user triggers generation while the previous status is still visible? The messages reset to the beginning of the cycle for the new generation attempt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a status message area below the Generate button when AI generation is in progress on any phase page (spec, plan, tasks).
- **FR-002**: System MUST rotate through a set of 5 phase-specific messages every 3 seconds during generation, cycling back to the first message after the last.
- **FR-003**: System MUST animate message transitions with a fade and vertical slide effect completing within 200 milliseconds.
- **FR-004**: System MUST display a distinct set of thematically appropriate messages for each phase (spec, plan, tasks) — no shared messages between phases.
- **FR-005**: System MUST display a continuously animated progress bar below the status messages during generation.
- **FR-006**: System MUST hide the entire status area (messages and progress bar) when generation is not active.
- **FR-007**: System MUST reset to the first message in the cycle each time a new generation starts.
- **FR-008**: System MUST skip all visual animation effects and show messages statically when the user's system has `prefers-reduced-motion` enabled.
- **FR-009**: System MUST mark the status area as an accessible live region so assistive technologies announce message changes.
- **FR-010**: System MUST clean up rotation timers when the status area is removed or generation ends, preventing resource leaks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see a rotating phase-specific status message with emoji during generation on all three phase pages (spec, plan, tasks).
- **SC-002**: Messages rotate every 3 seconds with a smooth transition completing within 200 milliseconds.
- **SC-003**: Each phase page displays its own unique set of 5 messages — no message appears in more than one phase.
- **SC-004**: Users with `prefers-reduced-motion` enabled see messages change instantly without visual animation.
- **SC-005**: Assistive technology users receive status announcements when messages change, verified by the presence of appropriate accessibility attributes.
- **SC-006**: All pre-existing automated tests continue to pass after the feature is integrated.
- **SC-007**: The new component has unit test coverage for rendering, rotation timing, message reset, phase-specific content, accessibility attributes, and reduced motion behavior.
