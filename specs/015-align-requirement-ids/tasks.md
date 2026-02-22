# Tasks: Align Requirement Identifiers

**Input**: Design documents from `/specs/015-align-requirement-ids/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested. Existing test fixtures are updated to match the new format.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 + 2 — AI Generation & Evaluation (Priority: P1) 🎯 MVP

**Goal**: Update AI spec generation prompts to output FR-NNN / NFR-NNN format, and update evaluation rules to validate the new format

**Independent Test**: Create a new project, generate spec content, verify requirements use FR-001/NFR-001 format. Run spec evaluation and verify EARS keyword check works correctly with new format.

### Implementation

- [X] T001 [P] [US1] Update spec generation prompt to use `**FR-<number>**:` format with zero-padded examples (FR-001, FR-002) and `**NFR-<number>**:` with zero-padded examples (NFR-001) in `lib/prompts/spec.ts` — both `getSpecSystemPrompt()` and `getRegenerateSpecSectionPrompt()`
- [X] T002 [P] [US2] Update `evaluateSpec()` regex patterns in `lib/eval/rules.ts` — change line filter from `(REQ|NFR)-\d+` to `(FR|NFR)-\d+`, change EARS check filter from `\*\*REQ-` to `\*\*FR-`, update error messages from "REQ-N or NFR-N" to "FR-NNN or NFR-NNN", update missing EARS explanation to show `FR-\d+` match
- [X] T003 [P] [US1] Update test fixtures in `__tests__/unit/spec-parser.test.ts` — change all `**REQ-N**:` to `**FR-00N**:` and `**NFR-N**:` to `**NFR-00N**:` in test content strings
- [X] T004 [P] [US2] Update test fixtures in `__tests__/unit/eval-rules.test.ts` — change all `**REQ-N**:` to `**FR-00N**:` and `**NFR-N**:` to `**NFR-00N**:` in test content strings, update expected error message assertions

**Checkpoint**: AI-generated spec content uses FR-NNN/NFR-NNN format. Spec evaluation correctly validates the new format. `npm test` passes.

---

## Phase 2: User Story 3 — Traceability Parsing (Priority: P2)

**Goal**: Update traceability parsing to extract FR-NNN IDs from spec content and produce correct internal IDs and labels

**Independent Test**: Create a project with FR-NNN spec content, generate traceability mappings, verify matrix displays FR-001 labels and uses fr-001 internal IDs.

### Implementation

- [X] T005 [US3] Update `parseRequirementIds()` in `lib/db/traceability.ts` — change primary bold regex from `\*\*REQ-(\d+)\*\*:` to `\*\*(FR|REQ)-(\d+)\*\*:` (dual match for backward compat), add NFR parsing with `\*\*(NFR)-(\d+)\*\*:`, update ID construction to `fr-${num.padStart(3, '0')}` / `nfr-${num.padStart(3, '0')}`, update label construction to `FR-${num.padStart(3, '0')}:` / `NFR-${num.padStart(3, '0')}:`, update heading fallback regex to also match `## FR-NNN:` format
- [X] T006 [P] [US3] Update empty-state guidance message in `components/traceability/matrix-table.tsx` — change `**REQ-N**: description` to `**FR-NNN**: description`
- [X] T007 [P] [US3] Update requirement content extraction in `components/traceability/cell-detail.tsx` — change bold regex from `\\*\\*REQ-${reqNum}\\*\\*:` to support both `FR-` and `REQ-` prefixes, update ID prefix handling to parse both `fr-` and `req-` prefixed IDs for the regex number extraction
- [X] T008 [P] [US3] Update test fixtures in `__tests__/unit/traceability.test.ts` — change all `**REQ-N**:` to `**FR-00N**:` in test content, update expected IDs from `req-N` to `fr-00N`, update expected labels from `REQ-N:` to `FR-00N:`
- [X] T009 [P] [US3] Update test fixtures in `__tests__/integration/traceability-reanalyze.test.ts` — change `REQ-` references to `FR-` format in test data

**Checkpoint**: Traceability matrix correctly parses and displays FR-NNN requirements. Backward compat with old REQ-N format works. `npm test` passes.

---

## Phase 3: User Story 4 — Plan, Task & Traceability Prompts (Priority: P2)

**Goal**: Update all remaining AI prompt templates to reference FR-NNN / NFR-NNN format in instructions and traceability comments

**Independent Test**: Generate plan and task content for a project with FR-NNN requirements, verify cross-references use FR-NNN format and traceability comments use fr-NNN IDs.

### Implementation

