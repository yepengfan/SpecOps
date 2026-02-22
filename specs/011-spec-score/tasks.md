# Tasks: Spec Score

**Input**: Design documents from `/specs/011-spec-score/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/deep-analysis-api.md, quickstart.md

**Tests**: Included per quickstart.md testing strategy (unit tests for rule functions, hash, prompt parsing; component tests for evaluation panel; integration tests for persistence).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and Project schema extension required by all downstream tasks

- [ ] T001 Create evaluation type definitions (RuleCheckResult, DimensionScore, Suggestion, CrossPhaseFindings, DeepAnalysisResult, PhaseEvaluation) per data-model.md in `lib/eval/types.ts`
- [ ] T002 [P] Extend Project interface with optional `evaluations` field (`{ spec?: PhaseEvaluation; plan?: PhaseEvaluation; tasks?: PhaseEvaluation }`) in `lib/types/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that MUST be complete before ANY user story can be implemented

- [ ] T003 [P] Create content hash utility using djb2 algorithm per research.md R1 — `computePhaseHash(sections)` joins content with `\x00` delimiter — in `lib/eval/hash.ts`
- [ ] T004 [P] Create evaluation CRUD helpers — `getEvaluation(project, phaseType)`, `setEvaluation(project, phaseType, evaluation)`, `clearEvaluation(project, phaseType)` — that read/write the `evaluations` field on the Project object, in `lib/db/evaluations.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Instant Rule-Based Evaluation (Priority: P1) 🎯 MVP

**Goal**: Users click "Evaluate" and instantly see a green/red checklist of structural quality checks for any phase

**Independent Test**: Generate spec content, click Evaluate, verify rule results appear as a checklist with pass/fail indicators and failure explanations

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T005 [P] [US1] Write unit tests for `evaluateSpec`, `evaluatePlan`, `evaluateTasks` rule functions — cover EARS keyword detection, required section presence, task dependency validation, empty content edge case — in `__tests__/unit/eval-rules.test.ts`
- [ ] T006 [P] [US1] Write unit tests for `computePhaseHash` — deterministic output, different content produces different hashes, `\x00` delimiter prevents adjacent-section collisions — in `__tests__/unit/eval-hash.test.ts`

### Implementation for User Story 1

- [ ] T007 [US1] Implement `evaluateSpec(content)` — check EARS keywords (WHEN, THEN, SHALL, WHERE, IF) in each requirement, check required sections (Priority, Rationale, Main Flow, Validation Rules, Error Handling), check performance target exists — return `RuleCheckResult[]` in `lib/eval/rules.ts`
- [ ] T008 [US1] Implement `evaluatePlan(content)` — check expected sections exist (Architecture, API Contracts, Data Model, Tech Decisions, Security & Edge Cases) and each has non-empty content — return `RuleCheckResult[]` in `lib/eval/rules.ts`
- [ ] T009 [US1] Implement `evaluateTasks(content)` — check each task has number, title, dependencies, file mapping, test expectations; validate dependency references point to existing tasks — return `RuleCheckResult[]` in `lib/eval/rules.ts`
- [ ] T010 [P] [US1] Create Zustand evaluation store — tracks `isEvaluating`, `isAnalyzing`, `analysisError` UI state — in `lib/stores/evaluation-store.ts`
- [ ] T011 [P] [US1] Create rule checklist component — renders `RuleCheckResult[]` as list with green checkmark (`CheckCircle2`) for passing and red X (`XCircle`) for failing, with explanation text; use semantic list markup and `aria-label` on status icons for WCAG 2.1 AA — in `components/eval/rule-checklist.tsx`
- [ ] T012 [US1] Create collapsible evaluation panel — positioned between section editors and Approve button per clarification, contains "Evaluate" button, renders `<RuleChecklist>` when results exist, shows "nothing to evaluate" for empty content; ensure keyboard-accessible collapse toggle and focus management for WCAG 2.1 AA — in `components/eval/evaluation-panel.tsx`
- [ ] T013 [US1] Wire evaluation panel into all three phase pages — insert `<EvaluationPanel>` passing current phase type and sections to `app/project/[id]/spec/page.tsx`, `app/project/[id]/plan/page.tsx`, and `app/project/[id]/tasks/page.tsx`
- [ ] T014 [US1] Add content hash invalidation to debounced save — after `updateProject()` in `debouncedSave`, compute `computePhaseHash()` for the current phase, compare with stored `evaluations[phase].contentHash`, clear evaluation if different — in `lib/stores/project-store.ts`
- [ ] T015 [P] [US1] Write component tests for evaluation panel — render with no results, render with mixed pass/fail results, click Evaluate triggers evaluation, results cleared after invalidation — in `__tests__/unit/evaluation-panel.test.tsx`

**Checkpoint**: Rule-based evaluation fully functional — users can evaluate any phase and see instant checklist results that persist and auto-invalidate on content changes

---

## Phase 4: User Story 2+3 — AI Deep Analysis with Cross-Phase (Priority: P2)

**Goal**: Users click "Deep Analysis" to get AI-scored quality dimensions (1-5) with improvement suggestions; cross-phase coverage findings included when upstream content is available

**Independent Test**: Click "Deep Analysis" on a phase with content, verify dimension scores and suggestions appear; for plan phase with spec content available, verify cross-phase findings appear

### Tests for User Story 2+3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T016 [P] [US2] Write unit tests for deep analysis prompt builder and JSON response parser — validate prompt includes rubric and phase content, parser extracts 5 dimensions + suggestions + crossPhaseFindings, parser handles malformed JSON gracefully — in `__tests__/unit/deep-analysis-prompt.test.ts`

### Implementation for User Story 2+3

- [ ] T017 [P] [US2] Create shadcn/ui progress bar primitive in `components/ui/progress.tsx`
- [ ] T018 [US2] Create deep analysis prompt builder (`buildDeepAnalysisPrompt(phaseType, phaseContent, upstreamContent?)`) and response parser (`parseDeepAnalysisResponse(raw)`) per contracts/deep-analysis-api.md — parser validates 5 dimensions with scores 1-5, extracts suggestions and optional crossPhaseFindings — in `lib/prompts/deep-analysis.ts`
- [ ] T019 [US2] Extend API route with `"deep-analysis"` action — add to valid actions, build prompt via `buildDeepAnalysisPrompt`, stream response using existing Anthropic SDK pattern — in `app/api/generate/route.ts`
- [ ] T020 [US2] Create deep analysis results component — renders dimension scores as labeled progress bars (1-5 scale) with `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, lists suggestions with quoted excerpts and fix recommendations — in `components/eval/deep-analysis-results.tsx`
- [ ] T021 [US2] Wire Deep Analysis button into evaluation panel — add "Deep Analysis" button (disabled during analysis), call `streamGenerate({action: "deep-analysis", ...})`, accumulate response, parse with `parseDeepAnalysisResponse`, persist `DeepAnalysisResult` on Project, show loading spinner during analysis, show error with retry on failure — in `components/eval/evaluation-panel.tsx`
- [ ] T022 [US3] Add cross-phase content gathering — when analyzing plan, include spec phase content as `upstreamContent`; when analyzing tasks, include plan phase content; render `CrossPhaseFindings` (summary, covered/uncovered items) in `components/eval/deep-analysis-results.tsx` — update `components/eval/evaluation-panel.tsx`

