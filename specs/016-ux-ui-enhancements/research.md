# Research: UX/UI Enhancements

**Branch**: `016-ux-ui-enhancements` | **Date**: 2026-02-23

## Research Tasks

No NEEDS CLARIFICATION items were identified in the technical context. All technology choices are well-established within the existing project ecosystem. This document records the technology decisions and rationale.

---

### 1. Toast Notification Library

**Decision**: sonner

**Rationale**: sonner is the default toast library recommended by shadcn/ui, which is the component system already in use. It provides a minimal API (`toast.error()`, `toast.success()`), auto-dismiss behavior, action buttons within toasts (needed for FR-020 Retry), and built-in theme support via a `theme` prop.

**Alternatives considered**:
- **react-hot-toast**: Popular but lacks built-in action button support and shadcn/ui integration.
- **@radix-ui/react-toast**: Lower-level primitive requiring more boilerplate for the same result.
- **Custom implementation**: Violates YAGNI — a well-tested library solves this completely.

---

### 2. Theme Management Library

**Decision**: next-themes

**Rationale**: next-themes is the de facto standard for Next.js dark mode. It handles SSR hydration mismatch prevention (via `suppressHydrationWarning`), system preference detection, localStorage persistence, and the `class` attribute strategy needed for Tailwind CSS's `dark:` variant. It's the library recommended by both Next.js and shadcn/ui documentation.

**Alternatives considered**:
- **Manual implementation with `matchMedia`**: Would require custom SSR flash prevention, localStorage sync, and hydration handling — all solved by next-themes.
- **next-theme (singular)**: Less maintained, smaller community.
- **CSS `prefers-color-scheme` only**: No user toggle capability; can't override system preference.

---

### 3. Collapsible Section Primitive

**Decision**: @radix-ui/react-collapsible (already available via existing radix-ui dependency)

**Rationale**: Radix UI Collapsible is already included in the project's dependency tree (via shadcn/ui's radix-ui dependency). It provides accessible, keyboard-navigable collapsible regions with proper ARIA attributes. Creating a thin re-export (`components/ui/collapsible.tsx`) follows the established shadcn/ui pattern.

**Alternatives considered**:
- **HTML `<details>/<summary>`**: Limited styling control, inconsistent animation support across browsers.
- **Custom useState toggle**: Would work but lacks accessibility attributes (aria-expanded, keyboard support) that Radix provides for free.

---

### 4. Regeneration Confirmation Dialog

**Decision**: @radix-ui/react-alert-dialog (via shadcn/ui AlertDialog component)

**Rationale**: AlertDialog is the correct semantic choice for a destructive confirmation (content overwrite). It traps focus, requires explicit user action, and prevents background interaction — matching the UX expectation for a data-loss prevention dialog. shadcn/ui provides a pre-styled AlertDialog component.

**Alternatives considered**:
- **window.confirm()**: Blocks the main thread, cannot be styled, poor UX.
- **Regular Dialog**: AlertDialog is semantically more appropriate for destructive confirmations.

---

### 5. Evaluation Panel Auto-Expand Pattern

**Decision**: React "derived state from props" pattern (track previous value in state)

**Rationale**: React 19's strict lint rules prohibit both `setState` inside `useEffect` for derived state (`react-hooks/set-state-in-effect` rule) and ref access during render (`react-hooks/refs` rule). The "derived state from props" pattern — tracking `prevEvaluation` in state and comparing during render — satisfies all lint rules while achieving the auto-expand behavior.

**Alternatives considered**:
- **useEffect with setState**: Prohibited by `react-hooks/set-state-in-effect` lint rule in React 19.
- **useRef to track previous value**: Prohibited by `react-hooks/refs` rule (no ref access during render).
- **Key-based remounting**: Would lose all local state, not just the open/closed state.

---

### 6. Collapsible State Reset on Generation

**Decision**: `generationKey` counter with "derived state from props" pattern

**Rationale**: When AI generation completes, all sections should reset to expanded. A counter (`generationKey`) increments after successful generation. The gated phase page compares the current key to its stored previous key; on change, it resets `openSections` to `null` (meaning "all open"). Same derived-state pattern as the evaluation panel, satisfying React 19 lint rules.

**Alternatives considered**:
- **useEffect watching generationKey**: Prohibited by React 19 lint rules.
- **Callback from parent to child**: Would require prop-drilling a reset function, adding coupling.
