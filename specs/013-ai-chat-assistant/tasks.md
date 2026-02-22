# Tasks: AI Chat Assistant

**Input**: Design documents from `/specs/013-ai-chat-assistant/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Included per quickstart.md testing strategy (unit tests for components, integration tests for persistence).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. US1 and US2 are combined into a single phase because they are co-priority (P1) and inseparable — the panel IS the delivery mechanism for the AI chat.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project-level infrastructure needed — the existing Next.js, Zustand, Dexie, and Anthropic SDK setup is reused. This phase is intentionally empty.

*(No tasks — existing infrastructure is sufficient)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create all shared types, database schema, CRUD functions, prompts, context builder, streaming client, API route, and cascade delete logic that user story phases depend on.

- [ ] T001 Create `ChatMessage` and `SuggestedEdit` TypeScript interfaces — ChatMessage has id (number, auto-increment), projectId (string), role (`"user"` | `"assistant"`), content (string), timestamp (number), optional suggestedEdit; SuggestedEdit has sectionId, phaseType, proposedContent, status (`"pending"` | `"applied"` | `"dismissed"`) — in `lib/types/chat.ts`
- [ ] T002 [P] Add Dexie version(4) schema with `chatMessages` table — indexed `++id, projectId, timestamp`; no data migration needed, existing `projects` table unchanged — in `lib/db/database.ts`
- [ ] T003 [P] Create chat messages CRUD functions — `addChatMessage(msg)`, `getChatMessages(projectId)` sorted by timestamp, `updateChatMessage(id, data)`, `clearChatMessages(projectId)`, `deleteChatMessagesByProject(projectId)` with `StorageError` handling — in `lib/db/chat-messages.ts`
- [ ] T004 [P] Create chat system prompt builder — `getChatSystemPrompt(projectContext, phaseType)` returns system prompt instructing AI to be an SDD assistant that references the provided project content and provides analytical responses grounded in the actual sections; include instruction that when suggesting edits to EARS Requirements sections, the AI MUST maintain EARS format (WHEN/THEN/SHALL/WHERE/IF keywords) per constitution principle IV — in `lib/prompts/chat.ts`
- [ ] T005 [P] Create phase-scoped project context builder — `buildProjectContext(project, phaseType)` returns formatted string: spec sections only for `"spec"`, spec+plan for `"plan"`, spec+plan+tasks for `"tasks"`; each section labeled with its title for AI readability — in `lib/chat/context-builder.ts`
- [ ] T006 [P] Create `streamChat()` async generator — accepts `ChatParams` (messages array, projectContext, phaseType), fetches `/api/chat`, parses SSE stream yielding text chunks; uses same SSE format as existing `streamGenerate()` — in `lib/api/stream-client.ts`
- [ ] T007 Create `/api/chat` streaming API route — validates API key (401 if missing), parses `ChatRequest` (messages, projectContext, phaseType), builds system prompt via `getChatSystemPrompt`, calls Anthropic SDK `messages.create` with `stream: true` and full messages array, streams response via SSE (`data: {type:"content",text:"..."}\n\n`), handles 401/429 errors — in `app/api/chat/route.ts`
- [ ] T008 [P] Update `deleteProject` to cascade-delete chat messages — add `db.chatMessages.where("projectId").equals(id).delete()` before deleting the project record — in `lib/db/projects.ts`

**Checkpoint**: All shared infrastructure ready — types, database, CRUD, prompts, context builder, streaming client, API route, and cascade delete all in place. UI implementation can now begin.

---

## Phase 3: User Story 1 + User Story 2 — Chat Panel with AI Conversation (Priority: P1) 🎯 MVP

**Goal**: Users click a toggle button to open a slide-out chat panel, type messages, and receive streamed AI responses that reference phase-scoped project content. Chat history persists to IndexedDB.

**Independent Test**: Open a project with spec content, click the chat toggle, send a message asking about the spec, verify the AI streams a response referencing actual project content, close and reopen the panel to verify messages persist.

### Tests for User Story 1 + User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Write unit tests for context builder — spec phase returns only spec section contents, plan phase returns spec+plan, tasks phase returns all three, empty sections omitted or handled gracefully, each section labeled with its title — in `__tests__/unit/context-builder.test.ts`
- [ ] T010 [P] [US2] Write unit tests for ChatInput component — Enter sends message via onSend callback, button click sends message, send button disabled when `isStreaming` is true, send button disabled when input is empty, Shift+Enter inserts newline without sending — in `__tests__/unit/chat-input.test.tsx`
- [ ] T011 [P] [US2] Write unit tests for ChatPanel component — toggle open/close, renders user and assistant messages with visual distinction, close button closes panel, streaming state shows indicator, error message displayed, scroll to bottom on new messages — in `__tests__/unit/chat-panel.test.tsx`
- [ ] T012 [P] [US1] Write integration tests for chat message persistence — add messages via `addChatMessage` then query by projectId verifying chronological order and content, clear history by projectId verifies empty, delete project cascades to delete chat messages, messages for different projects are independent — in `__tests__/integration/chat-persistence.test.ts`

### Implementation for User Story 1 + User Story 2

- [ ] T013 [US1] Create chat Zustand store — state: `messages`, `isOpen`, `isStreaming`, `error`; actions: `togglePanel()`, `loadHistory(projectId)` reads from Dexie, `sendMessage(text, projectId, project, phaseType)` persists user message to Dexie → calls `streamChat` → accumulates response → persists assistant message on completion, `clearMessages()` resets local state; error handling with retry support — in `lib/stores/chat-store.ts`
- [ ] T014 [P] [US2] Create ChatMessage display component — renders user messages right-aligned with user styling, assistant messages left-aligned with `MarkdownRenderer` for content formatting, shows relative timestamp — in `components/chat/chat-message.tsx`
- [ ] T015 [P] [US2] Create ChatInput component — textarea with "Ask about your project..." placeholder, send button (lucide-react `Send` icon), disabled when `isStreaming` or input empty, Enter sends (calls `onSend`), Shift+Enter inserts newline, clears input after send — in `components/chat/chat-input.tsx`
- [ ] T016 [US2] Create ChatPanel slide-out container — fixed-position right panel (`w-96`), header with "AI Assistant" title and close button (lucide-react `X` icon), scrollable message list rendering ChatMessage components with `useRef` for scroll-to-bottom, ChatInput at bottom, error message display with retry button, API key missing notice when `/api/chat` returns 401, loading skeleton while history loads — in `components/chat/chat-panel.tsx`
- [ ] T017 [US1] Wire ChatPanel into project layout — add chat toggle button (lucide-react `MessageSquare` icon) in header bar next to ExportPanel, render ChatPanel conditionally based on chat store `isOpen`, derive current `phaseType` from URL pathname using segment mapping (`requirements`→`spec`, `plan`→`plan`, `tasks`→`tasks`, `traceability`→`tasks` as fallback since all phases are reviewed), call `loadHistory(projectId)` when panel opens — in `app/project/[id]/layout.tsx`

**Checkpoint**: Core chat flow functional — toggle panel open, send message, AI streams a contextual response, messages persist to IndexedDB, history loads on reopen. Editor remains visible alongside the panel.

---

## Phase 4: User Story 3 — Persistent Chat History (Priority: P2)

**Goal**: Users can clear their chat history to start a fresh conversation. (Note: persistence itself is already built into the store in Phase 3 — this phase adds the clear history affordance.)

**Independent Test**: Send messages, click "Clear History", confirm in dialog, verify all messages deleted, send a new message and verify AI has no prior context.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T018 [US3] Write unit tests for clear history flow — clear button visible in panel header, clicking shows confirmation dialog, confirming calls `clearHistory` and clears displayed messages, cancelling preserves messages — in `__tests__/unit/chat-panel.test.tsx`

### Implementation for User Story 3

- [ ] T019 [US3] Add clear history button with confirmation dialog to ChatPanel — "Clear" button (lucide-react `Trash2` icon) in panel header, onClick opens shadcn `Dialog` with confirmation message ("Clear all chat history? This cannot be undone."), confirm button calls `clearChatMessages(projectId)` from chat-messages CRUD and resets store messages, cancel dismisses dialog — in `components/chat/chat-panel.tsx`

**Checkpoint**: Chat history management complete — users can clear conversation and start fresh with confirmation safeguard.

---

## Phase 5: User Story 4 — AI-Suggested Edits with User Confirmation (Priority: P3)

**Goal**: The AI can suggest edits to specific sections using `[EDIT section-id phase-type]...[/EDIT]` markers. Users see the proposal with Apply/Dismiss buttons. Apply updates the section content via the project store; Dismiss marks the suggestion as dismissed.

**Independent Test**: Ask the AI to improve a section (e.g., "Make the problem statement more specific"), verify the AI response includes a suggested edit with Apply/Dismiss buttons, click Apply, verify the section content updates in the editor.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [P] [US4] Write unit tests for edit suggestion parser — parses single `[EDIT problem-statement spec]...[/EDIT]` marker into SuggestedEdit object, parses response with no markers returning null, extracts sectionId/phaseType/proposedContent correctly, handles malformed markers gracefully — in `__tests__/unit/edit-parser.test.ts`
- [ ] T021 [P] [US4] Write unit tests for SuggestedEdit component — renders target section title and content preview, Apply button calls `updateSection` with correct phaseType/sectionId/content, Dismiss button updates status to "dismissed" via Dexie, Apply button disabled for reviewed phases with explanatory message — in `__tests__/unit/suggested-edit.test.tsx`

### Implementation for User Story 4

- [ ] T022 [US4] Create edit suggestion parser and update system prompt — `parseEditSuggestion(text)` function extracts `[EDIT section-id phase-type]...[/EDIT]` markers via regex into SuggestedEdit object with status `"pending"`; update `getChatSystemPrompt` to include edit format instructions telling the AI to use these markers when suggesting changes and to maintain EARS format (WHEN/THEN/SHALL/WHERE/IF) when editing EARS Requirements sections — in `lib/chat/edit-parser.ts` and `lib/prompts/chat.ts`
- [ ] T023 [US4] Integrate edit parsing into chat store — after stream completion in `sendMessage`, call `parseEditSuggestion(fullResponse)`, if result is non-null attach as `suggestedEdit` on the assistant ChatMessage before persisting to Dexie — in `lib/stores/chat-store.ts`
- [ ] T024 [US4] Create SuggestedEdit component — card showing target section title (resolved from sectionId via section definitions), proposed content preview (first 3 lines with expand), "Apply" and "Dismiss" buttons; Apply calls `useProjectStore.getState().updateSection(phaseType, sectionId, proposedContent)` and updates `suggestedEdit.status` to `"applied"` via `updateChatMessage`; Dismiss updates to `"dismissed"`; Apply disabled if target phase status is `"reviewed"` with "Phase is locked" message — in `components/chat/suggested-edit.tsx`
- [ ] T025 [US4] Integrate SuggestedEdit rendering into ChatMessage component — when assistant message has `suggestedEdit`, render SuggestedEdit component below the message text content; show status badge (`"pending"` | `"applied"` | `"dismissed"`) — in `components/chat/chat-message.tsx`

**Checkpoint**: Full edit suggestion flow works — AI proposes edits, user reviews, Apply updates section content, Dismiss preserves original, locked phases blocked.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [ ] T026 Run all tests (`npm test`) and lint (`npm run lint`) to verify zero regressions
- [ ] T027 Run quickstart.md manual verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no setup needed
- **Foundational (Phase 2)**: No dependencies — can start immediately
- **US1+US2 (Phase 3)**: Depends on Phase 2 (types, Dexie table, CRUD, prompts, context builder, stream client, API route must all exist)
- **US3 (Phase 4)**: Depends on Phase 3 (panel must exist to add clear history button)
- **US4 (Phase 5)**: Depends on Phase 3 (chat store and ChatMessage component must exist to add edit suggestions)
- **Polish (Phase 6)**: Depends on all story phases being complete

### User Story Dependencies

- **US1+US2 (P1)**: Depends on Foundational (Phase 2) — creates the chat panel and wires up AI conversation
- **US3 (P2)**: Depends on US1+US2 — extends the panel with clear history
- **US4 (P3)**: Depends on US1+US2 — extends the store and message rendering with edit suggestions

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types and CRUD before store
- Store before components
- Components before layout wiring
- Core flow before extensions (clear history, edit suggestions)

### Parallel Opportunities

- T002, T003, T004, T005, T006, T008 can run in parallel (different files, all depend only on T001 for types)
- T009, T010, T011, T012 can run in parallel (different test files)
- T014, T015 can run in parallel (different component files)
- T020, T021 can run in parallel (different test files)
- US3 (Phase 4) and US4 (Phase 5) are independent of each other and could run in parallel after Phase 3

---

## Parallel Example: Phase 2 (Foundational)

```bash
# After T001 (types) is done, launch remaining foundational tasks together:
Task: "Add Dexie v4 migration in lib/db/database.ts"
Task: "Create chat messages CRUD in lib/db/chat-messages.ts"
Task: "Create chat system prompt in lib/prompts/chat.ts"
Task: "Create context builder in lib/chat/context-builder.ts"
Task: "Create streamChat() in lib/api/stream-client.ts"
Task: "Update deleteProject cascade in lib/db/projects.ts"
```

## Parallel Example: US1+US2 Tests

```bash
# Launch all test files for Phase 3 together:
Task: "Write context builder tests in __tests__/unit/context-builder.test.ts"
Task: "Write ChatInput tests in __tests__/unit/chat-input.test.tsx"
Task: "Write ChatPanel tests in __tests__/unit/chat-panel.test.tsx"
Task: "Write chat persistence integration tests in __tests__/integration/chat-persistence.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

