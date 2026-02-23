# Tasks: SpecOps

**Input**: Plan documents from `/specs/001-spec-ops-core/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: TDD approach — write tests first, verify they fail, then implement. Unit tests are part of code review.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## User Story Mapping

> Table ordered by implementation sequence (see Dependencies & Execution Order).

| Story | Requirements | Description                                          | Priority |
|-------|--------------|------------------------------------------------------|----------|
| US1   | Req 1, 2     | Project CRUD (create, list, delete, resume)          | Critical |
| US2   | Req 9        | API key configuration (server-side `.env.local`)     | High     |
| US3   | Req 3, 6     | AI-assisted spec generation                          | Critical |
| US4   | Req 7        | Phase gate enforcement                               | Critical |
| US5   | Req 4, 6     | AI-assisted plan generation                        | Critical |
| US6   | Req 5, 6     | AI-assisted task breakdown generation                | Critical |
| US7   | Req 8        | Export specs as markdown/zip                          | High     |
| US8   | Req 10       | Traceability matrix (requirement → plan/task mapping) | High     |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Next.js project with TypeScript, App Router, and Tailwind CSS
- [ ] T002 Install core dependencies: `dexie`, `dexie-react-hooks`, `zustand`, `react-markdown`, `client-zip`, `@anthropic-ai/sdk`
- [ ] T003 [P] Initialize shadcn/ui with base components: Button, Dialog, Tabs, Input, Textarea, Card
- [ ] T004 [P] Configure ESLint with `eslint-plugin-jsx-a11y` for accessibility linting
- [ ] T005 [P] Configure Jest with `fake-indexeddb` and `@testing-library/react` in `jest.config.ts` and `jest.setup.ts`
- [ ] T006 [P] Create `.env.example` with `ANTHROPIC_API_KEY=` placeholder and add `.env.local` to `.gitignore`
- [ ] T007 Create TypeScript types and enums in `lib/types/index.ts`: `Project`, `Phase`, `Section`, `PhaseType`, `PhaseStatus`, section template constants

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T008 [P] Unit tests for Dexie CRUD operations in `__tests__/unit/db.test.ts`: test `createProject()`, `listProjects()`, `getProject()`, `updateProject()`, `deleteProject()`, `QuotaExceededError` handling, `OpenFailedError` handling
- [ ] T009 [P] Unit tests for section template constants in `__tests__/unit/sections.test.ts`: verify Spec has 3 sections, Plan has 5, Tasks has 4, all have id and title

### Implementation for Foundational

- [ ] T010 Create Dexie database schema and initialization in `lib/db/database.ts`: define `projects` table with `id` primary key and `updatedAt` index
- [ ] T011 Create Dexie CRUD operations in `lib/db/projects.ts`: `createProject()`, `listProjects()`, `getProject()`, `updateProject()`, `deleteProject()` with typed error handling for `QuotaExceededError` and `OpenFailedError`
- [ ] T012 Create section template constants in `lib/types/sections.ts`: fixed section definitions for Spec (3 sections), Plan (5 sections), Tasks (4 sections) per README
- [ ] T013 Create Zustand project store in `lib/stores/project-store.ts`: current project state, phase statuses, section content, auto-save debounce logic (1s), `updateSection()` action that also updates `updatedAt` timestamp
- [ ] T014 Create section editor component in `components/editor/section-editor.tsx`: editable textarea for one section, section title header, auto-save to IndexedDB via Zustand store (debounced 1s), loading indicator placeholder. No AI generation — just manual editing.
- [ ] T015 Create root layout in `app/layout.tsx`: app shell with navigation header, main content area, and global styles

**Checkpoint**: Foundation ready — database, store, section editor, and layout all working. User story implementation can now begin.

---

## Phase 3: User Story 1 - Project CRUD (Priority: Critical) 🎯 MVP

**Goal**: Developers can create, list, resume, and delete SDD projects. All data persisted in IndexedDB.

**Independent Test**: Create a project with a name, see it in the list, click to resume, delete it. Verify persistence across page reloads.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T016 [P] [US1] Unit tests for project list in `__tests__/unit/project-list.test.ts`: renders empty state, renders projects sorted by updatedAt, displays correct phase status, displays "Complete" when all phases reviewed
- [ ] T017 [P] [US1] Unit tests for new project dialog in `__tests__/unit/new-project-dialog.test.ts`: validates non-empty name, enforces max 100 chars, trims whitespace, creates project with UUID v4

### Implementation for User Story 1

- [ ] T018 [US1] Create project list page in `app/page.tsx`: load all projects via `useLiveQuery()`, display project name, current phase, last updated timestamp, sorted by most recent first
- [ ] T019 [US1] Create "New Project" dialog component in `components/ui/new-project-dialog.tsx`: text input for project name, validation (non-empty, max 100 chars, trimmed), submit creates project via `createProject()` and navigates to `/project/[id]/spec`
- [ ] T020 [US1] Create project card component in `components/ui/project-card.tsx`: display project name, derived phase status (Spec/Plan/Tasks/Complete), last updated, click to navigate to active phase, delete button with confirmation dialog
- [ ] T021 [US1] Create project redirect page in `app/project/[id]/page.tsx`: load project, redirect to current active phase route (for "Complete" projects, redirect to tasks)
- [ ] T022 [US1] Implement "Complete" derived display status in `lib/stores/project-store.ts`: project displays as "Complete" when all three phases have status "reviewed"
- [ ] T023 [US1] Add error handling for IndexedDB failures in `app/page.tsx`: display "Unable to load projects" message with "Clear all data" option when `OpenFailedError` occurs, display "Storage is full" on `QuotaExceededError`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 4 - Phase Gate Enforcement (Priority: Critical)

**Goal**: Phases unlock sequentially (Spec → Plan → Tasks). Editing an approved phase resets downstream phases to draft with confirmation. All tested with manual content entry.

**Independent Test**: Manually type content into all spec sections, approve, verify plan unlocks. Try to navigate to tasks while plan is draft — should be blocked. Approve plan, edit a spec section — confirm warning appears, downstream phases reset to draft.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T024 [P] [US4] Unit tests for phase status transitions in `__tests__/unit/phase-gate.test.ts`: test locked→draft transition when previous phase reviewed, draft→reviewed when all sections have content, draft→reviewed blocked when sections empty, reviewed→draft on edit with confirmation, cascading reset of downstream phases to "draft" (not "locked"), content preserved on reset
- [ ] T025 [P] [US4] Unit tests for phase navigation in `__tests__/unit/phase-nav.test.ts`: locked tabs not clickable, reviewed tabs show check icon, active tab highlighted, URL navigation to locked phase redirects

### Implementation for User Story 4

- [ ] T026 [US4] Create phase navigation component in `components/phase/phase-nav.tsx`: tab bar with Spec, Plan, Tasks tabs. Show lock icon on locked phases, check icon on reviewed phases. Disable click on locked tabs. Use `role="tablist"` / `role="tab"` / `role="tabpanel"` for accessibility.
- [ ] T027 [US4] Implement phase status transitions in `lib/stores/project-store.ts`: `approvePhase()` sets current phase to "reviewed" and unlocks next phase (locked→draft). Validate all sections have content before allowing approval.
- [ ] T028 [US4] Create "Mark as Reviewed" button component in `components/phase/approve-button.tsx`: disabled when any section is empty, triggers `approvePhase()`, persists to IndexedDB
- [ ] T029 [US4] Implement edit-approved-phase flow in `components/editor/section-editor.tsx`: when phase status is "reviewed", render textarea as read-only. On click, show confirmation dialog "Editing this phase will require re-review of all downstream phases. Continue?" If confirmed: make editable, reset current phase to "draft", reset downstream phases to "draft" (preserve content). If cancelled: no changes.
- [ ] T030 [US4] Create spec phase page in `app/project/[id]/spec/page.tsx`: display fixed sections in section editors, "Mark as Reviewed" button. No AI generation — manual content entry only.
- [ ] T031 [US4] Create plan phase page in `app/project/[id]/plan/page.tsx`: display fixed sections in section editors, "Mark as Reviewed" button, gate check redirects to active phase if plan is locked
- [ ] T032 [US4] Create tasks phase page in `app/project/[id]/tasks/page.tsx`: display fixed sections in section editors, "Mark as Reviewed" button, gate check redirects to active phase if tasks is locked

**Checkpoint**: At this point, the full phase gate flow works end-to-end with manual content. This is the most critical feature — validate thoroughly.

---

## Phase 5: User Story 2 - API Key Configuration (Priority: High)

**Goal**: API key is stored server-side in `.env.local`. Settings page shows key status. AI features are blocked when key is missing.

**Independent Test**: Start app without `ANTHROPIC_API_KEY` in `.env.local`, verify settings page shows "Not configured" with instructions. Set the key, restart, verify "Configured" status.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T033 [P] [US2] Unit tests for key status endpoint in `__tests__/unit/key-status.test.ts`: returns `{ configured: true }` when env var set, returns `{ configured: false }` when missing, never returns the key itself

### Implementation for User Story 2

- [ ] T034 [US2] Create API key status endpoint in `app/api/key-status/route.ts`: GET handler that returns `{ configured: true/false }` by checking `process.env.ANTHROPIC_API_KEY` existence (never return the key itself)
- [ ] T035 [US2] Create settings page in `app/settings/page.tsx`: fetch key status from `/api/key-status`, display "Configured" or "Not configured" with setup instructions to edit `.env.local`
- [ ] T036 [US2] Add settings link to navigation in `app/layout.tsx`: gear icon or "Settings" link in the header navigation

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently

---

## Phase 6: User Story 3 - AI Spec Generation (Priority: Critical)

**Goal**: Developers enter a natural language project description and the AI generates EARS-format requirements. "Generate" and "Regenerate" buttons added to the existing spec page and section editors.

**Independent Test**: Enter a project description, click "Generate", see EARS-format requirements appear in existing editable sections. Click "Regenerate" on one section, verify only that section updates. Trigger with no API key — verify error message.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T037 [P] [US3] Unit tests for LLM proxy API route in `__tests__/unit/generate-route.test.ts`: returns error when API key missing, returns error for invalid action, forwards request to Anthropic SDK, streams response back, handles 401/429/500 errors
- [ ] T038 [P] [US3] Unit tests for streaming client in `__tests__/unit/stream-client.test.ts`: parses SSE events (content, done, error), handles network failures, returns async iterator of text chunks

### Implementation for User Story 3

- [ ] T039 [US3] Create LLM proxy API route in `app/api/generate/route.ts`: POST handler that reads `ANTHROPIC_API_KEY` from env, creates Anthropic SDK client, forwards requests to Claude API with streaming, returns SSE stream to browser. Handle missing key, invalid key (401), rate limit (429), and network errors.
- [ ] T040 [US3] Create spec system prompt in `lib/prompts/spec.ts`: instruct Claude to generate EARS-format output with Problem Statement, EARS-format Requirements (WHEN/THEN/WHERE/IF), and Non-Functional Requirements sections
- [ ] T041 [US3] Create streaming client utility in `lib/api/stream-client.ts`: fetch `/api/generate` with streaming, parse SSE events (`content`, `done`, `error`), return async iterator of text chunks
- [ ] T042 [US3] Add "Generate" button and project description input to spec page in `app/project/[id]/spec/page.tsx`: description textarea (min 10 chars), "Generate" button triggers streaming generation, populates section editors with generated content, loading state during generation
- [ ] T043 [US3] Add "Regenerate" button to section editor in `components/editor/section-editor.tsx`: send phase context + section name to `/api/generate` with `action: "regenerate-section"`, replace only targeted section content, preserve other sections, loading indicator on targeted section only
- [ ] T044 [US3] Handle malformed LLM responses in `app/project/[id]/spec/page.tsx`: if response doesn't match expected section structure, display raw response with warning banner "Generated content may not follow the expected format", allow retry

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently

---

## Phase 7: User Story 5 - AI Plan Generation (Priority: Critical)

**Goal**: After spec is approved, AI generates a plan.md draft with Architecture, API Contracts, Data Model, Tech Decisions, Security & Edge Cases sections.

**Independent Test**: Approve spec phase, navigate to plan, click "Generate", see plan sections appear. Edit and approve.

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T045 [P] [US5] Unit tests for plan system prompt in `__tests__/unit/plan-prompt.test.ts`: verify prompt includes approved spec content, verify prompt instructs EARS-format input parsing, verify all 5 plan sections are requested
- [ ] T045b [P] [US5] Unit tests for plan generation in `__tests__/unit/plan-gen.test.ts`: verify generated content populates correct plan sections, verify section regeneration replaces only targeted section, verify loading state during generation

### Implementation for User Story 5

- [ ] T046 [US5] Create plan system prompt in `lib/prompts/plan.ts`: instruct Claude to generate plan document with Architecture, API Contracts, Data Model, Tech Decisions, Security & Edge Cases sections, using approved spec as context
- [ ] T047 [US5] Add "Generate" button and AI generation to plan page in `app/project/[id]/plan/page.tsx`: "Generate" button sends approved spec as context, populates section editors, loading state, section regeneration. Reuse `stream-client.ts` from US3.

**Checkpoint**: At this point, User Story 5 should be fully functional and testable independently

---

## Phase 8: User Story 6 - AI Task Breakdown Generation (Priority: Critical)

**Goal**: After plan is approved, AI generates a tasks.md draft with Task List, Dependencies, File Mapping, Test Expectations sections.

**Independent Test**: Approve plan phase, navigate to tasks, click "Generate", see task breakdown sections appear. Edit and approve.

### Tests for User Story 6

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T048 [P] [US6] Unit tests for tasks system prompt in `__tests__/unit/tasks-prompt.test.ts`: verify prompt includes approved spec AND plan content, verify all 4 tasks sections are requested
- [ ] T048b [P] [US6] Unit tests for tasks generation in `__tests__/unit/tasks-gen.test.ts`: verify generated content populates correct tasks sections, verify section regeneration replaces only targeted section, verify loading state during generation

### Implementation for User Story 6

- [ ] T049 [US6] Create tasks system prompt in `lib/prompts/tasks.ts`: instruct Claude to generate task breakdown with Task List (ordered, atomic), Dependencies, File Mapping, Test Expectations sections, using approved spec AND plan as context
- [ ] T050 [US6] Add "Generate" button and AI generation to tasks page in `app/project/[id]/tasks/page.tsx`: "Generate" button sends approved spec + plan content as context, populates section editors, loading state, section regeneration. Reuse `stream-client.ts` from US3.

**Checkpoint**: At this point, User Story 6 should be fully functional and testable independently

---

## Phase 9: User Story 7 - Export Specs (Priority: High)

**Goal**: When all phases are reviewed, export three markdown files as individual downloads or a single zip archive.

**Independent Test**: Approve all three phases, click "Export", download zip, verify it contains `spec.md`, `plan.md`, `tasks.md` with correct content matching the latest saved content.

### Tests for User Story 7

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T051 [P] [US7] Unit tests for markdown export in `__tests__/unit/export.test.ts`: verify each phase generates correct markdown with section titles and content in order, verify EARS format preserved in exported spec
- [ ] T052 [P] [US7] Unit tests for zip export in `__tests__/unit/zip-export.test.ts`: verify zip contains three files (spec.md, plan.md, tasks.md), verify content matches latest saved content

### Implementation for User Story 7

- [ ] T053 [US7] Create markdown export utility in `lib/export/markdown.ts`: generate `spec.md`, `plan.md`, `tasks.md` from project sections using fixed section templates. Each file concatenates section titles and content in order.
- [ ] T054 [US7] Create zip export utility in `lib/export/zip.ts`: use `client-zip` to bundle three markdown files into a single zip archive, trigger browser download
- [ ] T055 [US7] Create export UI in `components/phase/export-panel.tsx`: "Export as Zip" and "Export Individual Files" buttons, disabled with tooltip when any phase is not "reviewed". Place in tasks phase page or project layout.

**Checkpoint**: All user stories should now be independently functional

---

## Phase 10: User Story 8 - Traceability Matrix (Priority: High)

**Goal**: Developers can see a visual matrix showing how requirements map to plan sections and tasks. AI generates mappings during phase generation; developers can also add/remove mappings manually. Coverage gaps are highlighted.

**Independent Test**: Generate plan from approved spec, verify AI mappings appear. Open traceability matrix view, verify requirements as rows and plan sections as columns. Click a cell to see linked content. Manually add a mapping, verify it persists. Click "Re-analyze Mappings", verify AI-generated mappings refresh while manual ones are preserved.

### Tests for User Story 8

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T063 [P] [US8] Unit tests for traceability mapping CRUD in `__tests__/unit/traceability.test.ts`: test `addMapping()`, `removeMapping()`, `getMappingsForProject()`, `clearAiMappings()` (preserves manual), coverage percentage calculation
- [ ] T064 [P] [US8] Unit tests for traceability matrix component in `__tests__/unit/traceability-matrix.test.ts`: renders requirements as rows, renders plan/task columns, highlights gap rows, displays coverage percentage, distinguishes AI vs manual mappings, cell click shows detail view

### Implementation for User Story 8

- [ ] T065 [US8] Add `TraceabilityMapping` type to `lib/types/index.ts` and `traceabilityMappings` field to `Project` interface: `{ id, requirementId, requirementLabel, targetType, targetId, targetLabel, origin: "ai" | "manual", createdAt }`. Requirement IDs are slugs parsed from EARS headings (e.g., `"fr-001"`, `"fr-010"`).
- [ ] T066 [US8] Create traceability mapping operations in `lib/db/traceability.ts`: `addMapping()`, `removeMapping()`, `getMappingsForProject()`, `clearAiMappings(projectId)` (preserves manual mappings), `getCoverageStats(project)` returning `{ planCoverage: { covered, total }, taskCoverage: { covered, total } }` where `total` is the count of distinct requirements parsed from the spec phase content (matches spec: "X of Y requirements have linked plan sections")
- [ ] T067 [US8] Update plan and tasks LLM prompts in `lib/prompts/plan.ts` and `lib/prompts/tasks.ts` (requires T046 and T049 to be complete): add instructions for AI to output traceability metadata (JSON mapping of section → requirement IDs) alongside generated content. Note: requirement slugs (e.g., `"fr-001"`) are derived from the positional heading number, not the full title — this maximizes slug stability if requirement titles are renamed. Known limitation: if requirements are reordered or deleted, previously stored mappings may reference stale slugs.
- [ ] T068 [US8] Parse and persist AI-generated mappings in plan generation flow (`app/project/[id]/plan/page.tsx`): extract mapping metadata from LLM response, create `TraceabilityMapping` records with `origin: "ai"`, persist to project record in IndexedDB
- [ ] T069 [US8] Parse and persist AI-generated mappings in tasks generation flow (`app/project/[id]/tasks/page.tsx`): extract mapping metadata from LLM response, create `TraceabilityMapping` records with `origin: "ai"`, persist to project record in IndexedDB
- [ ] T070 [US8] Create traceability matrix page in `app/project/[id]/traceability/page.tsx`: load project and mappings, render matrix table component, "Re-analyze Mappings" button that calls LLM API to regenerate AI mappings
- [ ] T071 [US8] Create traceability matrix table component in `components/traceability/matrix-table.tsx`: requirements as rows, plan sections + tasks as columns, cell indicators (linked/gap), gap row highlighting (amber/red), coverage percentage display, AI vs manual mapping distinction (icon/label)
- [ ] T072 [US8] Create cell detail view in `components/traceability/cell-detail.tsx`: clicking a cell shows linked content from both phases side by side in a dialog, manual add/remove mapping toggle, immediate persist to IndexedDB
- [ ] T073 [US8] Add "Traceability" navigation link to project workspace in `components/phase/phase-nav.tsx`: accessible at any time (not gated by phase status), links to `/project/[id]/traceability`
- [ ] T074 [US8] Integration test for re-analyze mappings flow in `__tests__/integration/traceability-reanalyze.test.ts`: mock LLM response → call "Re-analyze Mappings" → verify AI-generated mappings are replaced → verify manual mappings are preserved → verify coverage stats update → verify matrix UI refreshes

**Checkpoint**: At this point, User Story 8 should be fully functional and testable independently

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T056 [P] Integration tests for project CRUD workflow in `__tests__/integration/project-crud.test.ts`: create project → verify in list → update name → verify change persisted → delete → verify removed from list. Tests Dexie + Zustand integration.
- [ ] T057 [P] Integration tests for phase gate workflow in `__tests__/integration/phase-workflow.test.ts`: create project → fill all spec sections → approve → verify plan unlocks → fill plan sections → approve → verify tasks unlocks → edit requirement → confirm cascade reset → verify downstream phases reset to draft with content preserved.
- [ ] T058 [P] Add loading skeletons to project list and phase editors for perceived performance
- [ ] T059 [P] Add keyboard navigation focus management when switching between phases in `components/phase/phase-nav.tsx`
- [ ] T060 [P] Add `aria-live="polite"` regions for auto-save status and generation progress indicators
- [ ] T061 Verify all performance targets: project list <1s, creation <500ms, navigation <500ms, export <2s
- [ ] T062 Run quickstart.md validation: follow the first-time user flow end-to-end

---

## Phase 12: Markdown Rendering (Cross-Cutting)

**Purpose**: Render AI-generated markdown content properly across all phase editors

- [ ] T075 [P] Install `remark-gfm` and `mermaid` packages via npm
- [ ] T076 [P] Create MermaidDiagram component in `components/editor/mermaid-diagram.tsx`: client component using `mermaid.render()` in useEffect, renders mermaid code string to SVG, error fallback shows raw code with error message
- [ ] T077 Create MarkdownRenderer component in `components/editor/markdown-renderer.tsx`: wraps ReactMarkdown with remarkGfm plugin, custom code component (detects `language-mermaid` → MermaidDiagram, other fenced blocks → `<pre><code>`), custom table/th/td components for styled GFM tables, prose classes for typography
- [ ] T078 Add edit/preview toggle to section editor in `components/editor/section-editor.tsx`: viewMode state ("edit"/"preview"), Edit/Preview toggle buttons in section header (visible when editable + content exists), reviewed phases always render MarkdownRenderer, empty sections always show textarea
- [ ] T079 [P] Unit tests for MarkdownRenderer in `__tests__/unit/markdown-renderer.test.tsx`: mock react-markdown (ESM workaround), test basic rendering, headings, GFM tables, mermaid code block detection, non-mermaid code blocks, inline code, lists

---

## Phase 13: Mermaid Prompts & Default Preview

**Purpose**: Ensure AI-generated content uses mermaid diagrams and sections default to preview after generation

- [ ] T080 [P] Update `getPlanSystemPrompt()` and `getRegeneratePlanSectionPrompt()` in `lib/prompts/plan.ts` to require mermaid fenced code blocks for all diagrams
- [ ] T081 [P] Update `getTasksSystemPrompt()` and `getRegenerateTaskSectionPrompt()` in `lib/prompts/tasks.ts` to require mermaid dependency graph
- [ ] T082 Add `defaultViewMode` prop to `SectionEditor` in `components/editor/section-editor.tsx`, thread through `GatedPhasePage` with `generationKey` in `components/phase/gated-phase-page.tsx`
- [ ] T083 [P] Update Plan page in `app/project/[id]/plan/page.tsx` to increment `generationKey` after generation, pass `defaultViewMode="preview"`
- [ ] T084 [P] Update Tasks page in `app/project/[id]/tasks/page.tsx` same as Plan
- [ ] T085 [P] Add unit tests for mermaid prompt instructions in `__tests__/unit/plan-prompt.test.ts` and `__tests__/unit/tasks-prompt.test.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 - Project CRUD (Phase 3)**: Depends on Foundational. No other story dependencies.
- **US4 - Phase Gates (Phase 4)**: Depends on US1 (needs project creation and routing to navigate to phase pages).
- **US2 - API Key Config (Phase 5)**: Depends on Foundational only. Can run in parallel with US1 and US4. Must complete before AI features.
- **US3 - Spec Gen (Phase 6)**: Depends on US4 (spec page exists) + US2 (API key configured). Adds "Generate" to existing page.
- **US5 - Plan Gen (Phase 7)**: Depends on US3 (reuses streaming infra). Can run in parallel with US6 and US7.
- **US6 - Tasks Gen (Phase 8)**: Depends on US3 (reuses streaming infra). Can run in parallel with US5 and US7.
- **US7 - Export (Phase 9)**: Depends on US4 only (needs phase pages and "all phases reviewed" check). Does NOT need AI generation. Can run in parallel with US3, US5, US6.
- **US8 - Traceability Matrix (Phase 10)**: Depends on US3 (reuses streaming infra + needs generation flows to hook into), US5, and US6 (needs plan and task generation to produce mappings). Can run in parallel with US7.
- **Markdown Rendering (Phase 12)**: Depends on Foundational (T014 section editor). Can run in parallel with US3–US8.
- **Mermaid Prompts & Default Preview (Phase 13)**: Depends on Phase 12 (markdown rendering) and US5/US6 (plan/tasks generation pages).
- **Polish (Phase 11)**: Depends on all user stories being complete.

