# Data Model: UX/UI Enhancements

**Branch**: `016-ux-ui-enhancements` | **Date**: 2026-02-23

## Overview

This feature introduces no new persisted data entities or schema changes. All enhancements are UI/presentation-layer components that read existing data from the Zustand store and IndexedDB. The entities below are transient UI constructs.

## Entities

### Toast Notification (transient, not persisted)

A brief auto-dismissing message overlay.

| Attribute     | Type                            | Description                                       |
|---------------|---------------------------------|---------------------------------------------------|
| message       | string                          | The notification text displayed to the user        |
| type          | "error" \| "success" \| "info"  | Determines visual styling (color, icon)            |
| action        | { label, onClick } \| null      | Optional action button (e.g., "Retry")             |
| duration      | number                          | Auto-dismiss duration in milliseconds (~4-5 sec)   |

**Lifecycle**: Created on event (error, success) → displayed → auto-dismissed after duration. No persistence.

### Phase Progress Card (derived, not persisted)

A dashboard summary card derived from existing project data.

| Attribute          | Type                                  | Source                             |
|--------------------|---------------------------------------|------------------------------------|
| phaseName          | "Spec" \| "Plan" \| "Tasks"          | Static mapping from phase type     |
| status             | "locked" \| "draft" \| "reviewed"    | `project.phases[phase].status`     |
| sectionsWithContent| number                                | Count of sections with non-empty content |
| totalSections      | number                                | Total sections in the phase        |
| evalPassing        | number \| null                        | Passing rule count from evaluation |
| evalTotal          | number \| null                        | Total rule count from evaluation   |

**Lifecycle**: Computed on each render from the Zustand store. No persistence beyond the existing project data.

### Workflow Indicator (derived, not persisted)

A visual stepper derived from existing phase statuses.

| Attribute   | Type                                   | Source                          |
|-------------|----------------------------------------|---------------------------------|
| phases      | Array of { name, status, isActive }    | Derived from project phase data |

**Lifecycle**: Computed on render. Disappears when spec phase has content.

### Traceability Coverage (derived, not persisted)

A summary metric derived from existing requirement and mapping data.

| Attribute         | Type   | Source                                    |
|-------------------|--------|-------------------------------------------|
| totalRequirements | number | Parsed from spec content (requirement IDs)|
| coveredCount      | number | Requirements with at least one mapping     |
| coveragePercent   | number | `(covered / total) * 100`, rounded         |

**Lifecycle**: Computed via `parseRequirementIds()` on each render of the overview page. No persistence beyond existing traceability mappings.

## Relationships

```
Project (existing)
├── phases[spec|plan|tasks] (existing)
│   ├── status → Phase Progress Card.status
│   ├── sections[] → Phase Progress Card.sectionsWithContent
│   └── content → Workflow Indicator (visibility condition)
├── evaluations[phase] (existing)
│   └── ruleResults[] → Phase Progress Card.evalPassing/evalTotal
├── traceabilityMappings[] (existing)
│   └── requirementId → Traceability Coverage.coveredCount
└── (no new fields added)
```

## Schema Changes

**None.** No IndexedDB schema migration required. No new Dexie tables or columns.
