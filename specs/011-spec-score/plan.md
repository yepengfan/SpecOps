# Implementation Plan: Spec Score

**Branch**: `011-spec-score` | **Date**: 2026-02-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-spec-score/spec.md`

## Summary

Add a Spec Score feature that evaluates AI-generated content quality across all three SDD phases. Rule-based checks run instantly in the browser (no API call). Optional AI deep analysis sends content to Claude for multi-dimensional scoring with improvement suggestions. Results persist in IndexedDB and invalidate on content changes. A health summary appears on project cards in the project list.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js (App Router), Zustand (state), shadcn/ui (components), Dexie.js (IndexedDB), Anthropic SDK (server-side)
**Storage**: IndexedDB via Dexie.js (evaluation results stored alongside project data)
**Testing**: Jest + @testing-library/react, fake-indexeddb/auto
**Target Platform**: Modern browsers (last 2 versions Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Next.js)
**Performance Goals**: Rule-based evaluation <1s, AI deep analysis <30s
**Constraints**: No server-side database, API key stored in `.env.local`, WCAG 2.1 AA accessibility
**Scale/Scope**: Single-user, client-side evaluation per project/phase

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Minimal Server, Secure API Proxy | PASS | Deep analysis uses existing API proxy pattern. Rule-based checks run entirely client-side. No new server infrastructure. |
| II. Phase Gate Discipline | PASS | Spec Score is read-only analysis — it does not modify or bypass phase gates. Works on any phase with content. |
| III. Spec as Source of Truth | PASS | Evaluation results are metadata about specs, not modifications to spec content. Results invalidate when content changes. |
| IV. EARS Format for Requirements | PASS | Rule-based checks specifically validate EARS format compliance, reinforcing this principle. |
| V. AI-Agent-Optimized Output | PASS | Deep analysis output is structured (JSON scores + suggestions), not free-form. |
| VI. Simplicity and YAGNI | PASS | No custom scoring algorithms. Rule checks are simple regex/string matching. Progress bars over radar charts. Pass-rate display over computed scores. |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/011-spec-score/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
lib/
├── eval/
│   ├── rules.ts                 # Rule-based evaluation engine (spec, plan, tasks rules)
│   ├── hash.ts                  # Content hashing for invalidation
│   └── types.ts                 # Evaluation types (RuleCheckResult, PhaseEvaluation, etc.)
├── prompts/
│   └── deep-analysis.ts         # AI deep analysis prompt + response parser
├── db/
│   └── evaluations.ts           # Dexie CRUD for evaluation results (stored on Project object, no schema migration)
├── stores/
│   └── evaluation-store.ts      # Zustand store for evaluation state
└── utils/
    └── project.ts               # Extended with health score computation

components/
├── eval/
│   ├── evaluation-panel.tsx     # Collapsible panel (buttons + results)
│   ├── rule-checklist.tsx       # Green/red checklist display
│   └── deep-analysis-results.tsx # Progress bars + suggestions
└── ui/
    └── progress.tsx             # Progress bar primitive (shadcn/ui)

app/
└── api/
    └── generate/
        └── route.ts             # Extended with deep-analysis action

__tests__/
├── unit/
│   ├── eval-rules.test.ts       # Rule engine tests (spec, plan, tasks)
│   ├── eval-hash.test.ts        # Content hashing tests
│   ├── deep-analysis-prompt.test.ts # Prompt + parser tests
│   └── evaluation-panel.test.tsx # Component tests
└── integration/
    └── evaluation-persistence.test.ts # DB persistence + invalidation tests
```

**Structure Decision**: Follows existing codebase conventions. New `lib/eval/` directory groups evaluation logic. New `components/eval/` directory groups evaluation UI. Extends existing API route, database, and store patterns.
