# Contract: IndexedDB Schema

**Date**: 2026-02-22

## Database

```
Name: sdd-cockpit
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
```

**Dexie schema**: `"id, updatedAt"`

### appConfig

```typescript
interface AppConfig {
  id: string;                          // Always "app-config"
  apiKey: string | null;               // Raw API key
  apiKeyValid: boolean;                // Cached validation
  apiKeyLastFour: string | null;       // Last 4 chars for display
}
```

**Dexie schema**: `"id"`

## Operations

| Operation | Method | Store | Source |
|-----------|--------|-------|--------|
| Create project | `projects.add(project)` | projects | Req 1 |
| List projects (sorted) | `projects.orderBy('updatedAt').reverse().toArray()` | projects | Req 2 |
| Get project | `projects.get(id)` | projects | Req 2 |
| Update project | `projects.put(project)` | projects | Req 6, 7 |
| Delete project | `projects.delete(id)` | projects | Req 2 |
| Get config | `appConfig.get('app-config')` | appConfig | Req 9 |
| Save config | `appConfig.put(config)` | appConfig | Req 9 |

## Error Handling

| Error | Dexie Type | App Response |
|-------|-----------|--------------|
| Storage full | `Dexie.QuotaExceededError` | "Storage is full. Please delete unused projects." |
| DB corrupted | `Dexie.OpenFailedError` | "Unable to load projects. Storage may be corrupted." + offer to clear |
