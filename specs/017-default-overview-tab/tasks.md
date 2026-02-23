# Tasks: Default Overview Tab

**Input**: Design documents from `/specs/017-default-overview-tab/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), quickstart.md

**Tests**: TDD approach requested. Write test first, verify it fails, then implement.

**Organization**: Single user story — all tasks are sequential.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 — Project Card Opens Overview (Priority: P1) 🎯 MVP

**Goal**: Change the project card link target from the active phase to the overview dashboard

**Independent Test**: Click any project card from the project list — verify navigation to `/project/{id}/overview`

### Test (TDD — write first, verify it fails)

- [X] T001 [US1] Write unit test in `__tests__/unit/project-card.test.tsx` — render `<ProjectCard>` with a mock project and assert the link `href` points to `/project/{id}/overview` instead of `/project/{id}/{activePhase}`; test should FAIL before implementation since the current link targets the active phase

### Implementation

- [X] T002 [US1] Change link href in `components/ui/project-card.tsx` — replace `href={\`/project/${project.id}/${activePhase}\`}` with `href={\`/project/${project.id}/overview\`}`; remove the `getActivePhase` import and `activePhase` variable if now unused

---

## Phase 2: Polish & Verification

**Purpose**: Verify all tests pass and no regressions

- [ ] T003 Run `npm run lint` — zero errors, zero warnings
- [ ] T004 Run `npm test` — all existing tests (313+) plus the new test must pass with zero regressions
- [ ] T005 Run quickstart.md verification scenarios 1-2 manually — verify project card navigates to overview, verify direct phase URLs still work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No setup needed — existing project has all dependencies
- **Phase 2**: Depends on Phase 1 completion

### Task Order

- T001 → T002 → T003 → T004 → T005 (strictly sequential — TDD: test first, then implement, then verify)

---

## Implementation Strategy

### TDD Flow

1. T001: Write the test — expect it to FAIL (current href targets active phase)
2. T002: Change the link href — expect the test to PASS
3. T003-T005: Verify lint, full test suite, and manual scenarios

### Recommended Commit Strategy

- **Commit 1**: T001 — Add failing test for project card overview link
- **Commit 2**: T002 — Change project card link to overview (test passes)
- **Commit 3**: T003-T005 verified (no separate commit needed — verification only)

---

## Notes

- Total: 5 tasks across 2 phases (1 user story + 1 polish)
- TDD approach: test written first, verified to fail, then implementation makes it pass
- Single source file modified: `components/ui/project-card.tsx`
- The `getActivePhase` import may become unused after T002 — remove it to keep the code clean