- [X] T010 [P] [US4] Update plan generation prompt in `lib/prompts/plan.ts` — change traceability comment example from `"req-1"` to `"fr-001"`, change derivation instruction from `**REQ-1** becomes "req-1"` to `**FR-001** becomes "fr-001"`, update `**REQ-N**` references to `**FR-NNN**`
- [X] T011 [P] [US4] Update tasks generation prompt in `lib/prompts/tasks.ts` — change `(REQ-/NFR-)` reference to `(FR-/NFR-)`, change traceability comment example from `"req-1"` to `"fr-001"`, change derivation instruction to use FR-NNN format
- [X] T012 [P] [US4] Update traceability reanalyze prompt in `lib/prompts/traceability.ts` — change `"req-N"` format to `"fr-NNN"`, change `**REQ-N**` to `**FR-NNN**`, update all example IDs from `req-1`, `req-2`, `req-3` to `fr-001`, `fr-002`, `fr-003`

**Checkpoint**: All AI prompts reference FR-NNN format consistently. `npm test` passes.

---

## Phase 4: Polish & Verification

**Purpose**: Update remaining test fixtures and run full verification

- [X] T013 [P] Update test fixtures in `__tests__/unit/edit-parser.test.ts` — change `REQ-` references to `FR-` format in test data
- [X] T014 [P] Update test fixtures in `__tests__/unit/deep-analysis-prompt.test.ts` — change `REQ-` references to `FR-` format in test data
- [X] T015 [P] Update test fixtures in `__tests__/integration/evaluation-persistence.test.ts` — change `REQ-` references to `FR-` format in test data
- [X] T016 Run `npm test` — all existing tests must pass with zero regressions
- [X] T017 Run `npm run lint` — zero errors
- [X] T018 Run verification grep: confirm no `REQ-` references remain in `lib/` and `components/` source code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1+US2)**: No dependencies — can start immediately. MVP deliverable.
- **Phase 2 (US3)**: Depends on T001 (spec prompt defines the format that traceability parses). T005 must handle backward compat so it works with both old and new content.
- **Phase 3 (US4)**: No dependency on Phase 2 — prompt text updates are independent.
- **Phase 4 (Polish)**: Depends on Phases 1-3 completion.

### Within Each Phase

- T001+T002+T003+T004 modify different files — can all run in parallel
- T005 is the core traceability change; T006+T007+T008+T009 can run in parallel with T005 or after
- T010+T011+T012 modify different files — can all run in parallel
- T013+T014+T015 modify different files — can all run in parallel
- T016-T018 are sequential validation steps

### Parallel Opportunities

```bash
# Phase 1: All changes in parallel (different files)
Task: T001 "Update spec prompt in lib/prompts/spec.ts"
Task: T002 "Update eval rules in lib/eval/rules.ts"
Task: T003 "Update spec-parser tests"
Task: T004 "Update eval-rules tests"

# Phase 2+3: Traceability + prompt updates in parallel
Task: T005 "Update parseRequirementIds in lib/db/traceability.ts"
Task: T006 "Update matrix-table guidance message"
Task: T007 "Update cell-detail regex"
Task: T010 "Update plan prompt"
Task: T011 "Update tasks prompt"
Task: T012 "Update traceability prompt"

# Phase 4: Remaining test updates in parallel
Task: T013 "Update edit-parser tests"
Task: T014 "Update deep-analysis tests"
Task: T015 "Update evaluation-persistence tests"
```

---

## Implementation Strategy

### MVP First (Phase 1 Only)

1. Complete Phase 1: Spec generation + evaluation (T001-T004)
2. **STOP and VALIDATE**: New projects generate FR-NNN format, evaluation works
3. Continue to Phase 2+3 for full traceability and prompt alignment

### All-at-Once (Recommended for this feature)

Since this is a text-replacement feature with no logic changes beyond regex updates:
1. Execute T001-T004 (spec generation + evaluation)
2. Execute T005-T009 (traceability parsing)
3. Execute T010-T012 (remaining prompts)
4. Execute T013-T018 (test fixtures + verification)
5. Single commit or atomic commits per phase

---

## Notes

- [P] tasks = different files, no dependencies
- T005 is the most complex task — dual-regex backward compatibility + zero-padding normalization
- The `cell-detail.tsx` (T007) needs special attention: it extracts a number from the requirement ID (`req-` prefix) to build a regex — must handle both `fr-` and `req-` prefixes
- Test fixture updates (T003, T004, T008, T009, T013, T014, T015) are mechanical: replace `REQ-1` with `FR-001`, `REQ-2` with `FR-002`, etc.
- Total files modified: 8 source files + 7 test files = 15 files
