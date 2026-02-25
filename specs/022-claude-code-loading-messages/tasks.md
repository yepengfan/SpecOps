# Tasks: Claude Code-Style Loading Messages

**Input**: Design documents from `/specs/022-claude-code-loading-messages/`
**Prerequisites**: plan.md (required), spec.md (required), contracts/ui-contracts.md

**Tests**: TDD approach — write tests first, verify they fail, then implement. Required by project constitution.

**Organization**: Single user story — all tasks are sequential.

## Format: `[ID] Description`

## User Story Mapping

| Story | Priority | Title | Requirements |
|-------|----------|-------|--------------|
| US1 | P1 | Shared Thinking Messages Across All Phases | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, NFR-001 |

---

## Phase 1: Setup

**Purpose**: No setup tasks needed — no new dependencies.

*(Phase intentionally empty — proceed directly to implementation)*

---

## Phase 2: Tests First (TDD Red Phase)

**Goal**: Update existing tests to reflect new shared-message and random-selection behavior. Tests should fail against the current (021) implementation.

- [x] T001 [US1] Update unit tests in `__tests__/unit/generation-status.test.tsx` — modify T001 (core rendering) to check for any message from the shared set instead of a specific phase message; modify T002 (rotation) to mock `Math.random` for deterministic assertions on random selection and repeat avoidance; replace T003 (phase-specific) with a test verifying the same message set is used regardless of phase; update T005 (accessibility) to work with random initial message via `Math.random` mock

**Checkpoint**: Tests FAIL against current implementation (expected — messages and selection logic have changed).

---

## Phase 3: Implementation (TDD Green Phase)

**Goal**: Modify the component to use shared messages with random selection.

- [x] T002 [US1] Modify `components/ui/generation-status.tsx` — replace `Record<Phase, string[]>` with a flat `string[]` of 10 Claude Code-style thinking verbs with emoji; add `randomIndex(exclude)` helper function for random selection with repeat avoidance; update initial state to use `randomIndex(-1)`; update `setInterval` callback to use `randomIndex(prev)`; update reactivation reset to use `randomIndex(-1)`; remove `phase` from `useEffect` dependency array; keep `phase` in interface for API compatibility

**Checkpoint**: `npx jest __tests__/unit/generation-status.test.tsx` — all tests pass.

---

## Phase 4: Verification

- [x] T003 Run `npm run lint` — no lint errors
- [x] T004 Run `npm test` — all tests pass (full suite, 420+ tests)

---

## Dependencies & Execution Order

- T001 (tests) → T002 (implementation) → T003, T004 (verification, parallel)
- Tests written first per TDD discipline
- No page file changes needed — `phase` prop retained for API compatibility

## Implementation Strategy

1. Update tests to reflect new behavior (T001) → verify they fail against current code
2. Modify component (T002) → verify tests pass
3. Run lint + full test suite (T003, T004) → verify no regressions
4. Commit
