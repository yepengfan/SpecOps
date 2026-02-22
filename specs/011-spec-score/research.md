# Research: Spec Score

**Feature**: 011-spec-score | **Date**: 2026-02-22

## R1: Content Hashing for Invalidation

**Decision**: Use a simple string hash computed from concatenated section content per phase.

**Rationale**: The hash must be fast (computed on every save to check staleness) and deterministic. A cryptographic hash is unnecessary — this is cache invalidation, not security. A fast string hash (e.g., djb2 or similar) on the concatenated `section.content` values is sufficient. The hash is stored alongside evaluation results; when the computed hash no longer matches, results are cleared.

**Alternatives considered**:
- `crypto.subtle.digest("SHA-256")`: Overkill for cache invalidation. Async API adds unnecessary complexity.
- Content length comparison: Too coarse — different content can have the same length.
- Timestamp comparison: The existing `updatedAt` field advances on every save, even if content didn't change (e.g., phase approval). Not reliable for content-change detection.

## R2: Evaluation Data Storage Strategy

**Decision**: Store evaluation results as a field on the existing Project object in the projects table (similar to `traceabilityMappings`).

**Rationale**: The existing project data model stores traceability mappings directly on the Project object. Following the same pattern keeps the architecture consistent and avoids a Dexie schema version bump for a new table. Evaluations are per-project metadata, making them a natural fit as a Project field. The data is small (a few KB of check results per phase).

**Alternatives considered**:
- Separate Dexie table (`evaluations`): Would require a version 4 migration, separate CRUD operations, and cross-table queries. More complexity for no benefit at current scale.
- In-memory only (Zustand store): Would lose results on page refresh, violating FR-008 (persistence requirement).
- localStorage: Size limitations, no structured data support. IndexedDB via Dexie is already established.

## R3: AI Deep Analysis Response Format

**Decision**: Use a non-streaming JSON response parsed from a single Claude completion. The API route streams chunks but the client accumulates the full response before parsing.

**Rationale**: The deep analysis returns structured data (5 dimension scores, improvement suggestions, cross-phase findings) — not prose for progressive display. The existing pattern already accumulates streamed text before parsing (see `parsePlanSections`, `parseTaskSections`). Same approach works here: stream the response, accumulate, parse the JSON structure from the result.

**Alternatives considered**:
- Non-streaming API call: Would require a separate API endpoint with different response handling. Inconsistent with existing patterns.
- Streaming with progressive UI updates: Scores only make sense as a complete set. Showing partial scores would be confusing.

## R4: Rule-Based Check Architecture

**Decision**: Pure functions that take phase content (string) and return `RuleCheckResult[]`. One function per phase type: `evaluateSpec()`, `evaluatePlan()`, `evaluateTasks()`.

**Rationale**: Pure functions are trivially testable, have no side effects, and can run synchronously in <1ms. The regex patterns match existing content formats (EARS keywords, section headers, task numbering). Separating by phase type keeps each function focused and maintainable.

**Alternatives considered**:
- Configurable rule engine with rule definitions: Over-engineered for 3 fixed phase types with known content formats. YAGNI.
- Running checks in a Web Worker: Unnecessary — the checks are simple string matching that complete in microseconds.

## R5: Health Score Computation

**Decision**: Derive health score from stored evaluation results at render time. Display as "N/M checks passing" text on project cards.

**Rationale**: Computing the score at render time from persisted evaluation data avoids storing a separate derived value that could become stale. The computation is trivial (count passing checks / total checks). The pass-rate format is immediately understandable without explanation.

**Alternatives considered**:
- Numeric score (0-100): Requires defining weights per check, which adds complexity and subjective judgment. A simple pass/fail count is objective.
- Letter grade (A-F): Same weighting problem. Also ambiguous across grading systems.
- Pre-computed score stored in DB: Creates staleness risk — must be updated whenever evaluations change. Better to derive on read.

## R6: Deep Analysis Prompt Design

**Decision**: Single prompt per phase that includes the scoring rubric inline. Cross-phase analysis is included in the same prompt when upstream content is available.

**Rationale**: Bundling everything into one prompt minimizes API calls (one per "Deep Analysis" click). The rubric is embedded in the system prompt so the model has clear scoring criteria. Cross-phase content is included as additional context only when available — the prompt adapts based on what's provided.

**Alternatives considered**:
- Separate prompts for single-phase and cross-phase analysis: Doubles API costs when both are needed. Users would need to click twice.
- Tool-use / function-calling for structured output: The current Anthropic SDK streaming pattern doesn't use tool calls. Parsing JSON from text output is simpler and consistent with existing patterns.