### Critical Path

```text
Setup → Foundational → US1 (CRUD) → US4 (Phase Gates) → US3 (AI Spec Gen) → US5 (AI Plan Gen) ─┬→ US8 (Traceability) → Polish
                         ↘ US2 (API Key) ──────────────↗       ↘ US6 (AI Tasks Gen) ─────────────┘
                                            US4 ──────────────→ US7 (Export) ──────────────────────────────────────────→↗
```

### Parallel Opportunities

**Within phases:**
- T003, T004, T005, T006 can all run in parallel (Phase 1)
- T008, T009 test tasks can run in parallel (Phase 2)
- T016, T017 test tasks can run in parallel within US1
- T024, T025 test tasks can run in parallel within US4
- T037, T038 test tasks can run in parallel within US3
- T051, T052 test tasks can run in parallel within US7
- T045, T045b test tasks can run in parallel within US5
- T048, T048b test tasks can run in parallel within US6
- T063, T064 test tasks can run in parallel within US8
- T056, T057, T058, T059, T060 can all run in parallel (Phase 11)

**Across phases:**
- US2 (API Key) can run in parallel with US1 and US4 — independent concern, only needs Foundational
- US5 (Plan Gen) and US6 (Tasks Gen) can run in parallel — both depend on US3 but not on each other
- US7 (Export) can run in parallel with US3, US5, US6, US8 — only depends on US4
- US8 (Traceability) can run in parallel with US7 — both depend on AI generation stories but not on each other

