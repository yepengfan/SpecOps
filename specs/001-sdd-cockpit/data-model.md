# Data Model: SpecOps

**Branch**: `001-sdd-cockpit` | **Date**: 2026-02-22

## Entities

### Project

The top-level entity representing one SDD workflow.

| Field | Type | Constraints | Source |
|-------|------|-------------|--------|
| id | string (UUID v4) | Primary key, generated via `crypto.randomUUID()` | Req 1 |
| name | string | Non-empty, max 100 chars, trimmed | Req 1 |
| description | string | Natural language input, min 10 chars for generation | Req 3 |
| createdAt | number (timestamp) | Set on creation, immutable | Req 1 |
| updatedAt | number (timestamp) | Updated on any save, indexed for sorting | Req 2 |
| phases | Record<PhaseType, Phase> | Three phases: requirements, design, tasks | Req 1, 7 |
| traceabilityMappings | TraceabilityMapping[] | Requirement → design/task mappings. Defaults to `[]` for existing projects (no migration needed). | Req 10 |

**Indexes**: `id` (primary), `updatedAt` (for sort by most recent)

### Phase

Represents one phase of the SDD workflow. Embedded within a Project.

| Field | Type | Constraints | Source |
|-------|------|-------------|--------|
| type | PhaseType | "requirements" \| "design" \| "tasks" | Req 7 |
| status | PhaseStatus | "locked" \| "draft" \| "reviewed" | Req 7 |
| sections | Section[] | Fixed set of sections per phase type | Req 3, 4, 5 |

### Section

One section within a phase. Content is editable markdown text.

| Field | Type | Constraints | Source |
|-------|------|-------------|--------|
| id | string | Unique within the phase (e.g., "problem-statement") | Req 6 |
| title | string | Display name (e.g., "Problem Statement") | Req 6 |
| content | string | Markdown content, auto-saved on edit | Req 6 |

### TraceabilityMapping

Represents a link between an individual requirement and a design section or task. Embedded within a Project as an array. Mappings are always from a requirement to a design section or task (one direction).

Individual requirements are identified by a slug derived from their heading in the EARS-format content (e.g., `"req-1"`, `"req-3"`). The AI parses these from the `ears-requirements` section content during generation; manual mappings use the same identifiers. The `requirementLabel` provides the human-readable display name.

| Field | Type | Constraints | Source |
|-------|------|-------------|--------|
| id | string (UUID v4) | Primary key, generated via `crypto.randomUUID()` | Req 10 |
| requirementId | string | Slug of the requirement (e.g., `"req-1"`, `"req-10"`) | Req 10 |
| requirementLabel | string | Human-readable label (e.g., "Req 1: Create New Project") | Req 10 |
| targetType | "design" \| "task" | Which phase the target belongs to | Req 10 |
| targetId | string | Section id or task identifier in the target phase (e.g., `"architecture"`, `"task-list"`) | Req 10 |
| targetLabel | string | Human-readable label (e.g., "Architecture", "Task List") | Req 10 |
| origin | "ai" \| "manual" | Whether this mapping was AI-generated or manually added | Req 10 |
| createdAt | number (timestamp) | Set on creation | Req 10 |

**Design note**: `updatedAt` is intentionally omitted. Mappings are toggled (add/remove), not edited in place — there is no mutation path that would need a last-modified timestamp. If in-place editing is added in the future, `updatedAt` can be introduced then.

### API Key (server-side only)

The API key is stored in `.env.local` as `ANTHROPIC_API_KEY` and is only accessed by Next.js API routes. It is NOT stored in IndexedDB or any client-side storage. See `contracts/llm-api.md` for the API route contract.

## Enums / Constants

### PhaseType
```
"requirements" | "design" | "tasks"
```

### PhaseStatus
```
"locked" | "draft" | "reviewed"
```

### Phase Section Templates

Fixed sections per phase type (from README):

**Spec phase**:
- `problem-statement` — "Problem Statement"
- `ears-requirements` — "EARS-format Requirements"
- `non-functional-requirements` — "Non-Functional Requirements"

**Plan phase**:
- `architecture` — "Architecture"
- `api-contracts` — "API Contracts"
- `data-model` — "Data Model"
- `tech-decisions` — "Tech Decisions"
- `security-edge-cases` — "Security & Edge Cases"

**Tasks phase**:
- `task-list` — "Task List"
- `dependencies` — "Dependencies"
- `file-mapping` — "File Mapping"
- `test-expectations` — "Test Expectations"

## Relationships

```
Project (1) ──── (3) Phase (requirements, design, tasks)
Phase   (1) ──── (N) Section (fixed set per phase type)
Project (1) ──── (N) TraceabilityMapping (requirement → design/task links)
```

## State Transitions

### PhaseStatus State Machine

```
         ┌──────────┐
         │  locked   │ (initial for design, tasks)
         └────┬─────┘
              │ unlock (previous phase reviewed)
              ▼
         ┌──────────┐
    ┌───>│  draft    │ (initial for requirements)
    │    └────┬─────┘
    │         │ "Mark as Reviewed"
    │         ▼
    │    ┌──────────┐
    └────│ reviewed  │
  edit   └──────────┘
(resets to draft, cascades downstream)
```

**Transition rules** (from Req 7):
- `locked → draft`: Only when the previous phase is marked "reviewed"
- `draft → reviewed`: Only when all sections have content (non-empty)
- `reviewed → draft`: When user edits an approved phase (with confirmation). All downstream phases also reset to "draft" (NOT "locked"). Content is preserved.

### Derived Display Status: "Complete"

A project displays as "Complete" when ALL three phases have status "reviewed". This is NOT a stored value — it is derived:

```
displayPhase = (all phases reviewed) ? "Complete" : currentActivePhaseType
```

For "Complete" projects, clicking navigates to the Tasks phase (Req 2).

## Validation Rules

| Rule | Entity | Source |
|------|--------|--------|
| Name non-empty, max 100 chars | Project | Req 1 |
| Name trimmed of whitespace | Project | Req 1 |
| ID is UUID v4 | Project | Req 1 |
| Description min 10 chars (for generation) | Project | Req 3 |
| Sections must all have content before phase approval | Phase | Req 7 |
| API key server-side only (.env.local) | Server config | Req 9 |

## IndexedDB Schema (Dexie.js)

```
Database: spec-ops

Table: projects
  Primary key: id
  Indexes: updatedAt
```

**Note**: Phases and sections are embedded within the Project record (not separate tables). This simplifies CRUD — a single `put()` persists the entire project state. Dexie's `useLiveQuery()` React hook tracks changes reactively. API key is stored server-side in `.env.local`, not in IndexedDB.
