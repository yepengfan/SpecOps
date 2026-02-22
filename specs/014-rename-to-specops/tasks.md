# Tasks: Rename to SpecOps

**Input**: Design documents from `/specs/014-rename-to-specops/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested. No test tasks included (existing tests cover regressions).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 + 2 — App Identity & Data Preservation (Priority: P1) 🎯 MVP

**Goal**: Update all user-facing UI text to "SpecOps" while preserving existing IndexedDB data

**Independent Test**: Open the app — browser tab reads "SpecOps", nav header reads "SpecOps", existing projects are intact

### Implementation

- [X] T001 [P] [US1] Update page title to "SpecOps" and description in `app/layout.tsx`
- [X] T002 [P] [US1] Update navigation header text from "SDD Cockpit" to "SpecOps" in `app/layout.tsx`
- [X] T003 [P] [US2] Rename class `SddCockpitDatabase` to `SpecOpsDatabase`, change `super("sdd-cockpit")` to `super("spec-ops")`, rename export in `lib/db/database.ts`

**Checkpoint**: App shows "SpecOps" in browser tab and nav header. All existing data accessible (DB name unchanged internally).

---

## Phase 2: User Story 4 — Package & Configuration (Priority: P2)

**Goal**: Update package name to "spec-ops" and regenerate lock file

**Independent Test**: `npm install` succeeds, package.json name reads "spec-ops", build passes

### Implementation

- [X] T004 [US4] Update `name` field from "sdd-cockpit" to "spec-ops" in `package.json`
- [X] T005 [US4] Run `npm install` to regenerate `package-lock.json` with updated name

**Checkpoint**: `package.json` name is "spec-ops", lock file regenerated, `npm run build` succeeds.

---

## Phase 3: User Story 3 — Documentation (Priority: P2)

**Goal**: Update all documentation references from "SDD Cockpit" / "sdd-cockpit" to "SpecOps" / "spec-ops"

**Independent Test**: Grep for "SDD Cockpit" returns zero matches in file content; grep for "sdd-cockpit" returns only the `specs/001-sdd-cockpit/` directory path and the `super("sdd-cockpit")` DB name line

### Implementation

- [X] T006 [P] [US3] Update project name, header, and references in `README.md` — replace "SDD Cockpit" / "SDD Workflow App" with "SpecOps", align content with spec-kit methodology
- [X] T007 [P] [US3] Update guidelines header and feature references in `CLAUDE.md` — header to "spec-ops Development Guidelines", update `(001-sdd-cockpit)` references
- [X] T008 [P] [US3] Update document title and text references in `specs/001-sdd-cockpit/plan.md`
- [X] T009 [P] [US3] Update document title and text references in `specs/001-sdd-cockpit/data-model.md`
- [X] T010 [P] [US3] Update document title, text references, and clone example in `specs/001-sdd-cockpit/quickstart.md`
- [X] T011 [P] [US3] Update document title and text references in `specs/001-sdd-cockpit/research.md`
- [X] T012 [P] [US3] Update document title and text references in `specs/001-sdd-cockpit/tasks.md`
- [X] T013 [P] [US3] Update DB name reference text in `specs/001-sdd-cockpit/contracts/indexeddb-schema.md`
- [X] T014 [P] [US3] Update "SDD Cockpit" text reference in `specs/011-spec-score/quickstart.md`

**Checkpoint**: All documentation references updated. Directory name `specs/001-sdd-cockpit/` preserved.

---

## Phase 4: Polish & Verification

**Purpose**: Validate the rename is complete and no stale references remain

- [X] T015 Run `npm test` — all existing tests must pass with zero regressions
- [X] T016 Run `npm run lint` — zero errors
- [X] T017 Run verification grep: confirm no "SDD Cockpit" matches remain in file content and "sdd-cockpit" appears only in `specs/001-sdd-cockpit/` directory paths and `lib/db/database.ts` super() call
- [X] T018 Run `npm run build` — successful build with no old-name references in output

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1+US2)**: No dependencies — can start immediately. MVP deliverable.
- **Phase 2 (US4)**: No dependency on Phase 1 — can run in parallel
- **Phase 3 (US3)**: No dependency on Phase 1 or 2 — all documentation tasks can run in parallel
- **Phase 4 (Polish)**: Depends on Phases 1-3 completion

### Within Each Phase

- T001+T002 modify the same file (`app/layout.tsx`) — execute sequentially or combine
- T003 is independent (different file) — can run in parallel with T001/T002
- T004 must complete before T005 (`npm install` depends on updated `package.json`)
- T006-T014 all modify different files — can all run in parallel
- T015-T018 are sequential validation steps

### Parallel Opportunities

```bash
# Phase 1: All source code changes in parallel
Task: T001+T002 "Update title and nav header in app/layout.tsx"
Task: T003 "Rename database class in lib/db/database.ts"

# Phase 2+3: Config and docs in parallel
Task: T004 "Update package.json name"
Task: T006 "Update README.md"
Task: T007 "Update CLAUDE.md"
Task: T008-T014 "Update all spec documents" (all parallel)

# After T004 completes:
Task: T005 "npm install to regenerate lock file"
```

---

## Implementation Strategy

### MVP First (Phase 1 Only)

1. Complete Phase 1: Source code changes (T001-T003)
2. **STOP and VALIDATE**: App shows "SpecOps", data preserved
3. Continue to Phase 2+3 for full rename

### All-at-Once (Recommended for this feature)

Since this is a simple text-replacement feature with no logic changes:
1. Execute T001-T003 (source code)
2. Execute T004-T005 (config)
3. Execute T006-T014 (documentation — all parallel)
4. Execute T015-T018 (verification)
5. Single commit or atomic commits per phase

---

## Notes

- [P] tasks = different files, no dependencies
- T001 and T002 target the same file — combine into a single edit
- The DB name is changed from `"sdd-cockpit"` to `"spec-ops"` — data loss is acceptable (see research.md)
- The directory `specs/001-sdd-cockpit/` is intentionally preserved (historical record)
- Total files modified: 12 source/doc files + 1 auto-generated (package-lock.json)
