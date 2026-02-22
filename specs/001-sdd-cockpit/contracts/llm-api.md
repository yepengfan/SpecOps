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
  action: "validate" | "generate-requirements" | "generate-design" | "generate-tasks" | "regenerate-section";
  projectDescription?: string;    // for generate-requirements
  requirementsContent?: string;   // for generate-design, generate-tasks
  designContent?: string;         // for generate-tasks
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
data: {"type": "done"}
data: {"type": "error", "message": "..."}
```

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

### 4. Generate Design (Req 4)

```typescript
// System prompt instructs design document format
// User message contains the approved requirements.md content
// Stream: true

// Expected output sections:
//   - Architecture
//   - API Contracts
//   - Data Model
//   - Tech Decisions
//   - Security & Edge Cases
```

### 5. Generate Tasks (Req 5)

```typescript
// System prompt instructs task breakdown format
// User message contains approved requirements.md AND design.md content
// Stream: true

// Expected output sections:
//   - Task List (ordered, atomic, with inputs/outputs)
//   - Dependencies
//   - File Mapping
//   - Test Expectations
```

### 6. Regenerate Section (Req 6)

```typescript
// Same as parent generation but system prompt specifies:
//   - Only regenerate the named section
//   - Keep output scoped to that section only
// User message includes full phase context + section name to regenerate
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
| API error (500+) | `{ error: "API error" }` | "API error. Please try again." | Req 3, 4, 5 |
| Network error | `{ error: "Network error" }` | "Unable to reach Claude API." | Req 3 |

## Malformed Response Handling

If the LLM response does not conform to the expected section structure:
- Display raw response with warning banner
- Do NOT block phase approval
- Allow retry (Req 3, 4, 5)

## Rate Limits

No client-side rate limiting enforced. The API's own rate limits are respected via 429 error handling.
