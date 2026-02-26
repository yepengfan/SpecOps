# 023: Project List — 2 Columns + Initial 4 with View All

## Overview

Update the project list to use a 2-column max grid layout and initially display only 4 projects, with a "View All" button to reveal the rest.

## User Stories

- **US-1**: As a user, I want the project list to display in a clean 2-column layout so it's easier to scan.
- **US-2**: As a user, I want to see only the first 4 projects initially so the page feels uncluttered.
- **US-3**: As a user, I want a "View All" button to reveal all remaining projects in one click.

## Requirements

- **REQ-1**: Grid layout uses max 2 columns (`sm:grid-cols-2`), removing the `lg:grid-cols-3` breakpoint.
- **REQ-2**: Initially display at most 4 projects (PAGE_SIZE = 4).
- **REQ-3**: A "View All (N projects)" button appears below the grid when more than 4 projects exist.
- **REQ-4**: Clicking "View All" reveals all projects and hides the button.
- **REQ-5**: When 4 or fewer projects exist, no "View All" button is shown.
- **REQ-6**: Skeleton loading state uses 4 skeleton cards and 2-column grid.

## Success Criteria

- Grid never exceeds 2 columns on any viewport.
- Only 4 projects shown by default; "View All" reveals the rest.
- All existing tests continue to pass.
- New tests cover the pagination behavior.
