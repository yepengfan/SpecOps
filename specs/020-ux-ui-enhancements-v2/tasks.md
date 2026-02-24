# Tasks: UX/UI Enhancements v2

**Input**: Design documents from `/specs/020-ux-ui-enhancements-v2/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-contracts.md

**Tests**: Included — constitution mandates TDD (test-first, then implementation, then refactor).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: No new project initialization needed — existing codebase. This phase is intentionally empty.

**Checkpoint**: Ready to proceed to foundational work.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data model changes that block User Story 9 (Archiving) and User Story 2 (archive toggle in search controls).

**CRITICAL**: No archiving or archive-aware UI work can begin until this phase is complete.

- [x] T001 Write test for `archivedAt` field on Project interface in `__tests__/unit/project-types.test.ts`
- [x] T002 Add `archivedAt?: number` field to Project interface in `lib/types/index.ts`
- [x] T003 Write test for Dexie v5 migration in `__tests__/unit/database-migration.test.ts`
- [x] T004 Add Dexie version 5 migration in `lib/db/database.ts` (no index change, no upgrade callback — existing projects default to undefined)
- [x] T005 Write tests for `archiveProject()` and `unarchiveProject()` functions in `__tests__/unit/project-archive.test.ts`
- [x] T006 Implement `archiveProject(id)` and `unarchiveProject(id)` in `lib/db/projects.ts`

**Checkpoint**: Foundation ready — data model supports archiving, user story implementation can begin.

---

## Phase 3: User Story 1 — Toast Notifications (Priority: P1) MVP

**Goal**: Replace inline amber/red error banners with transient Sonner toast notifications for all success, error, and warning events.

**Independent Test**: Trigger any AI generation, phase approval, or export action and verify a transient toast notification appears with the correct message.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [P] [US1] Write test verifying malformed AI response shows toast.warning() instead of inline banner in `__tests__/unit/toast-migration-spec.test.tsx`
- [x] T008 [P] [US1] Write test verifying phase approval triggers toast.success() in `__tests__/unit/toast-approval.test.tsx`
- [x] T009 [P] [US1] Write test verifying chat panel errors use toast.error() instead of inline display in `__tests__/unit/toast-chat-error.test.tsx`

### Implementation for User Story 1

- [x] T010 [US1] Replace malformed AI response inline banner with `toast.warning()` in `app/project/[id]/spec/page.tsx`
- [x] T011 [P] [US1] Replace malformed AI response inline banner with `toast.warning()` in `app/project/[id]/plan/page.tsx`
- [x] T012 [P] [US1] Replace malformed AI response inline banner with `toast.warning()` in `app/project/[id]/tasks/page.tsx`
- [x] T013 [US1] Replace chat panel inline error display with `toast.error()` in `components/chat/chat-panel.tsx`
- [x] T014 [US1] Add `toast.success()` for phase approval in `components/phase/approve-button.tsx`

**Checkpoint**: All transient feedback uses toast notifications. Prerequisite banners (plan/tasks pages) and empty-state banners (traceability) intentionally kept as inline UI.

---

## Phase 4: User Story 2 — Search and Filter Project List (Priority: P1)

**Goal**: Add search bar, sort dropdown, and archive toggle to the project list page for quick project discovery.

**Independent Test**: Create several projects, type a search term, verify only matching projects appear. Change sort order, verify list reorders.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T015 [P] [US2] Write test for search filtering (case-insensitive substring match by name) in `__tests__/unit/project-search.test.tsx`
- [ ] T016 [P] [US2] Write test for sort options (all 5 options produce correct ordering) in `__tests__/unit/project-sort.test.tsx`
- [ ] T017 [P] [US2] Write test for archive toggle (active-only vs all projects) in `__tests__/unit/project-archive-filter.test.tsx`
- [ ] T018 [P] [US2] Write test for empty state when no projects match search in `__tests__/unit/project-search-empty.test.tsx`

### Implementation for User Story 2

- [ ] T019 [US2] Add `SortOption` type and search/sort/archive state to `components/ui/project-list.tsx`
- [ ] T020 [US2] Add search input with Search icon, sort dropdown (Select), and archive toggle button to `components/ui/project-list.tsx`
- [ ] T021 [US2] Implement `useMemo` filtering and sorting logic (archive filter → search → sort) in `components/ui/project-list.tsx`
- [ ] T022 [US2] Add empty state message for "no projects match search" in `components/ui/project-list.tsx`

**Checkpoint**: Users can search, sort, and toggle archived project visibility on the project list page.

---

## Phase 5: User Story 3 — Project Description on Cards (Priority: P2)

**Goal**: Show truncated project description on each ProjectCard in the project list.

**Independent Test**: Create a project with a description, verify the description text appears truncated to 3 lines on the card.

### Tests for User Story 3

- [x] T023 [P] [US3] Write test for description rendering (truncated, no description placeholder) in `__tests__/unit/project-card-description.test.tsx`

### Implementation for User Story 3

- [x] T024 [US3] Add description text with `line-clamp-3` and "No description" placeholder to `components/ui/project-card.tsx`

**Checkpoint**: Project cards display descriptions (or placeholder text) on the project list page.

---

## Phase 6: User Story 4 — Breadcrumb Navigation (Priority: P2)

**Goal**: Add breadcrumb trail on all project subpages for location awareness and quick navigation.

**Independent Test**: Navigate to any project phase page, verify breadcrumb shows correct segments, each segment navigates to expected destination.

### Tests for User Story 4

- [x] T025 [P] [US4] Write test for Breadcrumb component rendering (3 segments, links, truncation, aria-current) in `__tests__/unit/breadcrumb.test.tsx`
- [x] T026 [P] [US4] Write test for overview page showing 2-segment breadcrumb (no phase segment) in `__tests__/unit/breadcrumb.test.tsx`

### Implementation for User Story 4

- [x] T027 [US4] Create Breadcrumb component with nav, ol, Link segments, ChevronRight separator, and truncation in `components/ui/breadcrumb.tsx`
- [x] T028 [US4] Integrate Breadcrumb into project layout between header and PhaseNav in `app/project/[id]/layout.tsx`

**Checkpoint**: Breadcrumbs visible on all project subpages with correct navigation.

---

## Phase 7: User Story 5 — Progress Indicator for AI Operations (Priority: P2)

**Goal**: Replace static "Generating..."/"Regenerating..." text with animated skeleton loaders during AI operations.

**Independent Test**: Trigger any AI generation, verify skeleton loader appears in the content area, disappears when operation completes.

**Dependency**: US1 (toast notifications) should be complete so error states during AI operations use toasts.

### Tests for User Story 5

- [x] T029 [P] [US5] Write test for skeleton loader appearing when `isRegenerating` is true in `__tests__/unit/section-editor-skeleton.test.tsx`
- [x] T030 [P] [US5] Write test for skeleton disappearing when `isRegenerating` becomes false in `__tests__/unit/section-editor-skeleton.test.tsx`

### Implementation for User Story 5

- [x] T031 [US5] Replace "Regenerating..." text with Skeleton loader (4 lines of varying width) in `components/editor/section-editor.tsx`
- [x] T032 [US5] Add skeleton loader for deep analysis status in `components/eval/evaluation-panel.tsx`

**Checkpoint**: All AI operations display animated skeleton progress indicators instead of static text.

---

## Phase 8: User Story 6 — Export Success Feedback (Priority: P3)

**Goal**: Show toast notifications after successful export actions.

**Independent Test**: Click any export button, verify a success toast appears after the file downloads.

**Dependency**: US1 (toast notifications) must be complete.

### Tests for User Story 6

- [ ] T033 [P] [US6] Write test for export success toast messages (per-phase and ZIP) in `__tests__/unit/export-toast.test.tsx`
- [ ] T034 [P] [US6] Write test for export error toast on failure in `__tests__/unit/export-toast.test.tsx`

### Implementation for User Story 6

- [ ] T035 [US6] Add `toast.success()` after each successful export and `toast.error()` on failure in `components/phase/export-panel.tsx`

**Checkpoint**: All export actions provide toast feedback on success or failure.

---

## Phase 9: User Story 7 — Responsive Traceability Table (Priority: P3)

**Goal**: Make traceability matrix first column sticky during horizontal scroll on narrow viewports.

**Independent Test**: View traceability page on a narrow viewport, scroll horizontally, verify first column stays fixed.

### Tests for User Story 7

- [ ] T036 [US7] Write test verifying first column cells have `sticky left-0` classes in `__tests__/unit/matrix-table-sticky.test.tsx`

### Implementation for User Story 7

- [ ] T037 [US7] Add `sticky left-0 z-10 bg-background` to first column th and td elements in `components/traceability/matrix-table.tsx`
- [ ] T038 [US7] Add right border shadow on sticky column for visual separation in `components/traceability/matrix-table.tsx`

**Checkpoint**: Traceability matrix is usable on narrow viewports with sticky requirement labels.

---

## Phase 10: User Story 8 — Chat Panel Resize (Priority: P3)

**Goal**: Allow users to drag-resize the chat panel on desktop, with width persisted across sessions.

**Independent Test**: Drag the chat panel's left edge, verify width changes, close and reopen panel, verify width persists.

### Tests for User Story 8

- [ ] T039 [P] [US8] Write test for ChatResizeHandle pointer event handling (pointerdown, pointermove, pointerup) in `__tests__/unit/chat-resize-handle.test.tsx`
- [ ] T040 [P] [US8] Write test for width clamping to [320, 640] range in `__tests__/unit/chat-resize-handle.test.tsx`
- [ ] T041 [P] [US8] Write test for localStorage persistence of chat panel width in `__tests__/unit/chat-panel-width.test.tsx`
- [ ] T042a [P] [US8] Write test verifying resize handle is not rendered on mobile viewports in `__tests__/unit/chat-resize-handle.test.tsx`

### Implementation for User Story 8

- [ ] T042 [US8] Create ChatResizeHandle component with pointer event handlers and cursor styling in `components/chat/chat-resize-handle.tsx`
- [ ] T043 [US8] Integrate ChatResizeHandle into ChatPanel — replace fixed `w-96` with dynamic width from state, read initial width from localStorage in `components/chat/chat-panel.tsx`
- [ ] T044 [US8] Add localStorage read/write for `specops-chat-panel-width` key in `components/chat/chat-panel.tsx`
- [ ] T044a [US8] Add keyboard accessibility to ChatResizeHandle (arrow keys adjust width by 10px, focusable with tabindex) in `components/chat/chat-resize-handle.tsx`

**Checkpoint**: Chat panel is resizable on desktop with persisted width preference. Resize handle is keyboard accessible per WCAG 2.1 AA.

---

## Phase 11: User Story 9 — Project Archiving (Priority: P3)

**Goal**: Allow users to archive/unarchive projects with a toggle to show/hide archived projects.

**Independent Test**: Archive a project, verify it disappears from the default list, toggle the filter, verify it appears, unarchive it.

**Dependency**: Phase 2 (foundational data model) must be complete.

### Tests for User Story 9

- [ ] T045 [P] [US9] Write test for archive button rendering and action on ProjectCard in `__tests__/unit/project-card-archive.test.tsx`
- [ ] T046 [P] [US9] Write test for archived project visual indicator (opacity, badge) in `__tests__/unit/project-card-archive.test.tsx`
- [ ] T047 [P] [US9] Write test for unarchive action on archived ProjectCard in `__tests__/unit/project-card-archive.test.tsx`
- [ ] T048 [P] [US9] Write test for archive toast notifications ("Project archived" / "Project restored") in `__tests__/unit/project-card-archive.test.tsx`

### Implementation for User Story 9

- [ ] T049 [US9] Add Archive/Unarchive button (with Archive/ArchiveRestore icons) to ProjectCard in `components/ui/project-card.tsx`
- [ ] T050 [US9] Add archived visual indicator (opacity-75, "Archived" badge) to ProjectCard in `components/ui/project-card.tsx`
- [ ] T051 [US9] Add archive/unarchive toast notifications to ProjectCard in `components/ui/project-card.tsx`
- [ ] T052 [US9] Add empty state for "all active projects archived" with guidance to check archive in `components/ui/project-list.tsx`

**Checkpoint**: Projects can be archived, unarchived, and filtered from the project list.

**Note**: FR-029 (archived projects remain accessible) requires no implementation — existing project opening logic does not check archive status.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup across all stories.

- [ ] T053 [P] Verify all inline amber banners are replaced per the disposition table in `contracts/ui-contracts.md`
- [ ] T054 [P] Verify accessibility: breadcrumb aria-label, toast aria-live, resize handle keyboard support across all new components
- [ ] T055 [P] Verify prefers-reduced-motion is respected in skeleton loaders and toast animations
- [ ] T056 Run full test suite (`npm test && npm run lint`) and fix any failures
- [ ] T057 Run quickstart.md verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — existing project
- **Foundational (Phase 2)**: No dependencies — can start immediately. BLOCKS Phase 11 (US9) and partially Phase 4 (US2 archive toggle)
- **User Stories (Phase 3-11)**: See individual dependencies below
- **Polish (Phase 12)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1) Toast Notifications**: Can start immediately — no dependencies
- **US2 (P1) Search & Sort**: Can start after Phase 2 (needs archive toggle support)
- **US3 (P2) Description on Cards**: Can start immediately — no dependencies
- **US4 (P2) Breadcrumb**: Can start immediately — no dependencies
- **US5 (P2) Progress Indicator**: Should start after US1 (error states use toasts)
- **US6 (P3) Export Feedback**: Must start after US1 (uses toast.success)
- **US7 (P3) Responsive Table**: Can start immediately — no dependencies
- **US8 (P3) Chat Resize**: Can start immediately — no dependencies
- **US9 (P3) Archiving**: Must start after Phase 2 (data model)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD per constitution)
- Implementation in order: model/data → service/logic → component/UI
- Each commit is atomic: one for tests, one for implementation, one for refactor

### Parallel Opportunities

**Immediate parallel starts** (no dependencies):
- US1 (Toast), US3 (Description), US4 (Breadcrumb), US7 (Table), US8 (Chat Resize)

**After Phase 2 completes**:
- US2 (Search & Sort), US9 (Archiving)

**After US1 completes**:
- US5 (Progress Indicator), US6 (Export Feedback)

---

## Parallel Example: Immediate Start

```text
# These 5 stories can all begin in parallel immediately:
US1: T007-T014 (Toast Notifications)
US3: T023-T024 (Description on Cards)
US4: T025-T028 (Breadcrumb Navigation)
US7: T036-T038 (Responsive Table)
US8: T039-T044 (Chat Panel Resize)

