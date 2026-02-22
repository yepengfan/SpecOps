# Data Model: Rename to SpecOps

**Branch**: `014-rename-to-specops` | **Date**: 2026-02-23

## Summary

No new entities or schema changes are introduced by this feature. The IndexedDB database name remains `"sdd-cockpit"` internally for backwards compatibility (see [research.md](./research.md) for rationale). The only data-related change is renaming the TypeScript class from `SddCockpitDatabase` to `SpecOpsDatabase`.

## Existing Entities (Unchanged)

| Entity | Table | Key | Description |
|--------|-------|-----|-------------|
| Project | `projects` | `id` (UUID string) | All project data including phases, sections, evaluations, traceability |
| ChatMessage | `chatMessages` | `++id` (auto-increment number) | Chat conversation history per project |

## Schema (Unchanged)

```
Database: sdd-cockpit (internal name preserved for data continuity)

Version 4 (current):
  projects:     id, updatedAt
  chatMessages: ++id, projectId, timestamp
```

No migrations needed. No version bump needed.
