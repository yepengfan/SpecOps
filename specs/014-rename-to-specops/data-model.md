# Data Model: Rename to SpecOps

**Branch**: `014-rename-to-specops` | **Date**: 2026-02-23

## Summary

No new entities or schema changes are introduced by this feature. The IndexedDB database name is changed from `"sdd-cockpit"` to `"spec-ops"` to align with the project rename. Existing local data is not preserved (acceptable — see [research.md](./research.md) for rationale). The TypeScript class is renamed from `SddCockpitDatabase` to `SpecOpsDatabase`.

## Existing Entities (Unchanged)

| Entity | Table | Key | Description |
|--------|-------|-----|-------------|
| Project | `projects` | `id` (UUID string) | All project data including phases, sections, evaluations, traceability |
| ChatMessage | `chatMessages` | `++id` (auto-increment number) | Chat conversation history per project |

## Schema (Unchanged)

```
Database: spec-ops (renamed from sdd-cockpit)

Version 4 (current):
  projects:     id, updatedAt
  chatMessages: ++id, projectId, timestamp
```

No migrations needed. No version bump needed. Existing data under the old "sdd-cockpit" database name becomes inaccessible.