# Phase 2 can also run in parallel with the above:
Foundational: T001-T006 (Data Model for Archiving)
```

## Parallel Example: After Phase 2

```text
# Once Phase 2 is complete, these can start:
US2: T015-T022 (Search & Sort with archive toggle)
US9: T045-T052 (Project Archiving)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (data model — quick, 6 tasks)
2. Complete Phase 3: US1 — Toast Notifications
3. **STOP and VALIDATE**: Verify toasts work for all events
4. This alone delivers a noticeable UX improvement

### Incremental Delivery

1. US1 (Toasts) + Phase 2 (Data Model) → Foundation ready
2. US2 (Search & Sort) + US3 (Description) → Project list dramatically improved
3. US4 (Breadcrumb) + US5 (Progress Indicator) → Navigation and feedback improved
4. US6 (Export Feedback) + US7 (Responsive Table) + US8 (Chat Resize) + US9 (Archiving) → Polish complete
5. Phase 12: Final verification

### Single Developer Strategy (Recommended)

Execute in priority order, respecting dependencies:
1. Phase 2 → US1 → US2 → US3 → US4 → US5 → US6 → US7 → US8 → US9 → Phase 12

---

## Notes

- [P] tasks = different files, no dependencies — can be done in parallel
- [Story] label maps task to specific user story for traceability
- Constitution mandates TDD: write failing test → implement → refactor → atomic commits
- Prerequisite banners (plan/tasks pages) and empty-state banners (traceability) are intentionally kept as inline UI — they are instructional state, not transient feedback
- FR-002 (toast timing) and FR-003 (toast stacking) are covered by Sonner library defaults — no custom implementation needed
- FR-029 (archived projects accessible) requires no code change — existing behavior covers it
- Total tasks: 59
