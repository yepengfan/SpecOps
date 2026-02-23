# Data Model: UX/UI Enhancements v2

**Branch**: `020-ux-ui-enhancements-v2` | **Date**: 2026-02-24

## Entity Changes

### Project (extended)

**Current interface** (`lib/types/index.ts`):

```typescript
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  phases: { spec: Phase; plan: Phase; tasks: Phase };
  traceabilityMappings: TraceabilityMapping[];
  evaluations?: { spec?: PhaseEvaluation; plan?: PhaseEvaluation; tasks?: PhaseEvaluation };
}
```

**New field**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `archivedAt` | `number \| undefined` | `undefined` | Unix timestamp (ms) when project was archived. `undefined` = active project. |

**Updated interface**:

```typescript
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;  // NEW — undefined = active, timestamp = archived
  phases: { spec: Phase; plan: Phase; tasks: Phase };
  traceabilityMappings: TraceabilityMapping[];
  evaluations?: { spec?: PhaseEvaluation; plan?: PhaseEvaluation; tasks?: PhaseEvaluation };
}
```

**Validation rules**:
- `archivedAt` must be a positive integer (Unix timestamp in milliseconds) or `undefined`
- Archiving sets `archivedAt = Date.now()` and also updates `updatedAt`
- Unarchiving sets `archivedAt = undefined` and also updates `updatedAt`
- Archiving does not affect any project content (phases, traceability, evaluations)

### No New Entities

Toast notifications are purely transient UI state (Sonner handles lifecycle). Chat panel width is a scalar in localStorage. Search/sort state is ephemeral React state. No new database entities required.

## Database Migration

### Dexie.js Version 5

**Current** (version 4):
```typescript
this.version(4).stores({
  projects: "id, updatedAt",
  chatMessages: "++id, projectId, timestamp",
});
```

**New** (version 5):
```typescript
this.version(5).stores({
  projects: "id, updatedAt",
  chatMessages: "++id, projectId, timestamp",
});
// No index change needed — archivedAt filtering done in-memory via .filter()
// No upgrade callback needed — existing projects default to undefined (active)
```

**Rationale for no index on `archivedAt`**: The project list is small (<50 expected) and always loaded fully into memory. Adding an index would add write overhead on every update for negligible query benefit. Filtering active vs. archived is done in the component layer after `listProjects()` returns all projects.

## Storage: localStorage Keys

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `specops-chat-panel-width` | `number` (string-serialized) | `384` | Chat panel width in pixels |

**Lifecycle**: Written on drag-end of chat panel resize. Read on chat panel mount. Never expires. Cleared if user resets browser storage.

## State Transitions

### Project Archive Lifecycle

```
Active (archivedAt = undefined)
  │
  ├── Archive action → Archived (archivedAt = Date.now())
  │                      │
  │                      ├── Unarchive action → Active (archivedAt = undefined)
  │                      │
  │                      └── Delete action → Permanently removed
  │
  └── Delete action → Permanently removed
```

Both Archive and Delete are available in all states. Archive is reversible; Delete is permanent (with confirmation dialog).
