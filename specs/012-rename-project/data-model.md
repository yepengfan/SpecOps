# Data Model: Rename Project

**Feature**: 012-rename-project
**Date**: 2026-02-23

## Entities

### Project (existing — no schema changes)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | string (UUID) | Primary key | Unchanged |
| name | string | Required, non-empty after trim | **Updated by this feature** |
| description | string | Optional | Unchanged |
| createdAt | number (timestamp) | Immutable | Unchanged |
| updatedAt | number (timestamp) | Auto-updated on save | Updated when name changes |
| phases | object | Required | Unchanged |
| traceabilityMappings | array | Required | Unchanged |
| evaluations | object | Optional | Unchanged |

### Validation Rules for `name`

- MUST NOT be empty after trimming whitespace
- MUST NOT be whitespace-only
- No maximum length enforced (display truncation handled by UI)
- No uniqueness constraint (multiple projects may share the same name)

### State Transitions

None. The `name` field is a simple mutable attribute. Changing it does not trigger any phase status changes or downstream cascades.

## Schema Impact

**No Dexie schema migration required.** The `name` field already exists on the `Project` interface. The `updateProject` function in `lib/db/projects.ts` already writes the full project object to IndexedDB via `db.projects.put()`. No new indexes are needed (name is not queried directly).
