# Contract: IndexedDB Schema

**Date**: 2026-02-22

## Database

```
Name: spec-ops (renamed from sdd-cockpit in feature 014)
Version: 1
```

## Stores

### projects

```typescript
interface Project {
  id: string;                          // UUID v4, primary key
  name: string;                        // 1-100 chars, trimmed
  description: string;                 // Natural language input
  createdAt: number;                   // Unix timestamp (ms)
  updatedAt: number;                   // Unix timestamp (ms), indexed
  phases: {
    requirements: Phase;
    design: Phase;
    tasks: Phase;
  };
  traceabilityMappings: TraceabilityMapping[]; // Defaults to [] for existing projects
}

interface Phase {
  type: "requirements" | "design" | "tasks";
  status: "locked" | "draft" | "reviewed";
  sections: Section[];
}

interface Section {
  id: string;                          // e.g., "problem-statement"
  title: string;                       // e.g., "Problem Statement"
  content: string;                     // Markdown content
}

interface TraceabilityMapping {
  id: string;                          // UUID v4
  requirementId: string;               // Slug, e.g., "fr-001", "fr-010"
  requirementLabel: string;            // e.g., "FR-001: Create New Project"
  targetType: "design" | "task";       // Which phase the target belongs to
  targetId: string;                    // Section id, e.g., "architecture"
  targetLabel: string;                 // e.g., "Architecture"
  origin: "ai" | "manual";            // AI-generated or manually added
  createdAt: number;                   // Unix timestamp (ms)
  // No updatedAt — mappings are toggled (add/remove), not edited in place
}
```

**Migration**: The `traceabilityMappings` field is embedded (not indexed), so no Dexie version bump is required. Existing projects without this field should be treated as having an empty array. Code should default to `project.traceabilityMappings ?? []`.

**Dexie schema**: `"id, updatedAt"`

## Operations

| Operation | Method | Store | Source |
|-----------|--------|-------|--------|
| Create project | `projects.add(project)` | projects | Req 1 |
| List projects (sorted) | `projects.orderBy('updatedAt').reverse().toArray()` | projects | Req 2 |
| Get project | `projects.get(id)` | projects | Req 2 |
| Update project | `projects.put(project)` | projects | Req 6, 7 |
| Delete project | `projects.delete(id)` | projects | Req 2 |

**Note**: API key is stored server-side in `.env.local` (Req 9), not in IndexedDB.

## Error Handling

| Error | Dexie Type | App Response |
|-------|-----------|--------------|
| Storage full | `Dexie.QuotaExceededError` | "Storage is full. Please delete unused projects." |
| DB corrupted | `Dexie.OpenFailedError` | "Unable to load projects. Storage may be corrupted." + offer to clear |