**Checkpoint**: Full AI deep analysis functional — users get dimension scores, improvement suggestions, and cross-phase coverage analysis

---

## Phase 5: User Story 4 — Persisted Results and Project Health (Priority: P3)

**Goal**: Evaluation results survive navigation; project cards show "N/M checks passing" health summary derived from rule-based results

**Independent Test**: Run evaluation, navigate away and back, verify results still displayed; check project list shows health score on project cards

- [ ] T023 [US4] Add health score computation — `computeHealthScore(project)` counts passing/total rule checks across all evaluated phases, returns `{passed, total}` or null if no evaluations — in `lib/utils/project.ts`
- [ ] T024 [US4] Display health score on project cards — show "N/M checks passing" text below project status when evaluations exist, show nothing when no evaluations — in `components/ui/project-list.tsx`

**Checkpoint**: All user stories independently functional — rule checks, deep analysis, cross-phase coverage, persistence, and project health scores

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Integration tests, edge case hardening, and validation

- [ ] T025 [P] Write integration tests for evaluation persistence and invalidation — full lifecycle: evaluate → persist → reload → verify results present → edit content → debounced save → verify results cleared — using real Dexie via fake-indexeddb/auto in `__tests__/integration/evaluation-persistence.test.ts`
- [ ] T026 Handle edge cases in evaluation panel — empty content shows "nothing to evaluate" message, malformed AI response shows error with retry, missing API key shows configuration prompt (reuse existing pattern) — in `components/eval/evaluation-panel.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types must exist first)
- **US1 (Phase 3)**: Depends on Phase 2 — BLOCKS all other user stories
- **US2+US3 (Phase 4)**: Depends on Phase 3 (evaluation panel and persistence infrastructure)
- **US4 (Phase 5)**: Depends on Phase 3 (needs evaluation data to compute health score)
- **Polish (Phase 6)**: Depends on Phases 3-5 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — establishes all evaluation infrastructure
- **User Story 2+3 (P2)**: Depends on US1 — extends evaluation panel with Deep Analysis button and results
- **User Story 4 (P3)**: Depends on US1 — reads persisted evaluation data to compute health score; independent of US2+3

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types and utilities before components
- Store before UI components
- Core logic before integration wiring
- Persistence before invalidation

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T003 and T004 can run in parallel (different files)
- T005 and T006 can run in parallel (different test files)
- T010 and T011 can run in parallel (store vs component, different files)
- T016 and T017 can run in parallel (test file vs component)
- T023 and T025 can run in parallel (different files, different phases)

---

## Parallel Example: User Story 1

```bash
# Launch tests for US1 together:
Task: "Write unit tests for rule evaluation functions in __tests__/unit/eval-rules.test.ts"
Task: "Write unit tests for content hashing in __tests__/unit/eval-hash.test.ts"