---

## Implementation Strategy

### MVP First (US1 + US4 + US2 + US3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (with tests)
3. Complete Phase 3: US1 - Project CRUD (with tests)
4. In parallel: US2 - API Key Config (with tests)
5. Complete Phase 4: US4 - Phase Gate Enforcement (with tests)
6. **STOP and VALIDATE**: Create a project, manually type content, approve phases, verify gates work
7. Complete Phase 6: US3 - AI Spec Generation (with tests)
8. **STOP and VALIDATE**: Generate spec via AI, edit, approve, verify full workflow
9. Demo if ready — this is the core SDD workflow loop

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Can create/manage projects
3. US2 (parallel) → API key configured
4. US4 → Phase gates work with manual content (core value!)
5. US3 → AI generation added to spec (MVP!)
6. US5 + US6 + US7 (parallel) → Plan gen, tasks gen, and export
7. US8 → Traceability matrix (after AI generation stories)
8. Polish → Accessibility, performance, final validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Task IDs are assigned in the order phases were defined. Phase 11 (Polish, T056–T062) was defined before Phase 10 (US8, T063–T074), so its IDs are numerically lower. Task IDs are stable identifiers — they are not renumbered when new phases are inserted.
- TDD: Write tests first, ensure they fail, then implement
- Unit tests are part of code review — all PRs must include passing tests
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The section editor (T014) is built in Foundational and reused by all phases
- The streaming infrastructure (T039, T041) is built in US3 and reused by US5 and US6
- The MarkdownRenderer (T077) is built in Phase 12 and used by all phase editors via SectionEditor
- Phase 13 adds mermaid prompt instructions and default preview mode after generation for Plan and Tasks phases
- Phase pages (T030–T032) are built in US4; AI generation is added to them in US3/US5/US6
