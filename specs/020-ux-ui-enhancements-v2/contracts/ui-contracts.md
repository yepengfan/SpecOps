# UI Contracts: UX/UI Enhancements v2

**Branch**: `020-ux-ui-enhancements-v2` | **Date**: 2026-02-24

## Component Contracts

### 1. Breadcrumb (`components/ui/breadcrumb.tsx`)

```typescript
interface BreadcrumbProps {
  projectId: string;
  projectName: string;
  currentPhase?: "overview" | "spec" | "plan" | "tasks" | "traceability";
}
```

**Rendering rules**:
- Always shows "Projects" as first segment (links to `/`)
- Always shows project name as second segment (links to `/project/{id}/overview`)
- Shows phase name as third segment only when `currentPhase` is not `"overview"`
- Third segment is a `<span>` (not a link) — represents current page
- Project name truncated at 200px with ellipsis via CSS `truncate` + `max-w-[200px]`
- Separator: `ChevronRight` icon (16px, `text-muted-foreground`)

**Accessibility**:
- Wrapped in `<nav aria-label="Breadcrumb">`
- Segments in `<ol>` list
- Current page segment has `aria-current="page"`

---

### 2. ProjectList Search & Sort Controls

**Added to existing `ProjectList` component** (`components/ui/project-list.tsx`).

```typescript
// Internal state additions
const [searchQuery, setSearchQuery] = useState("");
const [sortOption, setSortOption] = useState<SortOption>("updatedAt-desc");
const [showArchived, setShowArchived] = useState(false);

type SortOption =
  | "updatedAt-desc"   // "Last updated" (default)
  | "name-asc"         // "Name (A-Z)"
  | "name-desc"        // "Name (Z-A)"
  | "createdAt-desc"   // "Newest first"
  | "createdAt-asc";   // "Oldest first"
```

**UI layout** (inserted between heading and grid):
```
[Search input (flex-1)] [Sort dropdown] [Archive toggle]
```

- Search: `<Input>` with `Search` icon, placeholder "Search projects..."
- Sort: `<Select>` dropdown with 5 options
- Archive toggle: `<Button variant="ghost">` with `Archive` icon, toggles `showArchived`

**Filtering logic** (applied via `useMemo`):
1. Filter by archive status: `showArchived ? all : active only`
2. Filter by search query: `name.toLowerCase().includes(query.toLowerCase())`
3. Sort by selected option

---

### 3. ProjectCard Updates (`components/ui/project-card.tsx`)

**Added props**: None — reads from existing `project` prop.

**New elements**:
- Description text: `<p className="text-sm text-muted-foreground line-clamp-3">` below project name
- Archive button: `<Button variant="ghost" size="icon">` with `Archive`/`ArchiveRestore` icon
- Both Archive and Delete buttons visible in card actions area

**Archive action**: Calls `archiveProject(project.id)` / `unarchiveProject(project.id)` from `lib/db/projects.ts`

**Archived indicator**: When `project.archivedAt` is set, card has `opacity-75` and shows an "Archived" badge.

---

### 4. ChatResizeHandle (`components/chat/chat-resize-handle.tsx`)

```typescript
interface ChatResizeHandleProps {
  panelWidth: number;
  onWidthChange: (width: number) => void;
  onDragEnd: (width: number) => void;
}
```

**Rendering**:
- 4px wide vertical strip on the left edge of chat panel
- Visible only on `md:` breakpoint and above (hidden on mobile)
- Hover: `bg-border` background highlight
- During drag: `bg-primary` background

**Behavior**:
- `pointerdown` → capture pointer, record start X and start width
- `pointermove` → calculate new width = startWidth + (startX - currentX), clamp to [320, 640]
- `pointerup` → release pointer, call `onDragEnd` with final width
- During drag: body cursor set to `col-resize`, user-select disabled

**Persistence**: Parent (`ChatPanel`) reads initial width from `localStorage.getItem("specops-chat-panel-width")` and calls `localStorage.setItem()` in `onDragEnd`.

---

### 5. Progress Indicator in Section Editor

**No new component** — modifications to existing `SectionEditor` (`components/editor/section-editor.tsx`).

**Current** (lines 86-91):
```tsx
<span>{isRegenerating ? "Regenerating…" : ""}</span>
<span>{isSaving ? "Saving…" : ""}</span>
```

**New**: When `isRegenerating` is true, replace textarea content area with:
```tsx
<div className="space-y-3 p-4">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-[85%]" />
  <Skeleton className="h-4 w-[70%]" />
  <Skeleton className="h-4 w-[90%]" />
</div>
```

Status text ("Regenerating...") moves above the skeleton as a label.

---

### 6. Export Panel Toast Integration

**No new component** — modifications to existing `ExportPanel` (`components/phase/export-panel.tsx`).

**Contract**: After each successful export call, invoke:
- `toast.success("Spec exported successfully")`
- `toast.success("Plan exported successfully")`
- `toast.success("Tasks exported successfully")`
- `toast.success("All phases exported as ZIP")`

On error: `toast.error("Export failed: {error message}")`

---

### 7. Responsive Traceability Table

**No new component** — CSS modifications to existing `MatrixTable` (`components/traceability/matrix-table.tsx`).

**First column cells** (`<th>` header + all `<td>` in first column):
```
className="sticky left-0 z-10 bg-background"
```

**Visual separator**: Right border shadow on sticky column to indicate scrollable content beyond.

## Toast Message Catalog

| Event | Type | Message |
|-------|------|---------|
| AI generation success | `success` | "Content generated successfully" |
| AI generation malformed | `warning` | "AI response did not match expected format. Content placed in first section." |
| AI generation error | `error` | Error message from catch block |
| Phase approved | `success` | "{Phase} phase approved" |
| Export single phase | `success` | "{Phase} exported successfully" |
| Export ZIP | `success` | "All phases exported as ZIP" |
| Export error | `error` | "Export failed: {error}" |
| Project archived | `success` | "Project archived" |
| Project unarchived | `success` | "Project restored" |
| Project deleted | `success` | "Project deleted" |
| Traceability reanalyze error | `error` | Error message from catch block |
| Deep analysis error | `error` | Error message from catch block (with Retry action) |

## Inline Banners — Disposition

| Location | Current Behavior | New Behavior |
|----------|-----------------|--------------|
| Spec page: malformed warning (lines 161-170) | Persistent amber banner | `toast.warning()` — transient |
| Plan page: spec not reviewed (lines 159-166) | Persistent amber banner | **Keep as inline** — instructional state, not transient feedback |
| Plan page: malformed warning (lines 168-177) | Persistent amber banner | `toast.warning()` — transient |
| Tasks page: plan not reviewed (lines 165-172) | Persistent amber banner | **Keep as inline** — instructional state, not transient feedback |
| Tasks page: malformed warning (lines 174-183) | Persistent amber banner | `toast.warning()` — transient |
| Traceability: no requirements (lines 52-56) | Persistent amber banner | **Keep as inline** — instructional state, empty state guide |
| Chat panel: error (lines 135-139) | Border-top error text | `toast.error()` — transient |
