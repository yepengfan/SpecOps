# Contract: LLM API Interface

**Date**: 2026-02-22

## Overview

The app communicates with the Claude API (Anthropic Messages API) for all AI-assisted generation features. This is the only external interface.

## API Endpoint

```
POST https://api.anthropic.com/v1/messages
```

## Authentication

```
Headers:
  x-api-key: <runtime API key from IndexedDB>
  anthropic-version: 2023-06-01
  content-type: application/json
  anthropic-dangerous-direct-browser-access: true
```

**Note**: The `anthropic-dangerous-direct-browser-access` header is required for browser-side calls to the Anthropic API. This is acceptable because the API key is user-provided and user-controlled.

## Request Shape

```typescript
interface LLMRequest {
  model: string;            // e.g., "claude-sonnet-4-6"
  max_tokens: number;       // e.g., 4096
  stream: boolean;          // true for generation, false for key validation
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

Lightweight call to verify the key is valid.

```typescript
// Request
{
  model: "claude-sonnet-4-6",
  max_tokens: 1,
  messages: [{ role: "user", content: "Hi" }]
}

// Success: HTTP 200 (any response body)
// Invalid key: HTTP 401 { type: "error", error: { type: "authentication_error" } }
```

### 2. Generate Requirements (Req 3)

```typescript
// System prompt instructs EARS format output
// User message contains the project description
// Stream: true — display content incrementally

// Input context:
//   - Project description (from user input)
//
// Expected output sections:
//   - Problem Statement
//   - EARS-format Requirements (WHEN/THEN/WHERE/IF)
//   - Non-Functional Requirements
```

### 3. Generate Design (Req 4)

```typescript
// System prompt instructs design document format
// User message contains the approved requirements.md content
// Stream: true

// Input context:
//   - Approved requirements content (all sections concatenated)
//
// Expected output sections:
//   - Architecture
//   - API Contracts
//   - Data Model
//   - Tech Decisions
//   - Security & Edge Cases
```

### 4. Generate Tasks (Req 5)

```typescript
// System prompt instructs task breakdown format
// User message contains approved requirements.md AND design.md content
// Stream: true

// Input context:
//   - Approved requirements content
//   - Approved design content
//
// Expected output sections:
//   - Task List (ordered, atomic, with inputs/outputs)
//   - Dependencies
//   - File Mapping
//   - Test Expectations
```

### 5. Regenerate Section (Req 6)

```typescript
// Same as parent generation but system prompt specifies:
//   - Only regenerate the named section
//   - Keep output scoped to that section only
// User message includes full phase context + section name to regenerate
```

## Streaming Protocol

The Claude API uses Server-Sent Events (SSE) when `stream: true`.

```
Event types:
  content_block_delta  → Extract delta.text, append to section content
  message_stop         → Generation complete
  error                → Handle as API failure
```

**Client-side pattern**:
```
fetch() → response.body.getReader() → read chunks → parse SSE → update reactive state
```

## Error Responses

| HTTP Status | Error Type | App Behavior | Source |
|-------------|-----------|--------------|--------|
| 401 | `authentication_error` | "Invalid API key" → redirect to settings | Req 3, 9 |
| 429 | `rate_limit_error` | "Rate limit exceeded. Please wait." | Req 3 |
| 500+ | `api_error` | "API error. Please try again." | Req 3, 4, 5 |
| Network | `TypeError` (fetch) | "Network error. Please check your connection." | Req 3 |

## Malformed Response Handling

If the LLM response does not conform to the expected section structure:
- Display raw response with warning banner
- Do NOT block phase approval
- Allow retry (Req 3, 4, 5)

## Rate Limits

No client-side rate limiting enforced. The API's own rate limits are respected via 429 error handling.