# After rule functions implemented, launch store and component together:
Task: "Create Zustand evaluation store in lib/stores/evaluation-store.ts"
Task: "Create rule checklist component in components/eval/rule-checklist.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T004)
3. Complete Phase 3: User Story 1 (T005-T015)
4. **STOP and VALIDATE**: Evaluate any phase, verify checklist, verify invalidation on content change
5. Deploy/demo if ready — instant quality feedback with zero API cost

### Incremental Delivery

1. Setup + Foundational → Types and utilities ready
2. Add User Story 1 → Test independently → Deploy (MVP — rule-based evaluation)
3. Add User Story 2+3 → Test independently → Deploy (AI deep analysis + cross-phase)
4. Add User Story 4 → Test independently → Deploy (project health scores)
5. Polish → Integration tests and edge cases

### Sequential Strategy (Recommended)

This feature has natural sequential dependencies (US2 extends US1's panel, US4 reads US1's data), so sequential implementation in priority order is the most efficient path:

1. Phase 1+2: Setup + Foundation (4 tasks)
2. Phase 3: US1 (11 tasks) → **MVP delivery point**
3. Phase 4: US2+3 (7 tasks)
4. Phase 5: US4 (2 tasks)
5. Phase 6: Polish (2 tasks)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in current phase
- [Story] label maps task to specific user story for traceability
- Evaluation data stored on Project object (no Dexie schema migration needed per research.md R2)
- Rule checks are pure functions — no side effects, synchronous, <1ms
- Deep analysis reuses existing `/api/generate` SSE streaming pattern
- Health score derived at render time — no stored field
- Content hash uses djb2 with `\x00` delimiter per research.md R1
