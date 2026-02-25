# Implementation Plan: Claude Code-Style Loading Messages

**Branch**: `022-claude-code-loading-messages` | **Date**: 2026-02-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/022-claude-code-loading-messages/spec.md`

## Summary

Replace the phase-specific message sets in `GenerationStatus` with a single shared array of 10 Claude Code-style thinking verbs with emoji prefixes. Change rotation from sequential to random selection with consecutive-repeat avoidance. Keep the `phase` prop for API compatibility but stop using it for message selection. Update tests to match new behavior. No page file changes needed.

## Technical Context

**Language/Version**: TypeScript 5.x + React 19 + Next.js 16 (App Router)
**Primary Dependencies**: Framer Motion (existing), shadcn/ui (existing), Tailwind CSS 4 (existing)
**Storage**: N/A — no storage changes
**Testing**: Jest + React Testing Library (existing); Framer Motion mocked globally in `jest.setup.ts`
**Constraints**: Must retain `phase` prop for API compatibility, must not modify page files, all existing non-generation-status tests must pass
**Scale/Scope**: 2 existing files modified, 0 new files, 0 page changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Minimal Server, Secure API Proxy | PASS | No server changes. Component is entirely client-side. |
| II. Phase Gate Discipline | PASS | No phase gate logic modified. |
| III. Spec as Source of Truth | PASS | No spec content handling changes. |
| IV. EARS Format for Requirements | PASS | No requirements format changes. |
| V. AI-Agent-Optimized Output | PASS | Export/output formats unchanged. |
| VI. Simplicity and YAGNI | PASS | Simplifies the component by removing the phase-message mapping. Fewer lines of code. |

### Post-Design Check

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Minimal Server, Secure API Proxy | PASS | Zero server-side changes. |
| II. Phase Gate Discipline | PASS | Unchanged. |
| III. Spec as Source of Truth | PASS | Unchanged. |
| IV. EARS Format for Requirements | PASS | Unchanged. |
| V. AI-Agent-Optimized Output | PASS | Unchanged. |
| VI. Simplicity and YAGNI | PASS | Simplification — `Record<Phase, string[]>` → `string[]`, sequential index → random index with one helper function. Net code reduction. |

## Project Structure

### Documentation (this feature)

```text
specs/022-claude-code-loading-messages/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technology decisions
├── data-model.md        # No schema changes
├── quickstart.md        # Setup and file overview
├── checklists/
│   └── requirements.md  # Spec quality checklist
├── contracts/
│   └── ui-contracts.md  # Updated component interface contract
└── tasks.md             # Task breakdown
```

### Source Code (repository root)

```text
components/
└── ui/
    └── generation-status.tsx            # MODIFY — shared messages, random selection

__tests__/
└── unit/
    └── generation-status.test.tsx       # MODIFY — updated tests for shared/random behavior
```

**No page file changes**: `app/project/[id]/spec/page.tsx`, `plan/page.tsx`, `tasks/page.tsx` are untouched. The `phase` prop is still accepted.

## Complexity Tracking

No constitution violations. This is a simplification of an existing component — fewer data structures, simpler logic.
