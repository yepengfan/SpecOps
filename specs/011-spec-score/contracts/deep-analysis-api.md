# API Contract: Deep Analysis

**Endpoint**: `POST /api/generate` (existing endpoint, new action)

## Request

Extends the existing `GenerateParams` interface with a new action.

```json
{
  "action": "deep-analysis",
  "phaseType": "spec" | "plan" | "tasks",
  "phaseContent": "<concatenated section content>",
  "upstreamContent": "<upstream phase content, optional>"
}
```

| Field           | Type   | Required | Description                                           |
| --------------- | ------ | -------- | ----------------------------------------------------- |
| action          | string | Yes      | Must be `"deep-analysis"`                             |
| phaseType       | string | Yes      | Which phase is being analyzed: `"spec"`, `"plan"`, or `"tasks"` |
| phaseContent    | string | Yes      | All section content for the phase being analyzed       |
| upstreamContent | string | No       | Content from upstream phase (spec for plan analysis, plan for tasks analysis). Omit for spec analysis or when upstream is empty. |

## Response

Server-Sent Events stream (same protocol as existing generate endpoint).

**Event types**:
- `{type: "content", text: "..."}` — Partial text chunk
- `{type: "done"}` — Stream complete
- `{type: "error", message: "..."}` — Error occurred

## Accumulated Response Format

After accumulating all `content` events, the full text is parsed as JSON:

```json
{
  "dimensions": [
    { "dimension": "completeness", "score": 4, "rationale": "..." },
    { "dimension": "testability", "score": 3, "rationale": "..." },
    { "dimension": "unambiguity", "score": 5, "rationale": "..." },
    { "dimension": "consistency", "score": 4, "rationale": "..." },
    { "dimension": "actionability", "score": 3, "rationale": "..." }
  ],
  "suggestions": [
    {
      "quote": "exact text from the content",
      "issue": "what is wrong or could be improved",
      "fix": "specific suggested improvement"
    }
  ],
  "crossPhaseFindings": {
    "summary": "Overall coverage assessment",
    "coveredItems": ["REQ-1: ...", "REQ-2: ..."],
    "uncoveredItems": ["REQ-3: ..."]
  }
}
```

**Notes**:
- `crossPhaseFindings` is `null` when `upstreamContent` was not provided
- `dimensions` always contains exactly 5 entries, one per quality dimension
- `suggestions` contains 0-10 entries, ordered by severity
- `score` values are integers from 1 to 5

## Error Responses

Same as existing generate endpoint:
- `400`: Missing required fields
- `500`: API key not configured or upstream API error
