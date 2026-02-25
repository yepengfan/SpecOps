# UI Contracts: Claude Code-Style Loading Messages

**Branch**: `022-claude-code-loading-messages` | **Date**: 2026-02-25

## GenerationStatus Component (Updated)

### Interface

```typescript
type Phase = "spec" | "plan" | "tasks";

interface GenerationStatusProps {
  /** Retained for API compatibility — no longer affects message selection */
  phase: Phase;
  /** Whether AI generation is currently in progress */
  isActive: boolean;
}
```

### Rendering Rules

**When `isActive` is `false`**:
- Component returns `null` — nothing rendered in the DOM.

**When `isActive` is `true`**:
- Renders a container `<div>` with `role="status"` and `aria-live="polite"`.
- Inside the container:
  1. **Message area**: A `<div>` of fixed height (`h-8`) containing the current status message as a `<span>`.
     - With motion: wrapped in `<AnimatePresence mode="wait">` → `<motion.span>` with fade+slide animation, keyed on the message string, using `pageTransition` from `lib/motion.ts`.
     - With reduced motion: plain `<span>` with no animation wrapper.
  2. **Progress bar**: A `<div class="h-1">` container with a child `<div>` using Tailwind's `animate-pulse` and a gradient (`from-primary/40 via-primary to-primary/40`).

### Message Set (Shared Across All Phases)

A single set of 10 Claude Code-style thinking verbs with emoji prefixes:

1. "🧠 Thinking..."
2. "🔬 Analyzing..."
3. "💭 Cerebrating..."
4. "⚡ Calculating..."
5. "🔍 Examining..."
6. "✨ Reasoning..."
7. "📐 Synthesizing..."
8. "🎯 Deliberating..."
9. "🌀 Processing..."
10. "💡 Contemplating..."

### Behavior Spec

| Trigger | Behavior |
|---------|----------|
| `isActive` becomes `true` | Random index selected, interval starts (3000ms), message shown |
| 3 seconds pass while active | New random index selected (excluding current), message transitions |
| `isActive` becomes `false` | Interval cleared, component returns `null` |
| `isActive` false → true again | New random index selected (fresh start) |
| `prefers-reduced-motion` active | Messages rotate but swap instantly (no Framer Motion animation) |
| Component unmounts | Interval cleaned up via `useEffect` cleanup function |

### Changes from 021

| Aspect | Before (021) | After (022) |
|--------|-------------|-------------|
| Message structure | `Record<Phase, string[]>` (3 sets of 5) | `string[]` (1 set of 10) |
| Message selection | Sequential: `(prev + 1) % length` | Random: `randomIndex(prev)` with repeat avoidance |
| Initial message | Always index 0 | Random index |
| Phase influence | `phase` prop selects message set | `phase` prop accepted but unused |
| Page file changes | N/A | None required |

### Accessibility

Unchanged from 021:
- `role="status"` on the container div
- `aria-live="polite"` on the container div
- Messages are text content with emoji — readable by screen readers
- Progress bar is decorative — no ARIA label needed
- Fixed height container (`h-8`) prevents layout shift

### Integration Points

No changes to integration. Pages continue to render:

```
<GenerationStatus phase="spec|plan|tasks" isActive={isGenerating} />
```

The `phase` prop is accepted but does not affect behavior.
