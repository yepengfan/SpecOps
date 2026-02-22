# Implementation Plan: Rename Project

**Branch**: `012-rename-project` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-rename-project/spec.md`

## Summary

Add inline editing of the project name in the project layout header. Clicking the name switches to an input field; Enter/blur saves immediately via a new `renameProject` store action that calls `updateProject`; Escape cancels. Empty/whitespace names are rejected. The project list reflects the change via Dexie live queries (already reactive).

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React 19, Next.js 16, Zustand 5, Dexie.js 4, shadcn/ui, Tailwind CSS 4
**Storage**: IndexedDB via Dexie.js (client-side only)
**Testing**: Jest 30 + Testing Library (unit/component), fake-indexeddb for integration
**Target Platform**: Web (modern browsers — last 2 versions of Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Rename save <500ms per constitution; UI transition instant
**Constraints**: No server-side state; all data in IndexedDB; WCAG 2.1 AA accessibility
**Scale/Scope**: Single user, local projects — no concurrency concerns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Minimal Server, Secure API Proxy | PASS | No server changes needed. Rename is pure client-side (store + IndexedDB). |
| II. Phase Gate Discipline | PASS | Renaming does not affect phase status or gate logic. |
| III. Spec as Source of Truth | PASS | Project name is metadata, not spec content. Rename does not modify phases. |
| IV. EARS Format for Requirements | N/A | No requirements content affected. |
| V. AI-Agent-Optimized Output | N/A | No export format changes. |
| VI. Simplicity and YAGNI | PASS | Single store action + one component change. No new abstractions. |

**Gate Result**: ALL PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/012-rename-project/
├── plan.md              # This file
├── research.md          # Phase 0 output (minimal — no unknowns)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
└── project/
    └── [id]/
        └── layout.tsx           # MODIFY — replace <h1> with <EditableProjectName>

components/
└── ui/
    └── editable-project-name.tsx  # NEW — inline edit component

lib/
├── stores/
│   └── project-store.ts         # MODIFY — add renameProject action
└── db/
    └── projects.ts              # NO CHANGE — updateProject already handles name updates

__tests__/
├── unit/
│   └── editable-project-name.test.tsx  # NEW — component tests
└── integration/
    └── project-crud.test.ts     # MODIFY — add rename persistence test
```

**Structure Decision**: Existing Next.js App Router structure. One new component in `components/ui/`, one store modification, one layout modification. No new directories needed.

## Architecture

### Approach: Inline Editable Heading

The `<h1>` in `app/project/[id]/layout.tsx` is replaced with an `<EditableProjectName>` component that toggles between display mode (styled like the current `<h1>`) and edit mode (an `<input>` field).

**Data flow**:
1. User clicks name → component enters edit mode (local state)
2. User types + Enter/blur → component calls `renameProject(newName)` on the Zustand store
3. Store validates (non-empty, trimmed, changed) → updates `currentProject.name` → calls `immediateSave(updatedProject)`
4. `immediateSave` calls `updateProject(project)` which writes to IndexedDB with updated `updatedAt`
5. Project list uses `useLiveQuery` on Dexie — picks up the new name automatically on next visit

**No new API endpoints, no schema migrations, no new dependencies.**

### Key Design Decisions

1. **Immediate save (not debounced)**: Rename is a discrete action (Enter/blur), not continuous typing. Use `immediateSave` like `approvePhase` does.
2. **Component-level state for edit mode**: The `isEditing` toggle is local to `<EditableProjectName>`, not in the Zustand store, because it's transient UI state.
3. **Select all on focus**: When entering edit mode, `input.select()` so the user can immediately type a replacement without manually selecting.
4. **No separate "edit" button**: Clicking the name itself enters edit mode, keeping the UI minimal per constitution principle VI.

## Complexity Tracking

No constitution violations — this section is intentionally empty.
