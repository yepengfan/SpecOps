# Implementation Plan: UX/UI Enhancements v2

**Branch**: `020-ux-ui-enhancements-v2` | **Date**: 2026-02-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-ux-ui-enhancements-v2/spec.md`

## Summary

Deliver 9 UX/UI improvements to the SpecOps application: toast notifications (replacing inline banners), project search/sort, project description on cards, breadcrumb navigation, AI progress indicators, export success feedback, chat panel resize, responsive traceability table, and project archiving. All changes are client-side only, touching existing React components, Zustand stores, Dexie.js database schema, and Tailwind CSS styling. No new server-side logic or external dependencies required beyond what is already installed (Sonner, Framer Motion, Dexie.js).

## Technical Context

**Language/Version**: TypeScript 5.x + React 19 + Next.js 16 (App Router)
**Primary Dependencies**: shadcn/ui, Radix UI, Framer Motion, Zustand 5, Sonner (toast), Dexie.js 4, dexie-react-hooks, Tailwind CSS 4, Lucide React (icons)
**Storage**: IndexedDB via Dexie.js (client-side only) — schema migration from v4 to v5 for `archivedAt` field; localStorage for chat panel width preference
**Testing**: Jest (unit/integration), Playwright (E2E)
**Target Platform**: Web — last 2 versions of Chrome, Firefox, Safari, Edge
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Project list <1s, navigation <500ms, toast feedback <500ms after action completion
**Constraints**: Client-side only storage (no server DB), WCAG 2.1 AA accessibility, prefers-reduced-motion respected
**Scale/Scope**: Single-user local app, ~50 projects max expected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Minimal Server, Secure API Proxy | PASS | No server changes. All features are client-side UI enhancements. |
| II. Phase Gate Discipline | PASS | No changes to phase gate logic. Breadcrumbs and toasts are navigation/feedback only. |
| III. Spec as Source of Truth | PASS | No changes to spec content handling. Archive is project-level metadata, not spec content. |
| IV. EARS Format for Requirements | PASS | No changes to requirements format or parsing. |
| V. AI-Agent-Optimized Output | PASS | No changes to export format or section templates. |
| VI. Simplicity and YAGNI | PASS | Each enhancement is minimal and directly requested. No speculative features. Chat panel resize uses native pointer events (no drag library). Archiving uses a single timestamp field, not a separate status enum. |
| TDD Workflow | ACKNOWLEDGED | All implementation must follow TDD per constitution. Tasks will be structured as test-first. |
| Atomic Commits | ACKNOWLEDGED | Each task will produce atomic commits: one for tests, one for implementation, one for refactor. |
| Branch-Per-Requirement | PASS | All work on `020-ux-ui-enhancements-v2` branch. |

**Result: All gates PASS. No violations.**

## Project Structure

### Documentation (this feature)

```text
specs/020-ux-ui-enhancements-v2/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── ui-contracts.md  # Component interface contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── page.tsx                          # Home — project list (search/sort/archive toggle)
└── project/[id]/
    ├── layout.tsx                    # Breadcrumb insertion point
    ├── spec/page.tsx                 # Toast migration, progress indicator
    ├── plan/page.tsx                 # Toast migration, progress indicator
    ├── tasks/page.tsx                # Toast migration, progress indicator
    └── traceability/page.tsx         # Toast migration

components/
├── ui/
│   ├── project-list.tsx              # Search bar, sort dropdown, archive toggle
│   ├── project-card.tsx              # Description display, archive/unarchive action
│   ├── breadcrumb.tsx                # NEW — breadcrumb navigation component
│   └── sonner.tsx                    # Existing Sonner wrapper (no changes)
├── chat/
│   ├── chat-panel.tsx                # Resize handle, dynamic width
│   └── chat-resize-handle.tsx        # NEW — drag handle component
├── editor/
│   └── section-editor.tsx            # Progress indicator replacement
├── phase/
│   └── export-panel.tsx              # Toast on export success
├── eval/
│   └── evaluation-panel.tsx          # Progress indicator for deep analysis
└── traceability/
    └── matrix-table.tsx              # Sticky first column, horizontal scroll

lib/
├── db/
│   ├── database.ts                   # Dexie v5 migration (archivedAt field, no index change)
│   └── projects.ts                   # archiveProject(), unarchiveProject(), listActiveProjects()
└── types/
    └── index.ts                      # Project interface + archivedAt field
```

**Structure Decision**: Follows existing Next.js App Router layout. No new directories needed — new components added alongside existing ones. The only new files are `breadcrumb.tsx` and `chat-resize-handle.tsx`.

## Complexity Tracking

No constitution violations to justify. All enhancements are straightforward UI changes within the existing architecture.
