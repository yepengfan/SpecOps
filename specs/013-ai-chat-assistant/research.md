# Research: AI Chat Assistant

**Feature**: 013-ai-chat-assistant
**Date**: 2026-02-23

## R1: Chat API Route vs Extending Generate Route

**Decision**: Create a new `/api/chat/route.ts` endpoint separate from `/api/generate/route.ts`.

**Rationale**: The existing generate endpoint is single-turn (one system prompt + one user message). Chat requires multi-turn conversation with a `messages` array. The Anthropic SDK `messages.create()` already supports multi-turn via the `messages` parameter. Combining both patterns into one endpoint would require branching logic and conflate two distinct concerns. A separate route keeps both simple.

**Alternatives considered**:
- Extend `/api/generate` with a new `"chat"` action: Rejected — the `messages` array pattern is fundamentally different from the single system+user pattern. Would require significant refactoring of `buildPrompt` and the request interface.
- Client-side SDK calls: Rejected — would expose the API key to the browser, violating constitution principle I.

## R2: Chat Message Storage Strategy

**Decision**: Store chat messages in a new Dexie table `chatMessages` with a compound index on `projectId` and auto-increment primary key.

**Rationale**: Chat messages are a separate concern from project data. Storing them inside the `Project` object would inflate every project read/write with potentially hundreds of messages. A separate table with a `projectId` index enables efficient queries (`where("projectId").equals(id)`) and independent CRUD. Dexie v4 (already installed) supports adding new tables via `version(4).stores()`.

**Alternatives considered**:
- Store inside `Project.chatHistory` array: Rejected — every `updateProject` call would write the entire chat history, and the growing payload would slow down auto-save during section editing.
- localStorage: Rejected — 5-10MB limit would be hit quickly with large conversations; no structured query support.
- Server-side storage: Rejected — violates constitution principle I (no external database).

## R3: Phase-Scoped Context Injection

**Decision**: Build a plain-text project context string from section contents, scoped to the current phase, and inject it as the system prompt. Full conversation history (all prior messages from all phases) is always sent.

**Rationale**: The spec requires cumulative context: spec phase → spec only; plan phase → spec + plan; tasks phase → spec + plan + tasks. The system prompt is the natural place for project context — it's always available to the AI but doesn't pollute the conversation history. Full message history is sent per spec clarification (conversation memory persists across phase switches).

**Alternatives considered**:
- Inject context as a hidden user message: Rejected — would appear in conversation display or require filtering logic; system prompt is cleaner.
- Re-inject context into every user message: Rejected — redundant token usage; system prompt is sent once per request.
- Only send messages from the current phase: Rejected — spec clarification explicitly states full conversation memory regardless of phase.

## R4: Streaming Pattern for Chat

**Decision**: Reuse the existing SSE streaming pattern from `/api/generate` — `ReadableStream` on the server, `EventSource`-style parsing on the client via an async generator.

**Rationale**: The existing `streamGenerate()` async generator in `lib/api/stream-client.ts` already handles SSE parsing, error propagation, and chunk accumulation. The chat endpoint will use the same SSE format (`data: {type: "content", text: "..."}\n\n`). A new `streamChat()` function mirrors `streamGenerate()` with the chat-specific request shape.

**Alternatives considered**:
- WebSockets: Rejected — overkill for request-response streaming; SSE is simpler and already proven in the codebase.
- Polling: Rejected — poor UX for real-time streaming; SSE is native and efficient.
- Reuse `streamGenerate()` directly: Rejected — the request payload is different (messages array vs single action). A separate function with a clear interface is simpler.

## R5: Suggested Edit Format

**Decision**: The AI uses structured markers in its response text: `[EDIT section-id phase-type]...[/EDIT]` to propose edits. The client parses these markers and renders Apply/Dismiss UI.

**Rationale**: This approach keeps the AI response as plain text (streamed normally) while enabling structured edit proposals. No Anthropic tool_use needed, which would complicate the streaming flow and require a different API pattern. The parser is simple (regex-based) and the markers are unlikely to appear in normal conversation.

**Alternatives considered**:
- Anthropic tool_use: Rejected — requires non-streaming or complex tool_use streaming handling; adds significant complexity for a v1 feature.
- Separate "suggest edit" action: Rejected — would break the conversational flow; edits should emerge naturally from conversation.
- JSON blocks in response: Rejected — JSON in a streamed text response is fragile to parse incrementally; markers with clear delimiters are more robust.

## R6: Chat Store Design

**Decision**: Separate Zustand store `chat-store.ts` with state for messages, isOpen, isStreaming, error, and actions for loadHistory, sendMessage, clearHistory, togglePanel.

**Rationale**: Chat state is orthogonal to project state. The project store manages phases, sections, and saves. The chat store manages conversation UI state, message streaming, and chat persistence. Keeping them separate follows the existing pattern (one store per concern) and avoids bloating `project-store.ts`.

**Alternatives considered**:
- Extend `project-store.ts`: Rejected — would add ~100 lines of unrelated state and actions to an already sizeable store; violates single-responsibility.
- React context instead of Zustand: Rejected — Zustand is already the standard in this codebase; mixing state management patterns adds cognitive overhead.

## R7: Delete Chat on Project Delete

**Decision**: Update `deleteProject` in `lib/db/projects.ts` to also delete all chat messages for that project from the `chatMessages` table.

**Rationale**: The spec requires chat history deletion when a project is deleted (FR-014). Since both tables are in the same Dexie database, this can be done in a single transaction. The delete is performed by adding a `db.chatMessages.where("projectId").equals(id).delete()` call alongside the existing `db.projects.delete(id)`.

**Alternatives considered**:
- Orphan cleanup on next access: Rejected — leaves stale data in IndexedDB; explicit cleanup is cleaner.
- Cascade via Dexie hooks: Rejected — Dexie doesn't have built-in cascade; manual cleanup in the delete function is straightforward.
