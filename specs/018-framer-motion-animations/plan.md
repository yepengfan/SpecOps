# Implementation Plan: Framer Motion Animations

**Branch**: `018-framer-motion-animations` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-framer-motion-animations/spec.md`

## Summary

Add Framer Motion animations to three key interaction areas in SpecOps: tab content transitions (fade+slide when switching project tabs), animated collapsible sections (smooth height expand/collapse), and staggered project card entry on the home page. All animations respect `prefers-reduced-motion` and are centralized in a shared variants file. No data model changes, no new API routes, no schema migrations — this is a purely visual enhancement layer.

## Technical Context

**Language/Version**: TypeScript 5.x + React 19 + Next.js 16 (App Router)
**Primary Dependencies**: Framer Motion (new), shadcn/ui (existing), Radix UI Collapsible (existing), Zustand 5 (existing)
**Storage**: N/A — no storage changes
**Testing**: Jest + React Testing Library (existing), Playwright E2E (existing)
**Target Platform**: Web — last 2 versions of Chrome, Firefox, Safari, Edge
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Tab transitions ≤300ms, collapsible animations ≤300ms, full card stagger ≤1s for up to 12 cards
**Constraints**: Must respect `prefers-reduced-motion`, zero accessibility regression, all existing tests must pass
**Scale/Scope**: 3 animated areas, ~5 files changed/created

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Minimal Server, Secure API Proxy | PASS | No server changes. All animations are client-side only. |
| II. Phase Gate Discipline | PASS | No phase gate logic is modified. Animations are visual enhancements on existing UI. |
| III. Spec as Source of Truth | PASS | No spec content handling changes. Only visual presentation layer is affected. |
| IV. EARS Format for Requirements | PASS | Feature does not modify requirements format or handling. |
| V. AI-Agent-Optimized Output | PASS | Export and output formats are unchanged. |
| VI. Simplicity and YAGNI | PASS | Adding only the three animation areas specified. Shared variants file prevents duplication. No extra features or abstractions beyond what is needed. |

### Post-Design Check

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Minimal Server, Secure API Proxy | PASS | Zero server-side changes. |
| II. Phase Gate Discipline | PASS | Phase navigation unchanged — only the visual transition between tabs is animated. |
| III. Spec as Source of Truth | PASS | No changes to spec content handling. |
| IV. EARS Format for Requirements | PASS | Unaffected. |
| V. AI-Agent-Optimized Output | PASS | Unaffected. |
| VI. Simplicity and YAGNI | PASS | One shared variants file, one template wrapper, two component modifications. No abstractions beyond what's needed. |

## Project Structure

### Documentation (this feature)

```text
specs/018-framer-motion-animations/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Technology decisions
├── data-model.md        # Phase 1: No schema changes (documenting non-change)
├── quickstart.md        # Phase 1: Setup and file overview
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
lib/
└── motion.ts                           # NEW — shared animation variants

app/
└── project/
    └── [id]/
        └── template.tsx                # NEW — tab content transition wrapper

components/
├── ui/
│   ├── collapsible.tsx                 # MODIFY — add AnimatedCollapsibleContent
│   └── project-list.tsx                # MODIFY — staggered card entry
└── phase/
    └── gated-phase-page.tsx            # MODIFY — use AnimatedCollapsibleContent
```

**Structure Decision**: This feature adds to the existing Next.js App Router structure. New files follow established conventions — `lib/` for shared utilities, `app/project/[id]/template.tsx` for Next.js route template, components stay in their existing directories.

## Complexity Tracking

No constitution violations to justify. This feature is a straightforward visual enhancement layer with no architectural changes.
