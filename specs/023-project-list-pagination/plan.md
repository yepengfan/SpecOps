# 023: Implementation Plan

## Technical Context

The project list component (`components/ui/project-list.tsx`) currently renders all filtered projects in a 3-column responsive grid. This plan modifies it to cap at 2 columns and paginate with an initial limit of 4.

## Project Structure Impact

| File | Action |
|------|--------|
| `components/ui/project-list.tsx` | Modify — grid, state, View All button |
| `__tests__/unit/project-list.test.tsx` | Modify — add pagination tests |

## Approach

1. Add `showAll` boolean state and `PAGE_SIZE` constant.
2. Derive `visible` array by slicing `filtered` when not showing all.
3. Remove `lg:grid-cols-3` from skeleton and main grids.
4. Update skeleton count from 3 to 4.
5. Render "View All" button conditionally after grid.

## Complexity

Low — single component change, no data model or API impact.

## Constitution Compliance

- TDD: tests written before implementation.
- No new dependencies.
- No data model changes.