1. Complete Phase 2: Foundational — types, database, CRUD, prompts, context builder, stream client, API route, cascade delete (8 tasks)
2. Complete Phase 3: US1+US2 — tests, store, components, layout wiring (9 tasks)
3. **STOP and VALIDATE**: Open panel, send message, verify streamed AI response references project content, close and reopen to verify persistence
4. Deploy/demo if ready — core AI chat is fully functional

### Incremental Delivery

1. Foundational → All shared infrastructure ready
2. Add US1+US2 → Test independently → Deploy (MVP — chat works, history persists)
3. Add US3 → Test independently → Deploy (clear history added)
4. Add US4 → Test independently → Deploy (suggested edits with apply/dismiss)
5. Polish → Final verification

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in current phase
- [Story] label maps task to specific user story for traceability
- US1 and US2 are combined into Phase 3 because the spec explicitly calls them "inseparable" and "co-priority"
- No new npm dependencies needed — Anthropic SDK, react-markdown, lucide-react, shadcn/ui Dialog are all already installed
- Dexie v4 migration adds `chatMessages` table — no changes to existing `projects` table or data
- `streamChat()` follows the same SSE pattern as `streamGenerate()` — separate function, same format
- Chat API route reuses the same Anthropic SDK streaming pattern as `/api/generate`
- Edit suggestion parsing uses `[EDIT section-id phase-type]...[/EDIT]` markers — no tool_use complexity
- Project store's `updateSection` already enforces phase gate discipline — suggested edits respect locked phases
