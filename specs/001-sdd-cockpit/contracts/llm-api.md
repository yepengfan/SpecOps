# Contract: LLM API Interface

**Date**: 2026-02-22

## Overview

The app communicates with the Claude API via server-side Next.js API routes. The frontend never calls the Anthropic API directly — all requests are proxied through `/api/generate` to keep the API key server-side.

## Architecture

```
Browser (React) → /api/generate (Next.js API route) → api.anthropic.com
                                  ↑
                        API key from .env.local
```

## Frontend → API Route

### Endpoint

```
POST /api/generate
```

### Request Shape

```typescript
interface GenerateRequest {
  action: "validate" | "generate-requirements" | "generate-design" | "generate-tasks" | "regenerate-section" | "re-analyze-mappings";
  projectDescription?: string;    // for generate-requirements
  requirementsContent?: string;   // for generate-design, generate-tasks, re-analyze-mappings
  designContent?: string;         // for generate-tasks, re-analyze-mappings
  tasksContent?: string;          // for re-analyze-mappings
  sectionName?: string;           // for regenerate-section
  phaseContext?: string;          // for regenerate-section
}
```

### Response

For `validate`:
```typescript
// Success: { status: "valid" }
// Failure: { status: "invalid", error: "..." }
```

For generation actions (streamed):
```
Content-Type: text/event-stream

data: {"type": "content", "text": "..."}
data: {"type": "done", "traceabilityMappings": []}       // always present; empty for actions that don't produce mappings
data: {"type": "error", "message": "..."}
```

The `done` event always includes a `traceabilityMappings` array. For `generate-design`, `generate-tasks`, and `re-analyze-mappings`, this array contains the AI-generated mappings (Req 10). For all other actions (`validate`, `generate-requirements`, `regenerate-section`), the array is empty. See [Operation 7](#7-re-analyze-mappings-req-10) for the mapping shape.

## API Route → Claude API

### Authentication (server-side only)

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

**Note**: The Anthropic SDK reads the API key from `.env.local` on the server. No `anthropic-dangerous-direct-browser-access` header needed.

### Request Shape (to Claude)

```typescript
interface LLMRequest {
  model: string;            // e.g., "claude-sonnet-4-6"
  max_tokens: number;       // e.g., 4096
  stream: boolean;          // true for generation
  system?: string;          // system prompt with generation instructions
  messages: Message[];      // conversation messages
}

interface Message {
  role: "user" | "assistant";
  content: string;
}
```

## Operations

### 1. Validate API Key (Req 9)

Server-side check that the key is configured and valid.

```typescript
// API route checks process.env.ANTHROPIC_API_KEY exists
// Then makes a lightweight call:
{
  model: "claude-sonnet-4-6",
  max_tokens: 1,
  messages: [{ role: "user", content: "Hi" }]
}

// Returns: { status: "valid" } or { status: "invalid", error: "..." }
```

### 2. Key Status (Req 9)

```
GET /api/key-status

// Returns: { configured: true } or { configured: false }
// Never returns the key itself
```

### 3. Generate Requirements (Req 3)

```typescript
// System prompt instructs EARS format output
// User message contains the project description
// Stream: true — SSE proxied to browser

// Expected output sections:
//   - Problem Statement
//   - EARS-format Requirements (WHEN/THEN/WHERE/IF)
//   - Non-Functional Requirements
```

### 4. Generate Plan (Req 4, 10)

```typescript
// System prompt instructs plan document format
// User message contains the approved spec content
// Stream: true

// Expected output sections:
//   - Architecture
//   - API Contracts
//   - Data Model
//   - Tech Decisions
//   - Security & Edge Cases

// Traceability metadata (Req 10):
// The system prompt also instructs the AI to output a JSON traceability
// mapping after the plan content, mapping each plan section to the
// requirement(s) it addresses. The API route parses this and includes it
// in the "done" SSE event as traceabilityMappings[].
//
// Example mapping output from AI:
// {"traceability": [
//   {"targetType": "plan", "targetId": "architecture", "targetLabel": "Architecture", "requirementIds": ["req-1", "req-7"]},
//   {"targetType": "plan", "targetId": "api-contracts", "targetLabel": "API Contracts", "requirementIds": ["req-3", "req-4", "req-5"]}
// ]}
```

### 5. Generate Tasks (Req 5, 10)

```typescript
// System prompt instructs task breakdown format
// User message contains approved spec AND plan content
// Stream: true

// Expected output sections:
//   - Task List (ordered, atomic, with inputs/outputs)
//   - Dependencies
//   - File Mapping
//   - Test Expectations

// Traceability metadata (Req 10):
// Same as Generate Design — the AI also outputs a JSON mapping of each
// task section to the requirement(s) and design section(s) it implements.
// Included in the "done" SSE event as traceabilityMappings[].
```

### 6. Regenerate Section (Req 6)

```typescript
// Same as parent generation but system prompt specifies:
//   - Only regenerate the named section
//   - Keep output scoped to that section only
// User message includes full phase context + section name to regenerate
```

### 7. Re-analyze Mappings (Req 10)

```typescript
// System prompt instructs the AI to analyze all phase content and output
// traceability mappings as structured JSON — no prose content generated.
// User message contains approved requirements, design, and tasks content.
// Stream: true (for consistency), but response is short.

// Request fields used:
//   requirementsContent, designContent, tasksContent

// Expected response: JSON only (no markdown sections), parsed by the API
// route and returned in the "done" SSE event:
//
// {"traceability": [
//   {"targetType": "plan", "targetId": "architecture", "targetLabel": "Architecture", "requirementIds": ["req-1", "req-7"]},
//   {"targetType": "plan", "targetId": "api-contracts", "targetLabel": "API Contracts", "requirementIds": ["req-3", "req-9"]},
//   {"targetType": "task", "targetId": "task-list", "targetLabel": "Task List", "requirementIds": ["req-1", "req-2", "req-3"]},
//   ...
// ]}
//
// The API route expands this into TraceabilityMapping records (one per
// requirementId × target pair) with origin: "ai". Existing manual mappings
// (origin: "manual") are preserved by the client — only AI mappings are replaced.
```

## Streaming Protocol

The API route proxies Claude's SSE stream to the browser:

1. Server receives Claude SSE events (`content_block_delta`, `message_stop`)
2. Server transforms them into simplified events and forwards via `ReadableStream`
3. Client reads the stream and updates reactive state

```
Claude API → SSE → API Route → ReadableStream → Browser (React state update)
```

## Error Responses

| Scenario | API Route Response | Frontend Behavior | Source |
|----------|-------------------|-------------------|--------|
| Key not in `.env.local` | `{ error: "API key not configured" }` | Show setup instructions | Req 9 |
| Invalid key (401) | `{ error: "Invalid API key" }` | Show error on settings page | Req 9 |
| Rate limit (429) | `{ error: "Rate limit exceeded" }` | "Rate limit exceeded. Please wait." | Req 3 |
| API error (500+) | `{ error: "API error" }` | "API error. Please try again." | Req 3, 4, 5, 10 |
| Network error | `{ error: "Network error" }` | "Unable to reach Claude API." | Req 3, 10 |
| Mapping analysis fails | `{ error: "Mapping analysis failed" }` | "Mapping analysis failed. You can add mappings manually or retry." | Req 10 |

## Malformed Response Handling

If the LLM response does not conform to the expected section structure:
- Display raw response with warning banner
- Do NOT block phase approval
- Allow retry (Req 3, 4, 5)

## Rate Limits

No client-side rate limiting enforced. The API's own rate limits are respected via 429 error handling.
