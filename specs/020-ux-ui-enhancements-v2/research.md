# Research: UX/UI Enhancements v2

**Branch**: `020-ux-ui-enhancements-v2` | **Date**: 2026-02-24

## R-001: Toast Notification Strategy

**Decision**: Use existing Sonner library (already installed and configured) for all toast notifications.

**Rationale**: Sonner is already integrated in the root layout (`app/layout.tsx` line 54) with theme support via `next-themes`. The `toast` import from `sonner` is already used in 5 files for error notifications. Extending to success/warning toasts requires no new dependencies.

**Alternatives considered**:
- react-hot-toast: Would require replacing existing Sonner setup. No benefit.
- Custom toast component: Unnecessary complexity given Sonner already handles stacking, dismissal, theming, and accessibility.

**Implementation notes**:
- `toast.success(message)` for success events (auto-dismiss 4s — Sonner default)
- `toast.error(message)` for errors (persists until dismissed — Sonner default for errors)
- `toast.warning(message)` for warnings (auto-dismiss 4s)
- 7 inline amber banners to replace across 5 files (spec, plan, tasks pages + traceability matrix + chat panel)
- Prerequisite warning banners (plan: "spec must be reviewed", tasks: "plan must be reviewed") should remain as inline UI since they are persistent instructional state, not transient feedback. Only malformed-response warnings convert to toasts.

## R-002: Search & Sort Implementation

**Decision**: Client-side filtering using React state + `useMemo` on the already-loaded Dexie live query results.

**Rationale**: All projects are loaded into memory via `useLiveQuery` in `project-list.tsx`. The dataset is small (<50 projects expected). Client-side filtering with `String.includes()` and `Array.sort()` provides instant feedback with zero latency.

**Alternatives considered**:
- Dexie.js query-level filtering: Would require restructuring the `useLiveQuery` hook. Adds complexity for no performance benefit at this scale.
- Server-side search: Constitution mandates no server-side database. Out of scope.

**Implementation notes**:
- Search state: `useState<string>("")` in `ProjectList`
- Sort state: `useState<SortOption>("updatedAt-desc")` in `ProjectList`
- Filter in `useMemo`: `projects.filter(p => p.name.toLowerCase().includes(query))`
- Sort options: "Last updated" (default), "Name (A-Z)", "Name (Z-A)", "Newest first", "Oldest first"
- Debounce not needed — instant filtering on small dataset

## R-003: Project Description Truncation

**Decision**: CSS-based line clamping using `line-clamp-3` (Tailwind utility) for 3-line truncation with ellipsis.

**Rationale**: The `line-clamp` utility is built into Tailwind CSS and handles multi-line text truncation natively via `-webkit-line-clamp`. Supported by all target browsers (last 2 versions).

**Alternatives considered**:
- JavaScript-based truncation (character count): Inconsistent with variable font widths and responsive layouts.
- Single-line truncation (`truncate`): Loses too much context on longer descriptions.

**Implementation notes**:
- Add `<p className="text-sm text-muted-foreground line-clamp-3">` to `project-card.tsx`
- Empty description: Show `<p className="text-sm text-muted-foreground italic">No description</p>`

## R-004: Breadcrumb Navigation Pattern

**Decision**: Create a new `Breadcrumb` component in `components/ui/breadcrumb.tsx` using semantic `<nav aria-label="Breadcrumb">` markup with Next.js `Link` for each segment.

**Rationale**: shadcn/ui provides a breadcrumb pattern but it's not currently installed in this project. A lightweight custom component is simpler (3 segments max: Projects > Project Name > Phase) and avoids adding another shadcn component dependency.

**Alternatives considered**:
- shadcn/ui Breadcrumb: Heavier, requires installation and more complex API for a simple 3-segment breadcrumb.
- Browser-native breadcrumb: No standard exists.

**Implementation notes**:
- Placement: Inside `app/project/[id]/layout.tsx`, between the header row (project name + actions) and `PhaseNav`
- Segments derived from: route path + project name from Zustand store
- Separator: `ChevronRight` icon from Lucide (consistent with existing icon usage)
- Truncation: `max-w-[200px] truncate` on project name segment
- Active segment (current page): Not a link, rendered as `<span>` with muted text

## R-005: AI Progress Indicator Design

**Decision**: Replace static "Generating..."/"Regenerating..." text with an animated skeleton loader (3 pulsing lines of varying width) that appears in the section editor content area during AI operations.

**Rationale**: Skeleton loaders are already used in the project list loading state (`project-list.tsx` lines 54-66) and align with the existing design language. They provide a content-shaped placeholder that signals "content is coming" more effectively than text.

