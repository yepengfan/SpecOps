# Tasks: Rename Project

**Input**: Design documents from `/specs/012-rename-project/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Included per quickstart.md testing strategy (unit tests for component, integration tests for persistence).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new infrastructure needed — the existing project structure, Zustand store, and Dexie database layer are reused. This phase is intentionally empty.

*(No tasks — existing infrastructure is sufficient)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the `renameProject` action to the Zustand store — required by both user stories before any UI work can begin.

- [X] T001 Add `renameProject(name: string)` action to Zustand store — validates non-empty trimmed name, checks name changed, updates `currentProject.name`, calls `immediateSave` — in `lib/stores/project-store.ts`

**Checkpoint**: Store action ready — UI implementation can now begin

---

## Phase 3: User Story 1 — Inline Rename in Project View (Priority: P1) 🎯 MVP

**Goal**: Users click the project name in the header, edit it inline, and save with Enter or blur. Escape cancels.

**Independent Test**: Create a project, click the name, type a new name, press Enter, verify it updates in the header and persists to IndexedDB.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T002 [P] [US1] Write unit tests for `<EditableProjectName>` component — display mode renders heading text, click enters edit mode with input pre-filled, Enter saves and exits edit mode, blur saves and exits edit mode, Escape cancels and restores original name, select-all on focus, keyboard accessible (Enter/Space on heading enters edit mode) — in `__tests__/unit/editable-project-name.test.tsx`
- [X] T003 [P] [US1] Write integration test for rename persistence — create project via `createProject`, rename via store `renameProject` action, reload from Dexie `getProject`, verify new name persisted, verify `updatedAt` advanced — in `__tests__/integration/project-crud.test.ts`

### Implementation for User Story 1

- [X] T004 [US1] Create `<EditableProjectName>` component — local `isEditing` state, display mode renders `<h1>` with `role="button"` `tabIndex={0}` and click/keydown handler, edit mode renders `<input>` with `aria-label="Project name"` that auto-selects text on mount, Enter/blur calls `renameProject` on store, Escape restores original name — in `components/ui/editable-project-name.tsx`
- [X] T005 [US1] Wire `<EditableProjectName>` into project layout — replace `<h1 className="text-2xl font-bold">{project?.name}</h1>` with `<EditableProjectName />` that reads name from the store — in `app/project/[id]/layout.tsx`

**Checkpoint**: Core rename flow functional — click name, type, Enter/blur saves, Escape cancels, name persists to IndexedDB and reflects in project list via Dexie live queries

---

## Phase 4: User Story 2 — Validation and Error Handling (Priority: P2)

**Goal**: Empty/whitespace names are rejected; unchanged names skip saving; save errors revert the name.

**Independent Test**: Attempt to clear the name and press Enter — verify original name is preserved.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T006 [P] [US2] Write unit tests for validation edge cases — empty input restores original name without calling `renameProject`, whitespace-only input restores original name, unchanged name does not call `renameProject` — in `__tests__/unit/editable-project-name.test.tsx`

### Implementation for User Story 2

- [X] T007 [US2] Add validation logic to `<EditableProjectName>` — before calling `renameProject`: reject if `trimmed` is empty (restore original), reject if `trimmed === currentName` (exit edit mode silently); the store action already handles trim and no-op check as a safety net — in `components/ui/editable-project-name.tsx`

**Checkpoint**: All validation cases handled — empty, whitespace, unchanged names are all rejected without saving

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [X] T008 Run all tests (`npm test`) and lint (`npm run lint`) to verify zero regressions
- [X] T009 Run quickstart.md manual verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no setup needed
- **Foundational (Phase 2)**: No dependencies — can start immediately
- **US1 (Phase 3)**: Depends on Phase 2 (store action must exist before component uses it)
- **US2 (Phase 4)**: Depends on Phase 3 (validation extends the component created in US1)
- **Polish (Phase 5)**: Depends on Phases 3-4 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) — creates the component and wires it in
- **User Story 2 (P2)**: Depends on US1 — adds validation to the existing component

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Store action before component
- Component before layout wiring
- Core flow before validation

### Parallel Opportunities

- T002 and T003 can run in parallel (different test files)
- T004 and T003 can run in parallel (component vs integration test in different files)

---

## Parallel Example: User Story 1

```bash
# Launch tests for US1 together:
Task: "Write unit tests for EditableProjectName in __tests__/unit/editable-project-name.test.tsx"
Task: "Write integration test for rename persistence in __tests__/integration/project-crud.test.ts"

# After tests written, implement sequentially:
Task: "Create EditableProjectName component in components/ui/editable-project-name.tsx"
Task: "Wire EditableProjectName into project layout in app/project/[id]/layout.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational — add `renameProject` store action (1 task)
2. Complete Phase 3: User Story 1 — tests, component, layout wiring (4 tasks)
3. **STOP and VALIDATE**: Click name, type, Enter — name saved and persisted
4. Deploy/demo if ready — core rename is fully functional

### Incremental Delivery

1. Foundational → Store action ready
2. Add User Story 1 → Test independently → Deploy (MVP — inline rename works)
3. Add User Story 2 → Test independently → Deploy (validation added)
4. Polish → Final verification

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in current phase
- [Story] label maps task to specific user story for traceability
- No Dexie schema migration needed — `updateProject` already handles name updates
- `renameProject` uses `immediateSave` (not debounced) per research.md R2
- Project list picks up name changes automatically via Dexie `useLiveQuery`
- Component uses local `isEditing` state (not Zustand) per research.md R1
