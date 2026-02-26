# 023: Research

## Current State

- `project-list.tsx` uses `sm:grid-cols-2 lg:grid-cols-3` for the grid layout.
- All filtered projects are rendered at once with no pagination.
- Skeleton loading shows 3 placeholder cards.

## Decision

Simple client-side "View All" toggle (not paginated loading) since all project data is already loaded from IndexedDB. No performance concern with rendering all projects after click since the dataset is small (local browser storage).
