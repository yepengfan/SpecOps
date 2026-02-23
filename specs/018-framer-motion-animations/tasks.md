# Tasks: Framer Motion Animations

**Input**: Design documents from `/specs/018-framer-motion-animations/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: TDD approach — write tests first, verify they fail, then implement. Unit tests are part of code review.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## User Story Mapping

| Story | Priority | Title | Requirements |
|-------|----------|-------|--------------|
| US4 | P2 | Centralized Animation Configuration | FR-005 |
| US1 | P1 | Smooth Tab Content Transitions | FR-001, FR-004, FR-006, FR-007 |
| US2 | P2 | Animated Collapsible Sections | FR-002, FR-004, FR-007, FR-008 |
| US3 | P3 | Staggered Project Card Entry | FR-003, FR-004 |

> **Note**: US4 (Centralized Config) is listed first because it is foundational infrastructure that US1, US2, and US3 all depend on.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install framer-motion dependency and configure test environment

- [ ] T001 Install framer-motion dependency via `npm install framer-motion`
- [ ] T002 Add framer-motion Jest mock to `jest.setup.ts` — mock `motion.div` as plain `div`, `AnimatePresence` as passthrough, `useReducedMotion` returning `false`

**Checkpoint**: `npm test` passes with framer-motion mock active. No existing tests broken.

---

## Phase 2: Foundational — US4 Centralized Animation Configuration (Priority: P2)

**Goal**: Create a shared animation variants file that all animated components will import from.

**Independent Test**: Verify that the file exports the correct variant objects with expected keys, durations, and easing values.

**⚠️ CRITICAL**: No user story work (US1, US2, US3) can begin until this phase is complete.

### Tests for Foundational

> **Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T003 [US4] Write unit tests for shared animation variants in `__tests__/lib/motion.test.ts` — test that `fadeSlideVariants` has `initial`/`animate`/`exit` keys, `staggerContainerVariants` has `staggerChildren: 0.06`, `staggerItemVariants` has `initial`/`animate` keys, and `pageTransition` has `duration` ≤ 0.3 and `ease` defined

### Implementation for Foundational

- [ ] T004 [US4] Create shared animation variants file at `lib/motion.ts` — export `fadeSlideVariants` (fade + vertical slide for page transitions), `staggerContainerVariants` (container with `staggerChildren: 0.06`), `staggerItemVariants` (individual item fade+rise, 250ms), and `pageTransition` (200ms easeOut transition config)

**Checkpoint**: `npm test` passes — T003 tests now green. `lib/motion.ts` exports all expected variants.

---

## Phase 3: User Story 1 — Smooth Tab Content Transitions (Priority: P1) 🎯 MVP

**Goal**: Animate tab content transitions with fade+slide when switching between project tabs.

**Independent Test**: Navigate between any two project tabs and observe smooth fade+slide transition on content area.

### Tests for User Story 1

> **Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T005 [US1] Write unit tests for tab transition template in `__tests__/app/project/template.test.tsx` — test that it renders children, wraps content in AnimatePresence and motion.div, keys on pathname, and renders plain children (no AnimatePresence) when reduced motion is active

### Implementation for User Story 1

- [ ] T006 [US1] Create tab content transition wrapper at `app/project/[id]/template.tsx` — use `AnimatePresence mode="wait"` + `motion.div` with `fadeSlideVariants` and `pageTransition` from `lib/motion.ts`, key on `usePathname()`, respect `useReducedMotion()` by rendering plain children when active

**Checkpoint**: `npm test` passes — T005 tests now green. Tab switching shows fade+slide animation. Rapid tab switches handled gracefully.

---

## Phase 4: User Story 2 — Animated Collapsible Sections (Priority: P2)

**Goal**: Replace instant show/hide of collapsible sections with smooth height animation.

**Independent Test**: Click any section header in a generated spec phase and observe smooth height expand/collapse animation.

### Tests for User Story 2

> **Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US2] Write unit tests for `AnimatedCollapsibleContent` in `__tests__/components/ui/collapsible.test.tsx` — test that it renders children when `isOpen` is true, hides children when `isOpen` is false, uses `AnimatePresence` and `motion.div` for animation, and renders instant show/hide when reduced motion is active
- [ ] T008 [P] [US2] Write unit tests for gated-phase-page animated collapsible integration in `__tests__/components/phase/gated-phase-page.test.tsx` — test that sections use `AnimatedCollapsibleContent` with correct `isOpen` prop derived from section open state

### Implementation for User Story 2

- [ ] T009 [US2] Add `AnimatedCollapsibleContent` component to `components/ui/collapsible.tsx` — accepts `isOpen` prop, uses `AnimatePresence` + `motion.div` with `height: 0 ↔ "auto"` animation, sets `overflow: hidden` during animation and `visible` after expand completes, falls back to instant show/hide when `useReducedMotion()` is true
- [ ] T010 [US2] Update `components/phase/gated-phase-page.tsx` to import and use `AnimatedCollapsibleContent` — replace `<CollapsibleContent>` with `<AnimatedCollapsibleContent isOpen={isSectionOpen(section.id)}>`, keep Radix `Collapsible` root + trigger for state management and ARIA

**Checkpoint**: `npm test` passes — T007 and T008 tests now green. Section expand/collapse animates smoothly. Keyboard navigation and ARIA attributes preserved.

---

## Phase 5: User Story 3 — Staggered Project Card Entry (Priority: P3)

**Goal**: Project cards on the home page animate in with a staggered entrance effect.

**Independent Test**: Load home page with at least 3 projects and observe sequential card stagger animation.

### Tests for User Story 3

> **Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [US3] Write unit tests for staggered project list in `__tests__/components/ui/project-list.test.tsx` — test that project cards are wrapped in `motion.div` containers using `staggerContainerVariants` and `staggerItemVariants`, and that reduced motion skips animations (`initial={false}`)

### Implementation for User Story 3

- [ ] T012 [US3] Update `components/ui/project-list.tsx` to wrap the project card grid in `motion.div` with `staggerContainerVariants` and wrap each `<ProjectCard>` in `motion.div` with `staggerItemVariants` — use `initial={false}` when `useReducedMotion()` returns true to skip all animations

**Checkpoint**: `npm test` passes — T011 tests now green. Home page cards stagger in. Skeleton loading state does NOT animate.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build verification, lint, and final validation

- [ ] T013 Run `npm run build` to verify no build errors
- [ ] T014 Run `npm run lint` to verify no lint errors
- [ ] T015 Run `npm test` to verify all tests pass (full suite)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — can start after foundational completes
- **US2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 2 — can run in parallel with US1 and US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US4 (Foundational)**: No story dependencies — provides `lib/motion.ts` that all stories import
- **US1 (Tab Transitions)**: Depends on US4 only — creates new file `template.tsx`
- **US2 (Collapsible)**: Depends on US4 only — modifies `collapsible.tsx` and `gated-phase-page.tsx`
- **US3 (Staggered Cards)**: Depends on US4 only — modifies `project-list.tsx`

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation tasks are sequential within each story
- Story complete before moving to next priority (unless parallelizing)

### Parallel Opportunities

- T007 and T008 (US2 tests) can run in parallel — different test files
- US1, US2, and US3 can all start in parallel after Phase 2 — they modify different files with no shared dependencies

---

## Parallel Example: User Story 2

```bash
# Launch tests for US2 in parallel (different files):
Task: "Write AnimatedCollapsibleContent tests in __tests__/components/ui/collapsible.test.tsx"
Task: "Write gated-phase-page integration tests in __tests__/components/phase/gated-phase-page.test.tsx"

# Then implement sequentially (T010 depends on T009):
Task: "Add AnimatedCollapsibleContent to components/ui/collapsible.tsx"
Task: "Update gated-phase-page.tsx to use AnimatedCollapsibleContent"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install dependency + jest mock)
2. Complete Phase 2: Foundational (shared variants file)
3. Complete Phase 3: User Story 1 (tab transitions)
4. **STOP and VALIDATE**: Test tab switching animation independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Tab Transitions) → Test independently → Commit (MVP!)
3. Add US2 (Collapsible) → Test independently → Commit
4. Add US3 (Staggered Cards) → Test independently → Commit
5. Polish → Build + Lint + Full test suite → Final commit
6. Each story adds visual polish without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- TDD: Write tests first, verify they fail (red), implement (green), then commit
- Commit after each completed user story for atomic, reviewable increments
- All animations degrade gracefully when prefers-reduced-motion is enabled
