# UI Contracts: Animated Status Messages During Generation

**Branch**: `021-generation-status-messages` | **Date**: 2026-02-24

## GenerationStatus Component

### Interface

```typescript
type Phase = "spec" | "plan" | "tasks";

interface GenerationStatusProps {
  /** Which phase's message set to display */
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
     - With motion: wrapped in `<AnimatePresence mode="wait">` → `<motion.span>` with fade+slide animation (opacity 0→1, y 4→0 enter; opacity 1→0, y 0→-4 exit), keyed on the message string, using `pageTransition` from `lib/motion.ts`.
     - With reduced motion: plain `<span>` with no animation wrapper.
  2. **Progress bar**: A `<div class="h-1">` container with a child `<div>` using Tailwind's `animate-pulse` and a gradient (`from-primary/40 via-primary to-primary/40`).

### Message Sets

Each phase has exactly 5 messages, each prefixed with an emoji:

**spec**:
1. "🧠 Thinking deeply..."
2. "📋 Crafting requirements..."
3. "🔍 Analyzing constraints..."
4. "✍️ Writing specifications..."
5. "⚡ Almost there..."

**plan**:
1. "🏗️ Architecting the plan..."
2. "🔧 Designing components..."
3. "📐 Mapping data models..."
4. "🛡️ Checking edge cases..."
5. "⚡ Wrapping up..."

**tasks**:
1. "📝 Breaking down tasks..."
2. "🔗 Mapping dependencies..."
3. "📂 Assigning files..."
4. "🧪 Planning tests..."
5. "⚡ Finalizing..."

### Behavior Spec

| Trigger | Behavior |
|---------|----------|
| `isActive` becomes `true` | Index resets to 0, interval starts (3000ms), first message shown |
| 3 seconds pass while active | Index increments by 1, next message shown with animation |
| All 5 messages shown | Index wraps to 0, cycle continues |
| `isActive` becomes `false` | Interval cleared, component returns `null` |
| `isActive` false → true again | Index resets to 0 (starts from first message) |
| `prefers-reduced-motion` active | Messages rotate but swap instantly (no Framer Motion animation) |
| Component unmounts | Interval cleaned up via `useEffect` cleanup function |

### Accessibility

- `role="status"` on the container div — identifies it as a status indicator
- `aria-live="polite"` on the container div — screen readers announce message changes without interrupting current speech
- Messages are text content with emoji — readable by screen readers
- Progress bar is decorative — no ARIA label needed
- Fixed height container (`h-8`) prevents layout shift when messages change

### Integration Points

The component is placed in each phase page between the Generate button and the next content block:

```
<Button>Generate</Button>
<GenerationStatus phase="spec|plan|tasks" isActive={isGenerating} />
{/* conditional content or GatedPhasePage */}
```
