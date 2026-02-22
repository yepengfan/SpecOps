# Quickstart: AI Chat Assistant

**Feature**: 013-ai-chat-assistant
**Date**: 2026-02-23

## Testing Strategy

### Unit Tests

#### `__tests__/unit/context-builder.test.ts`
1. **Spec phase context**: Returns only spec section contents when phase is "spec"
2. **Plan phase context**: Returns spec + plan section contents when phase is "plan"
3. **Tasks phase context**: Returns spec + plan + tasks section contents when phase is "tasks"
4. **Empty sections**: Handles sections with empty content gracefully (omits or includes with placeholder)
5. **Section formatting**: Each section is labeled with its title for AI readability

#### `__tests__/unit/chat-panel.test.tsx`
6. **Toggle open/close**: Clicking toggle button opens panel; clicking again closes it
7. **Displays messages**: Renders user and assistant messages with visual distinction
8. **Scroll to bottom**: Panel scrolls to most recent message on open and after new messages
9. **Clear history**: Clear button shows confirmation dialog; confirming deletes all messages
10. **Close button**: Panel has a close button that closes the panel
11. **API key missing**: Shows informational message when API key is not configured

#### `__tests__/unit/chat-input.test.tsx`
12. **Send on Enter**: Typing text + Enter calls sendMessage
13. **Send on button click**: Clicking send button calls sendMessage
14. **Disabled during streaming**: Send button is disabled while AI is generating
15. **Empty message blocked**: Send button is disabled when input is empty
16. **Shift+Enter for newline**: Shift+Enter inserts newline instead of sending

#### `__tests__/unit/suggested-edit.test.tsx`
17. **Renders proposed edit**: Shows target section name, proposed content preview
18. **Apply calls updateSection**: Clicking "Apply" calls store's updateSection with correct params
19. **Dismiss marks dismissed**: Clicking "Dismiss" updates status to "dismissed"
20. **Locked phase blocked**: Apply button disabled for reviewed/locked phases with explanation

#### `__tests__/unit/chat-message.test.tsx`
21. **User message styling**: User messages render with right-aligned bubble
22. **Assistant message styling**: Assistant messages render with left-aligned bubble and markdown
23. **Suggested edit embedded**: Assistant message with suggestedEdit renders SuggestedEdit component
24. **Timestamp display**: Messages show relative or absolute timestamp

### Integration Tests

#### `__tests__/integration/chat-persistence.test.ts`
25. **Messages persist**: Add messages via chat-messages CRUD → query by projectId → verify order and content
26. **Clear history**: Add messages → clear by projectId → verify empty
27. **Delete with project**: Add messages → delete project → verify chat messages also deleted
28. **Multiple projects**: Messages for different projects are independent
29. **SuggestedEdit status update**: Add message with pending edit → update to applied → verify persisted

### Manual Verification

1. Open a project with generated spec content
2. Click the chat toggle button in the project header
3. Verify panel slides open on the right, editor remains visible
4. Type a question about the spec content (e.g., "What requirements might be missing?")
5. Press Enter — verify message appears in chat, AI response streams in real time
6. Verify AI response references actual project content
7. Send a follow-up message — verify AI maintains conversation context
8. Close the panel, navigate away, return to the project
9. Open chat panel — verify previous messages are still displayed
10. Switch to plan phase (if unlocked) — send a message
11. Verify AI now references both spec and plan content
12. Ask AI to improve a section (e.g., "Make the problem statement more specific")
13. Verify AI presents a suggested edit with Apply/Dismiss buttons
14. Click Apply — verify section content updates in the editor
15. Click Clear History — verify confirmation dialog appears
16. Confirm — verify all messages are deleted
17. Delete the project — verify chat history is cleaned up (check IndexedDB in DevTools)