**Alternatives considered**:
- Spinner/loading circle: Does not convey "content is being generated." Better for indeterminate waits.
- Progress bar with percentage: AI streaming duration is unpredictable; percentage would be inaccurate.
- Streaming text preview: Would require significant refactoring of the generation pipeline to stream partial content into the editor. Deferred for future enhancement.

**Implementation notes**:
- Reuse existing `Skeleton` component (`components/ui/skeleton.tsx`)
- Show 3-4 skeleton lines of varying width (100%, 85%, 70%) in the textarea area
- Wrap in `AnimatePresence` for smooth enter/exit transitions
- Replace text in `section-editor.tsx` lines 86-88 and evaluation panel status text
- Respect `prefers-reduced-motion`: Use static skeleton (no pulse animation) if reduced motion preferred

## R-006: Chat Panel Resize Approach

**Decision**: Native pointer events (`pointerdown`, `pointermove`, `pointerup`) on a thin drag handle element for resize interaction. Width persisted to `localStorage`.

**Rationale**: Pointer events are the modern standard for drag interactions, working across mouse and touch. No library needed for a single drag axis. localStorage is appropriate for a UI preference (not project data).

**Alternatives considered**:
- CSS `resize` property: Only supports bottom-right corner resize on textarea-like elements. Cannot be applied to a panel's left edge.
- react-resizable / react-rnd: Heavy dependencies for a single-axis resize. Constitution principle VI (YAGNI) discourages unnecessary libraries.
- Dexie/IndexedDB for persistence: Overkill for a single scalar preference. localStorage is simpler and appropriate.

**Implementation notes**:
- New component: `components/chat/chat-resize-handle.tsx`
- 4px wide handle on left edge of chat panel, `cursor: col-resize`
- Hover state: subtle background highlight
- During drag: set `pointer-events: none` on iframe/content to prevent text selection
- Min: 320px, Max: 640px, Default: 384px (current `w-96`)
- localStorage key: `specops-chat-panel-width`
- Mobile (`< md` breakpoint): Handle hidden, panel remains full-width

## R-007: Responsive Traceability Table

**Decision**: CSS `position: sticky` with `left: 0` on the first column (`<th>` and `<td>`) within the existing `overflow-x-auto` wrapper.

**Rationale**: The table already has `overflow-x-auto` on its container (`matrix-table.tsx` line 71). Adding `sticky` positioning to the first column is a CSS-only solution that works across all target browsers.

**Alternatives considered**:
- JavaScript-based scroll sync: Unnecessary complexity when CSS sticky handles this natively.
- Separate fixed column + scrollable table: Requires splitting the table DOM, complicating click handlers and row alignment.

**Implementation notes**:
- First `<th>` and all first `<td>` in each row: add `sticky left-0 z-10 bg-background`
- Add left border/shadow to visually separate sticky column from scrollable area
- Ensure the existing cell click handlers still work (they operate on data-attributes, not position)

## R-008: Project Archiving Data Model

**Decision**: Add optional `archivedAt?: number` timestamp field to the `Project` interface. A project is archived when `archivedAt` is set, and unarchived when it is cleared (`undefined`).

**Rationale**: A timestamp is more informative than a boolean — it records when the project was archived, which could be useful for sorting or display. Dexie.js handles optional fields well; existing projects will have `undefined` for this field (treated as "not archived").

**Alternatives considered**:
- Boolean `isArchived`: Less informative, no archive date.
- Separate `archivedProjects` table: Over-engineered for a soft-archive. Would require moving data between tables.
- Enum status field: Would conflict with the existing phase-based status concept.

**Implementation notes**:
- Dexie migration v5: Add `archivedAt` to index for efficient filtering
- New functions in `lib/db/projects.ts`: `archiveProject(id)`, `unarchiveProject(id)`
- `listProjects()` unchanged (returns all); filtering by archive status done in component layer
- No data migration needed — existing projects default to `undefined` (not archived)

## R-009: Export Feedback Integration

**Decision**: Add `toast.success()` calls after each successful export in `export-panel.tsx`. Error handling already exists via try/catch.

**Rationale**: Trivial extension of the toast system (R-001). Depends on toast infrastructure being in place.

**Alternatives considered**: None — this is straightforward.

**Implementation notes**:
- After ZIP export: `toast.success("All phases exported as ZIP")`
- After individual export: `toast.success("Spec exported successfully")` (etc.)
- Wrap export functions in try/catch; call `toast.error()` on failure
