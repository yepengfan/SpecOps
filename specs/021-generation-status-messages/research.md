# Research: Animated Status Messages During Generation

**Branch**: `021-generation-status-messages` | **Date**: 2026-02-24

## R1: Message Rotation Strategy

**Decision**: `setInterval` with React `useState` for index tracking

**Rationale**:
- Simple and well-understood pattern for periodic UI updates
- `setInterval` with 3000ms interval provides consistent rotation timing
- `useState` for the message index integrates naturally with React's rendering cycle
- Cleanup via `useEffect` return function prevents memory leaks on unmount

**Alternatives considered**:
- **`setTimeout` chain**: Slightly more complex to manage but equivalent behavior. `setInterval` is simpler for fixed-interval rotation.
- **`requestAnimationFrame` loop**: Over-engineered for a 3-second rotation. RAF is for smooth per-frame updates, not periodic content swaps.
- **CSS animation with `animation-delay`**: Cannot drive React state changes for accessible live region updates.

## R2: Message Transition Animation

**Decision**: Framer Motion `AnimatePresence mode="wait"` with `motion.span`, keyed on message string, using `pageTransition` (200ms easeOut) from `lib/motion.ts`

**Rationale**:
- Framer Motion is already installed and globally mocked in the test environment (`jest.setup.ts`)
- `AnimatePresence mode="wait"` ensures the outgoing message fully exits before the incoming message enters — consistent with the existing pattern in `app/project/[id]/template.tsx`
- Keying on the message string triggers AnimatePresence to detect the swap
- Reuses the existing `pageTransition` config for timing consistency across the app
- Fade+slide pattern (opacity + y-axis) matches `fadeSlideVariants` but with smaller offset (4px vs 8px) appropriate for inline text

**Alternatives considered**:
- **CSS transitions with `transition-group`**: React Transition Group is not installed and would add a new dependency. Framer Motion is already available.
- **Inline CSS `@keyframes`**: Cannot coordinate enter/exit transitions. Would result in overlapping messages during swap.
- **Using `fadeSlideVariants` directly**: The 8px offset in `fadeSlideVariants` is tuned for page-level transitions. A 4px offset is more appropriate for small inline text, so inline animation props are preferred.

## R3: Progress Bar Approach

**Decision**: CSS-only animated bar using Tailwind's `animate-pulse` with a gradient background

**Rationale**:
- No additional JS needed — pure CSS animation
- `animate-pulse` is a standard Tailwind utility, lightweight and broadly supported
- Gradient from `primary/40` via `primary` to `primary/40` creates a subtle shimmer that implies activity without misleading users about completion percentage
- Tailwind's `animate-pulse` respects `prefers-reduced-motion` automatically via its built-in media query

**Alternatives considered**:
- **Determinate progress bar with percentage**: Rejected — AI streaming has no predictable completion percentage. A determinate bar would be misleading.
- **Framer Motion animated bar**: Over-engineered for a simple pulsing effect. CSS handles this well.
- **Reusing skeleton shimmer pattern**: A thin bar better communicates "ongoing activity" vs "loading content structure".

## R4: Reduced Motion Handling

**Decision**: Framer Motion `useReducedMotion()` hook — conditionally render static `<span>` vs animated `<motion.span>`

**Rationale**:
- Consistent with existing pattern in `template.tsx`, `collapsible.tsx`, and `project-list.tsx`
- When reduced motion is active, renders a plain `<span>` — no `AnimatePresence` wrapper needed
- Messages still rotate every 3 seconds (content changes are informational, not "animation")
- Screen reader announcements via `role="status"` work identically in both modes

**Alternatives considered**:
- **Framer Motion `layout` prop with reduced motion**: Still introduces some animation. Explicit conditional rendering is cleaner and matches codebase convention.
- **CSS-only reduced motion override**: Wouldn't affect Framer Motion's JS-driven animations.

## R5: State Reset on Re-Activation

**Decision**: React "adjust state during render" pattern — track `wasActive` state to detect `false → true` transition

**Rationale**:
- ESLint rule `react-hooks/set-state-in-effect` prohibits calling `setState` synchronously in `useEffect` bodies
- The same pattern is already used in `components/phase/gated-phase-page.tsx` (resetting collapsible state when `generationKey` changes)
- Tracks `wasActive` state to detect the `false → true` transition and reset index to 0 during render
- This is a documented React 19 pattern for adjusting state based on prop changes

**Alternatives considered**:
- **`setState` inside `useEffect`**: Rejected — violates `react-hooks/set-state-in-effect` lint rule.
- **Not resetting (let index carry over)**: Rejected — FR-007 requires starting from the first message each time.
- **Using `key` prop on parent to force remount**: Works but is less explicit and harder to test independently.
