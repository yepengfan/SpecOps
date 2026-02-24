# Tasks: Animated Status Messages During Generation

**Input**: Design documents from `/specs/021-generation-status-messages/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-contracts.md

**Tests**: TDD approach — write tests first, verify they fail, then implement. Required by project constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## User Story Mapping

| Story | Priority | Title | Requirements |
|-------|----------|-------|--------------|
| US1 | P1 | Rotating Status Messages During Generation | FR-001, FR-002, FR-003, FR-005, FR-006, FR-007, FR-010 |
| US2 | P1 | Phase-Specific Message Sets | FR-004 |
| US3 | P2 | Accessible Status Feedback | FR-008, FR-009 |

> **Note**: US1 and US2 are co-implemented in a single component (`generation-status.tsx`) since phase-specific messages are the content that the rotation mechanism displays. US3 (accessibility) is built into the same component but tested independently.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup tasks needed — all dependencies (Framer Motion, Tailwind CSS) are already installed and Framer Motion is already mocked in `jest.setup.ts`.

*(Phase intentionally empty — proceed directly to user stories)*

---

## Phase 2: User Story 1+2 — Rotating Phase-Specific Status Messages (Priority: P1) 🎯 MVP

**Goal**: Create the `GenerationStatus` component that displays rotating messages with emoji, cycling every 3 seconds with fade+slide animation, and a CSS progress bar. Each phase (spec, plan, tasks) has its own distinct set of 5 messages.

**Independent Test**: Click Generate on any phase page → see rotating phase-specific messages with a progress bar that disappear when generation completes.

### Tests for User Story 1+2

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T001 [US1] Write unit tests for core rendering behavior in `__tests__/unit/generation-status.test.tsx` — test that component returns null when `isActive` is false, shows first message when active, renders a progress bar element when active
- [x] T002 [US1] Write unit tests for rotation behavior in `__tests__/unit/generation-status.test.tsx` — test that messages rotate every 3 seconds (using `jest.useFakeTimers` and `jest.advanceTimersByTime`), wrap around to first message after all 5 shown, and reset to first message when deactivated and reactivated
- [x] T003 [P] [US2] Write unit tests for phase-specific messages in `__tests__/unit/generation-status.test.tsx` — test that spec phase shows "🧠 Thinking deeply...", plan phase shows "🏗️ Architecting the plan...", tasks phase shows "📝 Breaking down tasks..."

### Implementation for User Story 1+2

- [x] T004 [US1] Create `GenerationStatus` component at `components/ui/generation-status.tsx` — implement `phase` and `isActive` props per `contracts/ui-contracts.md`, message rotation via `setInterval` (3000ms) with `useState` index, `AnimatePresence mode="wait"` with `motion.span` (opacity 0→1 y 4→0 enter, opacity 1→0 y 0→-4 exit, `pageTransition` from `lib/motion.ts`), CSS progress bar (`h-1 animate-pulse bg-gradient-to-r from-primary/40 via-primary to-primary/40`), render-time state reset pattern for index (per research.md R5), `useEffect` cleanup for interval timer

**Checkpoint**: `npm test` passes — T001-T003 tests now green. Component renders with all three phase-specific message sets and rotating behavior.

---

## Phase 3: User Story 3 — Accessible Status Feedback (Priority: P2)

**Goal**: Ensure the status area is accessible to screen readers via ARIA live region attributes and that `prefers-reduced-motion` users see messages without animation.

**Independent Test**: Enable `prefers-reduced-motion` → messages rotate without animation. Inspect DOM → `role="status"` and `aria-live="polite"` present.

### Tests for User Story 3

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [US3] Write unit tests for accessibility in `__tests__/unit/generation-status.test.tsx` — test that `role="status"` is present on the container when active, and that when `useReducedMotion` returns `true` the message still renders (as a plain `<span>`, not `motion.span`)

### Implementation for User Story 3

- [x] T006 [US3] Add accessibility attributes and reduced motion handling to `components/ui/generation-status.tsx` — add `role="status"` and `aria-live="polite"` to the container `<div>`, conditionally render plain `<span>` (no `AnimatePresence`) when `useReducedMotion()` returns `true` (per research.md R4)

> **Note**: If T004 already implements accessibility as part of the core component (recommended), T006 becomes a verification step. The test in T005 still validates the behavior independently.

**Checkpoint**: `npm test` passes — T005 tests now green. Component is fully accessible.

---

## Phase 4: Integration

**Purpose**: Add `<GenerationStatus>` to the three phase pages between the Generate button and the gated content area.

- [x] T007 [P] Import and render `<GenerationStatus phase="spec" isActive={isGenerating} />` in `app/project/[id]/spec/page.tsx` — insert between the `<Button>` (line ~149) and the `{isEmpty && !isGenerating && (` block
- [x] T008 [P] Import and render `<GenerationStatus phase="plan" isActive={isGenerating} />` in `app/project/[id]/plan/page.tsx` — insert between the `<Button>` (line ~157) and the `{project && !specReviewed && (` block
- [x] T009 [P] Import and render `<GenerationStatus phase="tasks" isActive={isGenerating} />` in `app/project/[id]/tasks/page.tsx` — insert between the `<Button>` (line ~164) and the `{project && !planReviewed && (` block

**Checkpoint**: All three pages render the status component during generation. Existing page tests still pass.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Build verification, lint, and final validation

- [x] T010 Run `npm run lint` to verify no lint errors
- [x] T011 Run `npm test` to verify all tests pass (full suite including new generation-status tests)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Skipped — no setup needed
- **US1+US2 (Phase 2)**: No dependencies — can start immediately
- **US3 (Phase 3)**: Depends on Phase 2 (component must exist to add accessibility)
- **Integration (Phase 4)**: Depends on Phase 2 (component must exist to import)
- **Polish (Phase 5)**: Depends on Phase 2, 3, and 4

### User Story Dependencies

- **US1+US2 (Rotating Phase-Specific Messages)**: No dependencies — creates the new component
- **US3 (Accessible Status Feedback)**: Depends on US1+US2 — adds/verifies accessibility in the same component
- US3 can start as soon as T004 is complete (component exists)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation tasks are sequential within each story
- Story complete before moving to next priority

### Parallel Opportunities

- T001 and T003 can be written in parallel (different test concerns in the same file, but no conflicts)
- T007, T008, and T009 can all run in parallel (different page files, no shared dependencies)
- Phase 3 (US3) can start as soon as Phase 2 implementation (T004) is complete
- Phase 4 (Integration) can start as soon as Phase 2 implementation (T004) is complete, in parallel with Phase 3

---

## Implementation Strategy

### MVP First (User Stories 1+2)

1. Complete Phase 2: Write tests (T001-T003) → Implement component (T004)
2. **STOP and VALIDATE**: Run `npx jest __tests__/unit/generation-status.test.tsx` — all core tests pass
3. This delivers the full visual experience — messages rotate with animation and phase-specific content

### Incremental Delivery

1. US1+US2 → Core component with rotation and phase messages → Test independently → Commit
2. US3 → Add/verify accessibility (T005-T006) → Test independently → Commit
3. Integration → Add to all three pages (T007-T009) → Commit
4. Polish → Lint + full test suite (T010-T011) → Commit
5. Each step adds value without breaking previous work

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- TDD: Write tests first, verify they fail (red), implement (green), then commit
- All message sets contain 5 messages each with emoji prefixes (see contracts/ui-contracts.md for exact text)
- Component reuses `pageTransition` from `lib/motion.ts` — no new animation configuration needed
- ESLint `react-hooks/set-state-in-effect` rule requires "adjust state during render" pattern for index reset (see research.md R5)
- Framer Motion is already mocked in `jest.setup.ts` — no test infrastructure changes needed
