# Data Model: AI Chat Assistant

**Feature**: 013-ai-chat-assistant
**Date**: 2026-02-23

## Entities

### ChatMessage (new)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | number (auto-increment) | Primary key | Dexie `++id` auto-increment |
| projectId | string (UUID) | Required, indexed | Foreign key to `projects.id` |
| role | `"user"` \| `"assistant"` | Required | Message sender |
| content | string | Required | Message text content |
| timestamp | number | Required | `Date.now()` at creation |
| suggestedEdit | object \| null | Optional | Only on assistant messages with edit proposals |

### SuggestedEdit (embedded in ChatMessage)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| sectionId | string | Required | Target section ID (e.g., `"problem-statement"`) |
| phaseType | `"spec"` \| `"plan"` \| `"tasks"` | Required | Phase containing the target section |
| proposedContent | string | Required | The new content for the section |
| status | `"pending"` \| `"applied"` \| `"dismissed"` | Required, default `"pending"` | Tracks whether user acted on the suggestion |

### Project (existing — no schema changes)

The `Project` interface is unchanged. Chat messages are stored in a separate table, not inside the project object.

### Dexie Schema (version 4)

```typescript
this.version(4).stores({
  projects: "id, updatedAt",
  chatMessages: "++id, projectId, timestamp"
});
```

- `++id`: Auto-incrementing primary key
- `projectId`: Indexed for querying all messages for a project
- `timestamp`: Indexed for ordering (though `sortBy("timestamp")` also works without an index, the index enables efficient range queries if needed)

## Validation Rules

### ChatMessage
- `projectId` MUST reference an existing project
- `role` MUST be `"user"` or `"assistant"`
- `content` MUST NOT be empty after trimming (user messages)
- `timestamp` MUST be a positive number
- `suggestedEdit` MUST only be present when `role === "assistant"`

### SuggestedEdit
- `sectionId` MUST match a valid section ID from the target phase's section definitions
- `phaseType` MUST be `"spec"`, `"plan"`, or `"tasks"`
- `proposedContent` MUST NOT be empty
- `status` transitions: `"pending"` → `"applied"` or `"pending"` → `"dismissed"` (one-way)

## State Transitions

### SuggestedEdit.status
```
pending → applied   (user clicks "Apply")
pending → dismissed (user clicks "Dismiss")
```
No reverse transitions — once acted upon, the decision is final within the conversation.

## Queries

| Operation | Query | Used by |
|-----------|-------|---------|
| Load history | `db.chatMessages.where("projectId").equals(id).sortBy("timestamp")` | `chat-store.loadHistory()` |
| Add message | `db.chatMessages.add(message)` | `chat-store.sendMessage()`, stream completion |
| Update edit status | `db.chatMessages.update(id, { suggestedEdit: {...} })` | Apply/Dismiss actions |
| Clear history | `db.chatMessages.where("projectId").equals(id).delete()` | `chat-store.clearHistory()` |
| Delete with project | `db.chatMessages.where("projectId").equals(id).delete()` | `deleteProject()` |

## Schema Impact

**Dexie migration required**: Version 3 → Version 4. Adds `chatMessages` table. No changes to existing `projects` table. No data migration needed for existing data — the new table starts empty.
