# Quickstart: Framer Motion Animations

**Branch**: `018-framer-motion-animations` | **Date**: 2026-02-23

## Prerequisites

- Node.js 20+
- npm 10+
- Existing SpecOps development environment set up

## Setup

```bash
git checkout 018-framer-motion-animations
npm install
```

This installs `framer-motion` as a new dependency. No environment variables or configuration changes needed.

## Tech Stack (additions for this feature)

| Tool | Purpose |
|------|---------|
| Framer Motion | Declarative React animation library — page transitions, height animations, staggered lists |

## Files Changed/Created

| File | Action | Purpose |
|------|--------|---------|
| `lib/motion.ts` | Create | Shared animation variants and transition config |
| `app/project/[id]/template.tsx` | Create | Tab content transition wrapper using AnimatePresence |
| `components/ui/collapsible.tsx` | Modify | Add `AnimatedCollapsibleContent` export |
| `components/phase/gated-phase-page.tsx` | Modify | Replace `CollapsibleContent` with `AnimatedCollapsibleContent` |
| `components/ui/project-list.tsx` | Modify | Wrap project cards in stagger animation container |
| `jest.setup.ts` | Modify | Add framer-motion mock for test environment |

## Verification

```bash
npm run build       # No build errors
npm test            # All tests pass
npm run lint        # No lint errors
```

### Manual Checks

1. Switch between project tabs — content should fade in/out with subtle slide
2. Expand/collapse spec sections — smooth height animation
3. Load home page with projects — cards stagger in sequentially
4. Enable `prefers-reduced-motion` in DevTools → Rendering tab — all animations disabled
5. Keyboard navigate tabs and collapsibles — same behavior as before
