# Implementation Plan: AI Chat Assistant

**Branch**: `013-ai-chat-assistant` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-ai-chat-assistant/spec.md`

## Summary

Add a slide-out chat panel to the project view that lets users converse with AI about generated content. The AI receives phase-scoped project context (spec only → spec+plan → spec+plan+tasks), streams responses in real time, and can suggest edits that users apply directly. Chat history persists per project in IndexedDB via a new Dexie table. Reuses the existing Anthropic SDK server-side streaming infrastructure with a new `/api/chat` route that supports multi-turn conversation.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React 19, Next.js 16, Zustand 5, Dexie.js 4, shadcn/ui, Tailwind CSS 4, Anthropic SDK 0.78.x, react-markdown
**Storage**: IndexedDB via Dexie.js (client-side only) — new `chatMessages` table
**Testing**: Jest 30 + Testing Library (unit/component), fake-indexeddb for integration
**Target Platform**: Web (modern browsers — last 2 versions of Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: First AI token <3s per SC-001; chat history load <500ms; editor remains usable with panel open per SC-005
**Constraints**: No server-side state; all data in IndexedDB; WCAG 2.1 AA accessibility; API key server-side only
**Scale/Scope**: Single user, local projects — no concurrency concerns; one conversation thread per project

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Minimal Server, Secure API Proxy | PASS | New `/api/chat` route is a thin proxy — forwards messages to Claude API, streams response back. API key stays server-side. No custom backend logic beyond prompt assembly. |
| II. Phase Gate Discipline | PASS | Chat does not modify phase status. Suggested edits go through `updateSection` which already respects reviewed/locked phase gates. FR-009 explicitly prevents editing locked phases. |
| III. Spec as Source of Truth | PASS | Chat-applied edits use the existing `updateSection` store action. The spec content remains authoritative — AI suggestions are proposals the user confirms. |
| IV. EARS Format for Requirements | N/A | Chat content is conversational, not requirements. |
| V. AI-Agent-Optimized Output | N/A | No export format changes — chat history is explicitly excluded from export per spec assumptions. |
| VI. Simplicity and YAGNI | PASS | One new API route, one new Dexie table, one new Zustand store, one panel component with sub-components. No abstraction layers — direct calls to Anthropic SDK. Fixed panel width (not resizable). |

**Gate Result**: ALL PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/013-ai-chat-assistant/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── api/
│   └── chat/
│       └── route.ts             # NEW — chat streaming API endpoint
└── project/
    └── [id]/
        └── layout.tsx           # MODIFY — add chat panel toggle + panel

components/
├── chat/
│   ├── chat-panel.tsx           # NEW — slide-out panel container
│   ├── chat-message.tsx         # NEW — individual message bubble
│   ├── chat-input.tsx           # NEW — message input with send button
│   └── suggested-edit.tsx       # NEW — apply/dismiss card for AI suggestions
└── ui/
    └── (existing components)    # NO CHANGE

lib/
├── chat/
│   └── context-builder.ts      # NEW — builds phase-scoped project context
├── stores/
│   ├── project-store.ts        # NO CHANGE — updateSection already handles edits
│   └── chat-store.ts           # NEW — chat state management
├── prompts/
│   └── chat.ts                 # NEW — system prompt for chat assistant
├── db/
│   ├── database.ts             # MODIFY — add version(4) with chatMessages table
│   └── chat-messages.ts        # NEW — CRUD for chat messages
└── types/
    └── chat.ts                 # NEW — ChatMessage type

__tests__/
├── unit/
│   ├── chat-panel.test.tsx      # NEW — panel open/close, message display
│   ├── chat-input.test.tsx      # NEW — send, disable during streaming
│   ├── suggested-edit.test.tsx  # NEW — apply/dismiss actions
│   └── context-builder.test.ts  # NEW — phase-scoped context
└── integration/
    └── chat-persistence.test.ts # NEW — chat CRUD in Dexie
```

**Structure Decision**: Existing Next.js App Router structure. New `components/chat/` directory for chat-specific components. New `lib/chat/` for context builder. New `lib/types/chat.ts` and `lib/stores/chat-store.ts` for chat state. New `lib/db/chat-messages.ts` for persistence. New `lib/prompts/chat.ts` for the chat system prompt. New `app/api/chat/route.ts` for the chat API endpoint.

## Architecture

### Approach: Slide-Out Chat Panel with Streaming Multi-Turn Conversation

The project layout gets a toggle button and a slide-out panel on the right side. The panel maintains a conversation with the AI, sending full message history plus phase-scoped project context on each turn.

**Data flow (send message)**:
1. User types message + Enter/click send → `chat-store.sendMessage(text)` called
2. Store adds user message to local state → persists to Dexie `chatMessages` table
3. Store calls `fetch("/api/chat", { messages, projectContext, phaseType })` with streaming
4. API route builds system prompt (from `lib/prompts/chat.ts`) + conversation messages → streams to Anthropic SDK
5. SSE chunks arrive → store accumulates assistant response text → UI re-renders progressively
6. On stream complete → store persists full assistant message to Dexie
7. If response contains a suggested edit → `<SuggestedEdit>` renders with Apply/Dismiss buttons

**Data flow (apply edit)**:
1. User clicks "Apply" on a suggested edit
2. Component calls `useProjectStore.getState().updateSection(phaseType, sectionId, newContent)`
3. Store validates phase is not reviewed/locked → updates section → debounced save to IndexedDB
4. Chat message is marked as "applied" in the UI

**Data flow (load history)**:
1. Chat panel opens → `chat-store.loadHistory(projectId)` called
2. Store queries `db.chatMessages.where("projectId").equals(id).sortBy("timestamp")`
3. Messages rendered in chronological order → scroll to bottom

### Key Design Decisions

1. **Separate `/api/chat` route (not extending `/api/generate`)**: The chat endpoint accepts a `messages` array for multi-turn conversation, which is fundamentally different from the single-turn generate endpoint. Keeping them separate respects constitution principle VI (simplicity) and avoids complicating the existing generate route.

2. **Separate Zustand store for chat**: Chat state (messages, isOpen, isStreaming, error) is independent of project state. A separate `chat-store.ts` keeps concerns isolated and avoids bloating `project-store.ts`.

3. **Flat `chatMessages` table in Dexie (not nested in Project)**: Chat messages are stored in their own table indexed by `projectId`, not inside the Project object. This avoids inflating every project read/write with potentially large chat history and simplifies message CRUD.

4. **Full conversation history sent to API**: Per spec clarification, all prior messages are sent regardless of current phase. The `projectContext` (phase-scoped content) is injected as a system prompt, not as user messages, so the AI always has the full conversation memory.

5. **Suggested edits via structured markers in AI response**: The chat system prompt instructs the AI to use a specific format (`[EDIT section-id phase-type]...[/EDIT]`) when suggesting edits. The client parses these markers and renders Apply/Dismiss UI. This avoids tool_use complexity while keeping the format parseable.

6. **Fixed panel width**: The panel uses a fixed width (e.g., `w-96`) per spec assumption. No resize handle needed.

7. **Chat history deleted with project**: Dexie version 4 migration adds the table. `deleteProject` is updated to also delete chat messages for that project.

## Complexity Tracking

No constitution violations — this section is intentionally empty.
