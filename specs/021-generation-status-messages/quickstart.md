# Quickstart: Animated Status Messages During Generation

**Branch**: `021-generation-status-messages` | **Date**: 2026-02-24

## Prerequisites

- Node.js 20+
- npm 10+
- Existing SpecOps development environment set up

## Setup

```bash
git checkout 021-generation-status-messages
npm install
```

No new dependencies required. This feature uses Framer Motion which is already installed.

## Tech Stack (additions for this feature)

No new additions — all dependencies are already in the project.

## Key Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `components/ui/generation-status.tsx` | Create | Rotating status message component with Framer Motion animations |
| `app/project/[id]/spec/page.tsx` | Modify | Add `<GenerationStatus phase="spec">` between button and content |
| `app/project/[id]/plan/page.tsx` | Modify | Add `<GenerationStatus phase="plan">` between button and content |
| `app/project/[id]/tasks/page.tsx` | Modify | Add `<GenerationStatus phase="tasks">` between button and content |
| `__tests__/unit/generation-status.test.tsx` | Create | Unit tests for the GenerationStatus component |

## Development Workflow

### TDD Approach

1. Write failing tests first (`__tests__/unit/generation-status.test.tsx`)
2. Implement component (`components/ui/generation-status.tsx`)
3. Verify tests pass
4. Integrate into pages
5. Run full suite

### Atomic Commits

1. Commit: Add generation-status unit tests (red)
2. Commit: Implement GenerationStatus component (green)
3. Commit: Integrate GenerationStatus into phase pages

## Verification

```bash
npm run lint        # No lint errors
npm test            # All tests pass (including new generation-status tests)
```

### Manual Checks

1. Navigate to any project's spec page → type a description → click Generate → rotating messages with emoji appear below the button
2. Wait 3+ seconds → message transitions with a smooth fade+slide animation
3. Generation completes → status area disappears
4. Repeat on plan and tasks pages → phase-specific messages shown
5. Enable `prefers-reduced-motion` in DevTools → Rendering tab → messages still rotate but swap instantly (no animation)
6. Inspect the status area in DevTools → `role="status"` and `aria-live="polite"` attributes present
