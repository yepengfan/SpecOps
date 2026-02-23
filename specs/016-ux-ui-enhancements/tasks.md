# Tasks: UX/UI Enhancements

**Input**: Design documents from `/specs/016-ux-ui-enhancements/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested. Existing test suite (313 tests) verified to pass after all changes. One test file (`phase-nav.test.tsx`) requires update for the new Overview tab.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies and create foundational UI primitives shared across multiple user stories

- [ ] T001 Install `sonner` toast notification dependency via `npm install sonner`
- [ ] T002 Install `next-themes` dark mode dependency via `npm install next-themes`
- [ ] T003 [P] Create Sonner toaster wrapper component with theme integration in `components/ui/sonner.tsx` — re-export Sonner's `<Toaster>` with shadcn theming defaults and `useTheme()` from next-themes to pass current theme as prop
- [ ] T004 [P] Create Collapsible primitive re-export in `components/ui/collapsible.tsx` — export `Collapsible` (Root), `CollapsibleTrigger`, and `CollapsibleContent` from `@radix-ui/react-collapsible`
- [ ] T005 [P] Create AlertDialog component in `components/ui/alert-dialog.tsx` — re-export Radix AlertDialog primitives (Root, Trigger, Content, Header, Footer, Title, Description, Action, Cancel) with shadcn styling
- [ ] T006 [P] Create ThemeProvider wrapper in `components/ui/theme-provider.tsx` — client component wrapping `next-themes` `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem` props
- [ ] T007 [P] Create ThemeToggle button in `components/ui/theme-toggle.tsx` — client component with Sun/Moon icon toggle using `useTheme()` from next-themes, sized to match nav text style

**Checkpoint**: Dependencies installed, all UI primitives created. `npm run lint` passes. No user-facing changes yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire shared infrastructure into the application layout — MUST complete before user stories

**⚠️ CRITICAL**: Toast and theme infrastructure must be in the layout before any page can use them

- [ ] T008 Add `<ThemeProvider>` wrapper around body children in `app/layout.tsx` — wrap with `attribute="class"`, `defaultTheme="system"`, `enableSystem`; add `suppressHydrationWarning` to `<html>` element
- [ ] T009 Add `<Toaster />` component from `components/ui/sonner.tsx` to `app/layout.tsx` — place before closing `</body>` so toasts render on all pages
- [ ] T010 Add `<ThemeToggle />` component to the navigation bar in `app/layout.tsx` — place after the Settings link in the nav
- [ ] T011 Add press-down scale animation to button base styles in `components/ui/button.tsx` — add `active:scale-[0.97] transition-transform` to the CVA base class string

**Checkpoint**: Foundation ready — Toaster mounted globally, ThemeProvider wrapping app, theme toggle in nav, button animations active. All user story implementation can now begin.

---

## Phase 3: User Story 1 — Improved Error Feedback (Priority: P1) 🎯 MVP

**Goal**: Replace inline error banners with toast notifications across all phase pages and the evaluation panel. Keep informational inline warnings as-is.

**Independent Test**: Trigger a generation error on any phase page — verify toast appears and auto-dismisses. Verify amber informational warnings remain inline. Trigger deep analysis failure — verify toast with Retry action.

### Implementation

- [ ] T012 [P] [US1] Replace `error` state and inline red error banner with `toast.error(message)` in `app/project/[id]/spec/page.tsx` — remove `error` useState, remove `{error && ...}` JSX block, import `toast` from `sonner`, call `toast.error(message)` in catch blocks; keep amber "Requirements must be reviewed" inline warning
- [ ] T013 [P] [US1] Replace `error` state and inline red error banner with `toast.error(message)` in `app/project/[id]/plan/page.tsx` — remove `error` useState, remove `{error && ...}` JSX block, import `toast` from `sonner`, call `toast.error(message)` in catch blocks; keep amber "Spec must be reviewed" inline warning
- [ ] T014 [P] [US1] Replace `error` state and inline red error banner with `toast.error(message)` in `app/project/[id]/tasks/page.tsx` — remove `error` useState, remove `{error && ...}` JSX block, import `toast` from `sonner`, call `toast.error(message)` in catch blocks; keep amber "Plan must be reviewed" inline warning
- [ ] T015 [P] [US1] Replace `error` state and inline red error banner with `toast.error(message)` in `app/project/[id]/traceability/page.tsx` — remove `error` useState, remove `{error && ...}` JSX block, import `toast` from `sonner`, call `toast.error(message)` in catch block
- [ ] T016 [P] [US1] Replace `analysisError` state and inline red error div with `toast.error(message, { action: { label: "Retry", onClick: handleDeepAnalysis } })` in `components/eval/evaluation-panel.tsx` — remove `analysisError` useState, remove the error display JSX, import `toast` from `sonner`, use toast with retry action in the deep analysis catch block; also replace the inline catch error with `toast.error()` for the evaluation error

**Checkpoint**: All transient errors display as toasts. Informational amber warnings remain inline. Deep analysis failure offers Retry via toast action. `npm test` passes.

---

## Phase 4: User Story 2 — Content Safety and Evaluation Visibility (Priority: P1)

**Goal**: Auto-expand the evaluation panel when results arrive (fresh or from DB) and add a confirmation dialog before regenerating non-empty sections

**Independent Test**: Run evaluation on a phase — verify panel auto-expands. Reload a project with saved evaluation — verify panel auto-expands. Click Regenerate on a filled section — verify confirmation dialog. Click Regenerate on an empty section — verify immediate regeneration.

### Implementation

- [ ] T017 [US2] Add auto-expand logic to `components/eval/evaluation-panel.tsx` — use "derived state from props" pattern: add `prevEvaluation` state initialized to `evaluation`, compare on each render, when evaluation changes from null/undefined to a value set `isOpen(true)`; do NOT use useEffect or useRef (prohibited by React 19 lint rules)
- [ ] T018 [US2] Add AlertDialog regeneration confirmation to `components/editor/section-editor.tsx` — import AlertDialog components from `components/ui/alert-dialog.tsx`; add `confirmOpen` state; when Regenerate is clicked and section `content` is non-empty, open AlertDialog with message "Regenerate this section? Current content will be replaced." and Continue/Cancel buttons; when content is empty, call `onRegenerate` directly; on Continue, call `onRegenerate` and close dialog

**Checkpoint**: Evaluation panel auto-expands on first results (both fresh and DB-loaded). Regeneration requires confirmation for non-empty sections, skips dialog for empty sections. `npm test` passes.

---

## Phase 5: User Story 3 — Mobile-Responsive Chat and Section Navigation (Priority: P2)

**Goal**: Make the chat panel full-width on mobile with a backdrop overlay, and add collapsible section support to all phase pages

**Independent Test**: Resize to mobile viewport, open chat — verify full width with backdrop. Tap backdrop — verify panel closes. On a phase page, click section header — verify collapse. Click Expand All — verify all expand. Generate new content — verify sections reset to expanded.

### Implementation

- [ ] T019 [US3] Update chat panel for mobile responsiveness in `components/chat/chat-panel.tsx` — replace fixed `w-96` width class with `w-full md:w-96`; add a backdrop overlay div (`fixed inset-0 z-40 bg-black/50 md:hidden`) before the panel that calls the toggle/close function on click; backdrop only renders when panel is open and on viewports under 768px
- [ ] T020 [US3] Add collapsible sections with Expand/Collapse All to `components/phase/gated-phase-page.tsx` — import Collapsible, CollapsibleTrigger, CollapsibleContent from `components/ui/collapsible.tsx` and ChevronRight from lucide-react; track open state as `Set<string> | null` where null means "all open" (default); wrap each SectionEditor in a Collapsible with a trigger showing section title and rotating chevron; add `generationKey` prop and use "derived state from props" pattern with `prevGenerationKey` state to reset `openSections` to null when key changes; add "Collapse All / Expand All" ghost button above sections; pass empty string as `title` to SectionEditor since the trigger now renders the title

**Checkpoint**: Chat panel is full-width with backdrop on mobile, fixed-width on desktop. All phase sections are individually collapsible with chevron animation. Expand/Collapse All toggle works. Sections reset to expanded after generation. `npm test` passes.

---

## Phase 6: User Story 4 — Dark Mode and Onboarding Guidance (Priority: P2)

**Goal**: Enable dark/light theme switching via the nav bar toggle, respect system preference, and show onboarding guidance for new users on the spec page

**Independent Test**: Click theme toggle — verify theme switches. Reload — verify theme persists. Set OS to dark mode, clear localStorage, reload — verify dark mode. Open new project spec page — verify workflow indicator and guidance text. Generate content — verify onboarding disappears.

### Implementation

- [ ] T021 [US4] Create workflow indicator component in `components/phase/workflow-indicator.tsx` — client component showing three connected phase circles/dots (Spec → Plan → Tasks) with lines between them; accept project prop; derive phase states: "completed" (reviewed), "active" (current active phase), "locked" (locked); style active phase highlighted, completed phases with checkmark, locked phases grayed out
- [ ] T022 [US4] Add onboarding guidance and generationKey to spec page in `app/project/[id]/spec/page.tsx` — import WorkflowIndicator; add `generationKey` state (useState(0)); increment generationKey after successful generation (`setGenerationKey(k => k + 1)`); pass `generationKey` prop to GatedPhasePage; when spec phase has no content (all sections empty), render WorkflowIndicator and guidance text "Start by describing your project above, then click Generate to create a specification." below the Generate button

**Checkpoint**: Theme toggle switches between light/dark themes. System preference respected on first load. Theme persists across sessions. New project spec page shows workflow indicator and guidance text. Onboarding elements disappear after content generation. `npm test` passes.

---

## Phase 7: User Story 5 — Project Overview Dashboard (Priority: P2)

**Goal**: Add an Overview tab and dashboard page showing project health at a glance with phase cards, evaluation summaries, and traceability coverage

**Independent Test**: Navigate to Overview tab — verify phase cards with correct statuses and section counts. Verify evaluation pass/total counts for evaluated phases. Verify traceability coverage bar with percentage. Click Open on a phase card — verify navigation.

### Implementation

- [ ] T023 [US5] Create project overview dashboard page in `app/project/[id]/overview/page.tsx` — client component reading from Zustand store; render three phase progress cards (Spec, Plan, Tasks) each showing: icon, phase name, status badge (color-coded: green=reviewed, blue=draft, gray=locked), sections-with-content count, evaluation pass/total if available, Open button linking to phase page; render traceability coverage card using `parseRequirementIds()` from `lib/db/traceability.ts` with useMemo (MUST be before any early return to satisfy rules-of-hooks), show progress bar with percentage and "N of M requirements mapped" text, handle zero-requirements case with "No requirements detected yet" guidance; import Card components from shadcn/ui
- [ ] T024 [P] [US5] Add Overview tab to phase navigation in `components/phase/phase-nav.tsx` — add "Overview" entry with LayoutDashboard icon from lucide-react before the existing phase tabs; link to `/project/${projectId}/overview`; ensure it's never locked
- [ ] T025 [P] [US5] Update project redirect to overview in `app/project/[id]/page.tsx` — change the redirect target from the active phase to `/project/${id}/overview`

**Checkpoint**: Overview tab appears in navigation. Dashboard displays correct phase statuses, section counts, evaluation summaries, and traceability coverage. Open buttons navigate to phase pages. Empty-state guidance shown when no requirements exist. `npm test` passes.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Update tests, run full verification, ensure all quality gates pass

- [ ] T026 Update phase navigation test in `__tests__/unit/phase-nav.test.tsx` — add/update assertions to verify the Overview tab renders with correct label and link
- [ ] T027 Run `npm test` — all existing tests (313+) must pass with zero regressions
- [ ] T028 Run `npm run lint` — zero errors, zero warnings
- [ ] T029 Run quickstart.md verification scenarios 1-9 manually — verify all acceptance criteria per spec.md; additionally validate NFRs: only 2 new deps installed (NFR-001), toast auto-dismisses within 5 seconds (NFR-002), no FOUC on theme switch/page load (NFR-004), keyboard navigation works for collapsibles, theme toggle, and AlertDialog (constitution accessibility requirement)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — install deps and create primitives first
- **Phase 2 (Foundational)**: Depends on Phase 1 (T003, T006, T007) — wires infrastructure into layout. **BLOCKS all user stories.**
- **Phase 3 (US1)**: Depends on Phase 2 (T009 Toaster in layout) — toast calls need Toaster mounted
- **Phase 4 (US2)**: Depends on Phase 2 — also uses toast in evaluation panel (T016 from US1 should complete first for clean evaluation-panel.tsx edits)
- **Phase 5 (US3)**: Depends on Phase 1 (T004 collapsible primitive) and Phase 2 — independent of US1/US2
- **Phase 6 (US4)**: Depends on Phase 2 (T008 ThemeProvider, T010 ThemeToggle in layout) — independent of US1/US2/US3
- **Phase 7 (US5)**: Depends on Phase 2 — independent of all other user stories (reads existing store data)
- **Phase 8 (Polish)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P1)**: Can start after Phase 2 — recommended after US1 since both modify `evaluation-panel.tsx`
- **US3 (P2)**: Can start after Phase 2 — fully independent of US1/US2
- **US4 (P2)**: Can start after Phase 2 — fully independent of US1/US2/US3
- **US5 (P2)**: Can start after Phase 2 — fully independent of all other stories

### Within Each Phase

- **Phase 1**: T001+T002 sequential (npm install), then T003+T004+T005+T006+T007 all parallel (different files)
- **Phase 2**: T008 first (ThemeProvider wraps layout), then T009+T010+T011 parallel (different concerns in same file, but sequential for clean diffs)
- **Phase 3 (US1)**: T012+T013+T014+T015+T016 all parallel (different files)
- **Phase 4 (US2)**: T017 then T018 (different files, but T017 modifies evaluation-panel which T016 also touched)
- **Phase 5 (US3)**: T019+T020 parallel (different files)
- **Phase 6 (US4)**: T021 then T022 (workflow-indicator must exist before spec page imports it)
- **Phase 7 (US5)**: T023 first, then T024+T025 parallel (different files)
- **Phase 8**: T026 → T027 → T028 → T029 sequential (each validates previous)

### Parallel Opportunities

```bash
# Phase 1: All primitives in parallel (different files)
Task: T003 "Create components/ui/sonner.tsx"
Task: T004 "Create components/ui/collapsible.tsx"
Task: T005 "Create components/ui/alert-dialog.tsx"
Task: T006 "Create components/ui/theme-provider.tsx"
Task: T007 "Create components/ui/theme-toggle.tsx"

