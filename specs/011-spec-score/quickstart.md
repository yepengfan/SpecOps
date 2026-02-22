# Quickstart: Spec Score

**Feature**: 011-spec-score | **Date**: 2026-02-22

## Overview

The Spec Score feature adds quality evaluation to the SDD Cockpit. It has two tiers:
1. **Rule-based checks** — instant, no API call, validates structural quality
2. **AI deep analysis** — on-demand, one API call, scores quality across 5 dimensions

## Architecture At a Glance

```
User clicks "Evaluate"
  → lib/eval/rules.ts (pure functions, sync)
  → RuleCheckResult[] stored on Project.evaluations[phase]
  → Rendered in components/eval/evaluation-panel.tsx

User clicks "Deep Analysis"
  → lib/api/stream-client.ts → POST /api/generate (action: "deep-analysis")
  → lib/prompts/deep-analysis.ts (prompt + parser)
  → DeepAnalysisResult stored on Project.evaluations[phase]
  → Rendered in components/eval/deep-analysis-results.tsx

Content changes (debounced save)
  → lib/eval/hash.ts computes new hash
  → If hash differs from stored, clear evaluations[phase]
```

## Key Design Decisions

1. **Evaluation data lives on the Project object** (like traceabilityMappings), not in a separate table. Avoids Dexie schema migration.

2. **Rule checks are pure functions** — `evaluateSpec(content)`, `evaluatePlan(content)`, `evaluateTasks(content)` — no side effects, trivially testable.

3. **Content hash invalidation** — a fast non-cryptographic hash of concatenated section content. Compared on debounced save. Mismatch → clear results.

4. **AI deep analysis reuses existing streaming pattern** — same SSE protocol, same `/api/generate` endpoint, new action. Client accumulates stream, parses JSON.

5. **Health score is derived at render time** from persisted evaluation data — no separate stored field.

## File Map

| File | Purpose |
|------|---------|
| `lib/eval/types.ts` | Type definitions for all evaluation entities |
| `lib/eval/rules.ts` | Rule-based evaluation functions per phase |
| `lib/eval/hash.ts` | Content hashing for invalidation |
| `lib/prompts/deep-analysis.ts` | AI prompt and response parser |
| `lib/db/evaluations.ts` | CRUD helpers for evaluation data on Project |
| `lib/stores/evaluation-store.ts` | Zustand store for evaluation UI state |
| `components/eval/evaluation-panel.tsx` | Collapsible panel with Evaluate/Deep Analysis buttons |
| `components/eval/rule-checklist.tsx` | Green/red checklist display |
| `components/eval/deep-analysis-results.tsx` | Progress bars + suggestions |
| `components/ui/progress.tsx` | shadcn/ui progress bar primitive |
| `app/api/generate/route.ts` | Extended with "deep-analysis" action |

## Getting Started (Development)

1. Checkout the feature branch: `git checkout 011-spec-score`
2. Start with `lib/eval/types.ts` — defines all evaluation types
3. Implement `lib/eval/rules.ts` — write and test rule functions
4. Add `lib/eval/hash.ts` — content hashing utility
5. Build `components/eval/evaluation-panel.tsx` — wire into phase pages
6. Add persistence via `lib/db/evaluations.ts`
7. Add AI deep analysis (prompt, API route, parser)
8. Add health score to project cards

## Testing Strategy

- **Unit tests** for rule evaluation functions (most critical — many edge cases)
- **Unit tests** for content hashing and deep analysis prompt parsing
- **Component tests** for evaluation panel rendering and interactions
- **Integration tests** for persistence and invalidation flow
