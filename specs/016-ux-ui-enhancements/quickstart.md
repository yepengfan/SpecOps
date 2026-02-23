# Quickstart: UX/UI Enhancements

**Branch**: `016-ux-ui-enhancements` | **Date**: 2026-02-23

## Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- `.env.local` configured with `ANTHROPIC_API_KEY` (for AI generation error testing)

## Verification Scenarios

### Scenario 1: Toast Notifications (US1 — FR-001, FR-019, FR-020)

1. Start the dev server: `npm run dev`
2. Create a new project and enter a description
3. Remove or invalidate the API key in `.env.local`
4. Click "Generate" on the Spec phase
5. **Expected**: A toast notification slides in from the bottom with the error message, auto-dismisses after ~5 seconds
6. **Verify**: No inline red error banner appears on the page
7. **Verify**: The amber "Requirements must be reviewed" warning (if applicable) remains as an inline message
8. Restore the API key, generate spec content, run "Deep Analysis" with an invalid state
9. **Expected**: Error toast includes a "Retry" action button

### Scenario 2: Button Press Feedback (US1 — FR-002)

1. Click any button in the application (Generate, Evaluate, Approve, etc.)
2. **Expected**: The button visually scales down slightly on press, providing tactile feedback
3. **Verify**: The effect is visible on all button variants (primary, outline, ghost)

### Scenario 3: Evaluation Auto-Expand (US2 — FR-003)

1. Create a project and generate spec content
2. Click "Evaluate" on the spec phase
3. **Expected**: The evaluation results panel automatically expands after evaluation completes
4. Navigate away (e.g., to the project list) and return to the spec phase
5. **Expected**: The evaluation panel is still expanded (results loaded from DB)

### Scenario 4: Regeneration Confirmation (US2 — FR-004, FR-005)

1. On a phase with generated content, click "Regenerate" on a section that has content
2. **Expected**: A confirmation dialog appears: "Regenerate this section? Current content will be replaced."
3. Click "Cancel" — content is unchanged
4. Click "Regenerate" again, then "Continue" — regeneration proceeds
5. Find or create an empty section, click "Regenerate"
6. **Expected**: Regeneration starts immediately without a dialog

### Scenario 5: Mobile Chat Panel (US3 — FR-006, FR-007)

1. Open browser DevTools and set viewport to a mobile width (< 768px)
2. Click the chat toggle button
3. **Expected**: Chat panel fills full screen width with a semi-transparent backdrop behind it
4. Click the backdrop
5. **Expected**: Chat panel closes
6. Resize viewport to desktop width (> 768px)
7. **Expected**: Chat panel renders as a fixed-width sidebar without backdrop

### Scenario 6: Collapsible Sections (US3 — FR-008, FR-009, FR-010)

1. Navigate to any phase page with content (e.g., Spec)
2. Click a section header (e.g., "Functional Requirements")
3. **Expected**: Section collapses with a chevron rotation; content hides
4. Click again — section expands
5. Click "Collapse All" — all sections collapse
6. Click "Expand All" — all sections expand
7. Collapse some sections, then click "Generate" to regenerate content
8. **Expected**: After generation, all sections reset to expanded

### Scenario 7: Dark Mode Toggle (US4 — FR-011, FR-012, FR-013)

1. Look for the theme toggle button in the navigation bar (sun/moon icon)
2. Click it
3. **Expected**: The entire application switches between light and dark themes
4. Reload the page
5. **Expected**: The chosen theme persists
6. Set your OS to dark mode, clear localStorage, reload
7. **Expected**: Application loads in dark mode (respects system preference)

### Scenario 8: Onboarding Guidance (US4 — FR-014, FR-015)

1. Create a new project
2. Navigate to the Spec phase
3. **Expected**: A workflow indicator shows three phases (Spec → Plan → Tasks) with Spec highlighted
4. **Expected**: Guidance text appears: "Start by describing your project above, then click Generate to create a specification."
5. Generate spec content
6. **Expected**: Onboarding elements disappear

### Scenario 9: Overview Dashboard (US5 — FR-016, FR-017, FR-018)

1. Navigate to a project's "Overview" tab
2. **Expected**: Three phase progress cards show status badges and section counts
3. Run evaluation on the Spec phase, return to Overview
4. **Expected**: Spec card shows evaluation pass/total count
5. Generate traceability mappings
6. **Expected**: Traceability coverage bar shows percentage and count
7. Click "Open" on a non-locked phase card
8. **Expected**: Navigates to that phase's page

## Automated Tests

```bash
# Run all tests
npm test

# Run with forced exit (recommended)
npx jest --forceExit

# Run specific test suites relevant to this feature
npx jest phase-nav --forceExit
```

All 313 existing tests should pass with zero regressions.