# Phase 3 (US1): All toast replacements in parallel (different files)
Task: T012 "Toast errors in spec/page.tsx"
Task: T013 "Toast errors in plan/page.tsx"
Task: T014 "Toast errors in tasks/page.tsx"
Task: T015 "Toast errors in traceability/page.tsx"
Task: T016 "Toast errors in evaluation-panel.tsx"

# Phase 5 (US3): Chat + collapsible in parallel (different files)
Task: T019 "Mobile chat panel in chat-panel.tsx"
Task: T020 "Collapsible sections in gated-phase-page.tsx"

# Phase 7 (US5): Nav + redirect in parallel (different files)
Task: T024 "Overview tab in phase-nav.tsx"
Task: T025 "Redirect to overview in page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T011)
3. Complete Phase 3: User Story 1 (T012-T016)
4. **STOP and VALIDATE**: Trigger errors → toasts appear; buttons have press feedback
5. Deploy/demo if ready — immediate UX improvement

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 (toast + buttons) → Test → Deploy (MVP!)
3. US2 (auto-expand + confirmation) → Test → Deploy
4. US3 (mobile chat + collapsible) → Test → Deploy
5. US4 (dark mode + onboarding) → Test → Deploy
6. US5 (overview dashboard) → Test → Deploy
7. Each story adds user value without breaking previous stories

### Recommended Commit Strategy

- **Commit 1**: Phase 1 + Phase 2 + Phase 3 (Setup + Foundation + US1) — immediate UX win
- **Commit 2**: Phase 4 (US2 — auto-expand + confirmation) — safety features
- **Commit 3**: Phase 5 (US3 — mobile chat + collapsible) — layout improvements
- **Commit 4**: Phase 6 (US4 — dark mode + onboarding) — theme and guidance
- **Commit 5**: Phase 7 (US5 — overview dashboard) — new page
- **Commit 6**: Phase 8 (Polish + verification)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- React 19 constraint: T017 and T020 MUST use "derived state from props" pattern — do NOT use useEffect with setState or useRef during render (see research.md §5-6)
- T023 (overview page): `useMemo` for traceability coverage MUST be placed before any early `return null` to satisfy rules-of-hooks
- T016 modifies `evaluation-panel.tsx` (toast errors), T017 also modifies it (auto-expand) — execute sequentially
- T022 modifies `spec/page.tsx` (onboarding), T012 also modifies it (toast errors) — execute T012 first
- Total: 29 tasks across 8 phases (1 setup + 1 foundational + 5 user stories + 1 polish)
