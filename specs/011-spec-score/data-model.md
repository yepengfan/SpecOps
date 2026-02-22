# Data Model: Spec Score

**Feature**: 011-spec-score | **Date**: 2026-02-22

## Entities

### RuleCheckResult

Represents the outcome of a single rule-based check.

| Field       | Type    | Description                                           |
| ----------- | ------- | ----------------------------------------------------- |
| id          | string  | Unique identifier for the rule (e.g., "spec-ears-keywords") |
| name        | string  | Human-readable rule name (e.g., "EARS Keywords Present") |
| passed      | boolean | Whether the check passed                              |
| explanation | string  | Empty if passed; specific failure message if failed   |

### DimensionScore

Represents a single dimension in the AI deep analysis.

| Field     | Type   | Description                                      |
| --------- | ------ | ------------------------------------------------ |
| dimension | string | One of: "completeness", "testability", "unambiguity", "consistency", "actionability" |
| score     | number | Integer from 1 to 5                              |
| rationale | string | Brief explanation for the score                  |

### Suggestion

An actionable improvement suggestion from AI deep analysis.

| Field   | Type   | Description                                           |
| ------- | ------ | ----------------------------------------------------- |
| quote   | string | Quoted excerpt from the evaluated content              |
| issue   | string | What is wrong or could be improved                     |
| fix     | string | Specific suggested improvement                        |

### CrossPhaseFindings

Results from cross-phase coverage analysis.

| Field          | Type     | Description                                        |
| -------------- | -------- | -------------------------------------------------- |
| summary        | string   | Overall coverage assessment                        |
| coveredItems   | string[] | Requirements/components that are adequately covered |
| uncoveredItems | string[] | Requirements/components that are missing or weak    |

### DeepAnalysisResult

Complete output from a single AI deep analysis invocation.

| Field              | Type                    | Description                                  |
| ------------------ | ----------------------- | -------------------------------------------- |
| dimensions         | DimensionScore[]        | Scores for all 5 quality dimensions          |
| suggestions        | Suggestion[]            | Actionable improvement suggestions           |
| crossPhaseFindings | CrossPhaseFindings \| null | Present only when upstream content was available |
| analyzedAt         | number                  | Timestamp (Date.now()) when analysis completed |

### PhaseEvaluation

Complete evaluation state for a single phase. Stored on the Project object.

| Field        | Type                       | Description                                   |
| ------------ | -------------------------- | --------------------------------------------- |
| contentHash  | string                     | Hash of phase content at time of evaluation    |
| ruleResults  | RuleCheckResult[]          | Results from rule-based checks                 |
| deepAnalysis | DeepAnalysisResult or null | Results from AI deep analysis (null if not run) |
| evaluatedAt  | number                     | Timestamp (Date.now()) when rules were evaluated |

## Extended Project Schema

The existing `Project` interface gains an optional `evaluations` field:

| Field       | Type                                              | Description                          |
| ----------- | ------------------------------------------------- | ------------------------------------ |
| evaluations | `{ spec?: PhaseEvaluation; plan?: PhaseEvaluation; tasks?: PhaseEvaluation }` or undefined | Per-phase evaluation results. Undefined if no evaluations have been run. |

## Relationships

```
Project
├── phases
│   ├── spec (Phase)
│   ├── plan (Phase)
│   └── tasks (Phase)
├── traceabilityMappings (TraceabilityMapping[])
└── evaluations (optional)
    ├── spec? (PhaseEvaluation)
    │   ├── ruleResults (RuleCheckResult[])
    │   └── deepAnalysis? (DeepAnalysisResult)
    │       ├── dimensions (DimensionScore[])
    │       ├── suggestions (Suggestion[])
    │       └── crossPhaseFindings? (CrossPhaseFindings)
    ├── plan? (PhaseEvaluation)
    └── tasks? (PhaseEvaluation)
```

## State Transitions

### PhaseEvaluation Lifecycle

```
[No Evaluation] ---(click Evaluate)---> [Rule Results Only]
[Rule Results Only] ---(click Deep Analysis)---> [Rule Results + Deep Analysis]
[Rule Results + Deep Analysis] ---(content changes, debounced save)---> [No Evaluation]
[Rule Results Only] ---(content changes, debounced save)---> [No Evaluation]
```

### Content Hash Invalidation

On each debounced save, the system:
1. Computes the current content hash for the phase
2. Compares with the stored `contentHash` in `PhaseEvaluation`
3. If different, clears the `PhaseEvaluation` for that phase (sets to undefined)
4. Persists the updated project

## Validation Rules

- `DimensionScore.score` must be an integer between 1 and 5
- `RuleCheckResult.explanation` must be non-empty when `passed` is false
- `RuleCheckResult.explanation` must be empty when `passed` is true
- `PhaseEvaluation.contentHash` must match the hash of the phase content at time of evaluation
- `CrossPhaseFindings` is only present when upstream phase content was included in the analysis prompt

## Content Hash Algorithm

A fast, non-cryptographic string hash. Input: concatenation of all section content strings for a phase, joined with a delimiter. Output: hexadecimal string.

```
hash(phase) = fastHash(phase.sections.map(s => s.content).join("\x00"))
```

The delimiter (`\x00`) prevents collisions where content from adjacent sections could form the same concatenated string.
