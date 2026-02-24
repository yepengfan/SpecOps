# Implementation Plan: Animated Status Messages During Generation

**Branch**: `021-generation-status-messages` | **Date**: 2026-02-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-generation-status-messages/spec.md`

## Summary

Add a `<GenerationStatus>` component that displays rotating phase-specific animated status messages with emoji during AI generation on spec, plan, and tasks pages. Messages cycle every 3 seconds with Framer Motion fade+slide transitions, reusing the existing `pageTransition` timing from `lib/motion.ts`. A CSS-only progress bar provides continuous visual feedback. The component respects `prefers-reduced-motion` via `useReducedMotion()` and uses ARIA live regions for screen reader support. No data model changes, no new API routes, no schema migrations — this is a purely visual feedback enhancement.

## Technical Context

**Language/Version**: TypeScript 5.x + React 19 + Next.js 16 (App Router)
**Primary Dependencies**: Framer Motion (existing), shadcn/ui (existing), Tailwind CSS 4 (existing)
**Storage**: N/A — no storage changes
**Testing**: Jest + React Testing Library (existing); Framer Motion mocked globally in `jest.setup.ts`
**Target Platform**: Web — last 2 versions of Chrome, Firefox, Safari, Edge
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Message transitions ≤200ms (matching `pageTransition`), zero layout shift
**Constraints**: Must respect `prefers-reduced-motion`, zero accessibility regression, all existing tests must pass, must comply with `react-hooks/set-state-in-effect` ESLint rule
**Scale/Scope**: 1 new component, 3 existing pages modified, 1 new test file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Minimal Server, Secure API Proxy | PASS | No server changes. Component is entirely client-side. No API key or data privacy concerns. |
| II. Phase Gate Discipline | PASS | No phase gate logic is modified. Status messages are visual-only feedback during existing generation flow. |
| III. Spec as Source of Truth | PASS | No spec content handling changes. Only visual presentation layer is affected. |
| IV. EARS Format for Requirements | PASS | Feature does not modify requirements format or handling. |
| V. AI-Agent-Optimized Output | PASS | Export and output formats are unchanged. |
| VI. Simplicity and YAGNI | PASS | Single self-contained component. Reuses existing Framer Motion and `lib/motion.ts` patterns. No new dependencies, no abstractions, no feature creep. |

### Post-Design Check

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Minimal Server, Secure API Proxy | PASS | Zero server-side changes. |
| II. Phase Gate Discipline | PASS | Phase generation unchanged — only visual feedback added during streaming. |
| III. Spec as Source of Truth | PASS | No changes to spec content handling or phase data. |
| IV. EARS Format for Requirements | PASS | Unaffected. |
| V. AI-Agent-Optimized Output | PASS | Unaffected. |
| VI. Simplicity and YAGNI | PASS | One component (90 lines), three 2-line page integrations. Reuses `pageTransition` from `lib/motion.ts`. No new abstractions, no new dependencies. |

## Project Structure

### Documentation (this feature)

```text
specs/021-generation-status-messages/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Technology decisions
├── data-model.md        # Phase 1: No schema changes (documenting non-change)
├── quickstart.md        # Phase 1: Setup and file overview
├── checklists/
│   └── requirements.md  # Spec quality checklist
├── contracts/
│   └── ui-contracts.md  # Component interface contract
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
components/
└── ui/
    └── generation-status.tsx            # NEW — rotating status message component

app/
└── project/
    └── [id]/
        ├── spec/
        │   └── page.tsx                 # MODIFY — add <GenerationStatus phase="spec">
        ├── plan/
        │   └── page.tsx                 # MODIFY — add <GenerationStatus phase="plan">
        └── tasks/
            └── page.tsx                 # MODIFY — add <GenerationStatus phase="tasks">

__tests__/
└── unit/
    └── generation-status.test.tsx       # NEW — component unit tests
```

**Structure Decision**: The component lives in `components/ui/` following the established convention for self-contained UI components (alongside `collapsible.tsx`, `project-list.tsx`, etc.). Test lives in `__tests__/unit/` matching existing test organization. No new directories needed.

## Complexity Tracking

No constitution violations to justify. This feature is a straightforward visual feedback enhancement with no architectural changes.
