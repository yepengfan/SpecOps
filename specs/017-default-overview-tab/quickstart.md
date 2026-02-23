# Quickstart: Default Overview Tab

**Branch**: `017-default-overview-tab` | **Date**: 2026-02-23

## Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)

## Verification Scenarios

### Scenario 1: Project Card Opens Overview (FR-001)

1. Start the dev server: `npm run dev`
2. Ensure at least one project exists (create one if needed)
3. Navigate to the project list (home page)
4. Click on a project card
5. **Expected**: Browser navigates to `/project/{id}/overview`
6. **Verify**: The Overview tab is highlighted in the phase navigation
7. **Verify**: The overview dashboard content (phase cards, traceability) is displayed

### Scenario 2: Direct Phase URLs Still Work (FR-002)

1. Navigate directly to a phase URL (e.g., `/project/{id}/spec`)
2. **Expected**: The spec page loads normally
3. **Verify**: Bookmarked URLs and browser back/forward continue to function

## Automated Tests

```bash
# Run all tests
npm test

# Run with forced exit (recommended)
npx jest --forceExit

# Run specific test for project card
npx jest project-card --forceExit
```

All 313+ existing tests should pass with zero regressions.
