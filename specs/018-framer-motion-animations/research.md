# Research: Framer Motion Animations

**Branch**: `018-framer-motion-animations` | **Date**: 2026-02-23

## R1: Animation Library

**Decision**: Framer Motion

**Rationale**:
- De facto standard for React animations with 20M+ weekly npm downloads
- First-class support for `AnimatePresence` (exit animations) and layout animations
- Built-in `useReducedMotion()` hook for accessibility compliance
- `height: "auto"` animation support — critical for collapsible section expand/collapse
- Works seamlessly with Next.js App Router and React 19

**Alternatives considered**:
- **CSS transitions only**: Rejected — cannot animate `height: auto`, would require measuring DOM elements manually. No exit animation support.
- **React Spring**: Strong contender but lacks `AnimatePresence` equivalent for route transitions. API is less ergonomic for declarative variants.
- **Motion One (vanilla)**: Lower-level API, no React integration for AnimatePresence. Would require significant manual wiring for component lifecycle animations.

## R2: Tab Transition Strategy

**Decision**: Next.js `template.tsx` with `AnimatePresence mode="wait"`

**Rationale**:
- `template.tsx` re-mounts on every route change within the segment, making it ideal for transition detection
- `layout.tsx` stays mounted (header, PhaseNav, ChatPanel persist) — only tab content transitions
- `usePathname()` provides the key for AnimatePresence to detect route changes
- `mode="wait"` ensures outgoing content fully exits before incoming content enters, preventing layout overlap

**Alternatives considered**:
- **Wrapping children in layout.tsx**: Rejected — `layout.tsx` does not re-mount on route changes, so AnimatePresence cannot detect transitions.
- **Page-level animations in each tab page**: Rejected — duplicates animation logic across 5 page files. Centralized template.tsx is DRY.
- **View Transitions API**: Rejected — limited browser support (no Firefox/Safari as of Feb 2026), experimental in Next.js.

## R3: Collapsible Animation Approach

**Decision**: Custom `AnimatedCollapsibleContent` component using Framer Motion alongside existing Radix Collapsible

**Rationale**:
- Radix `CollapsibleContent` handles ARIA attributes and state management
- Framer Motion's `motion.div` with `height: 0 ↔ "auto"` provides smooth height animation that CSS cannot achieve
- Separating animation from state management keeps the Radix accessibility guarantees intact
- `overflow: hidden` during animation prevents content leaking; switches to `visible` after expand completes

**Alternatives considered**:
- **CSS `max-height` hack**: Rejected — requires guessing max height, overshooting causes delayed visual transitions, undershooting clips content.
- **Replacing Radix Collapsible entirely**: Rejected — would lose built-in ARIA attributes and keyboard handling. Unnecessary re-implementation.
- **Radix + CSS `grid-template-rows: 0fr → 1fr`**: Promising CSS-only approach but less reliable cross-browser for dynamic content heights and no exit animation control.

## R4: Stagger Animation Pattern

**Decision**: Framer Motion `staggerChildren` on container variant with individual item `fadeSlide` variants

**Rationale**:
- `staggerChildren: 0.06` (60ms) with `duration: 0.25` (250ms) per item keeps total reveal under 1s for 12 cards
- Container variant with `staggerChildren` automatically sequences child animations
- Each child uses `opacity: 0→1` and `y: 12→0` for a subtle rise effect
- `initial={false}` on the container skips animations when reduced motion is preferred

**Alternatives considered**:
- **CSS `animation-delay` per card**: Rejected — requires calculating delays per element, no orchestration for dynamic lists, no reduced motion hook.
- **Intersection Observer + CSS**: Rejected — over-engineered for a page-load stagger. Cards are above the fold on most screens.

## R5: Reduced Motion Handling

**Decision**: Framer Motion `useReducedMotion()` hook — conditionally skip all animations

**Rationale**:
- Framer Motion provides `useReducedMotion()` which reads `prefers-reduced-motion` media query
- When active: tab transitions render children directly without AnimatePresence, collapsibles use instant show/hide, cards appear without stagger
- Single hook call per animated component — no global configuration needed
- Consistent with WCAG 2.1 AA requirements

**Alternatives considered**:
- **Global CSS `@media (prefers-reduced-motion: reduce)`**: Only works for CSS animations, not Framer Motion's JS-driven animations.
- **Custom React context for motion preference**: Unnecessary abstraction — Framer Motion's hook already handles this.

## R6: Test Environment Compatibility

**Decision**: Jest mock for `framer-motion` module to avoid jsdom animation issues

**Rationale**:
- jsdom does not implement `requestAnimationFrame` or Web Animations API reliably
- Mocking `motion.div` as a plain `div`, `AnimatePresence` as a passthrough, and `useReducedMotion` as returning `false` keeps tests focused on logic rather than animation
- Mock is placed in jest setup so all test files automatically get the mock
- Existing tests remain unchanged — they test behavior, not animations

**Alternatives considered**:
- **Per-test-file mocks**: Rejected — fragile and duplicative. Central mock in jest setup is more maintainable.
- **Running tests with animation polyfills**: Rejected — adds complexity and test flakiness for no behavioral coverage gain.
