# Research: Rename Project

**Feature**: 012-rename-project
**Date**: 2026-02-23

## R1: Inline Edit Pattern for Headings

**Decision**: Use a controlled `<input>` that replaces the `<h1>` text when in edit mode, with local component state managing the toggle.

**Rationale**: This is a well-established UI pattern. The component manages `isEditing` state locally, renders an `<input>` when editing and a clickable heading when not. No external library needed — native `<input>` with `onBlur`, `onKeyDown` handlers covers all requirements (Enter to save, Escape to cancel, blur to save).

**Alternatives considered**:
- `contentEditable` on the `<h1>`: Rejected — harder to control, inconsistent behavior across browsers, poor accessibility semantics.
- Modal/dialog for rename: Rejected — heavier UX for a simple name change, violates constitution principle VI (simplicity).
- Separate edit icon button: Rejected — adds visual clutter; clicking the name directly is more discoverable and simpler.

## R2: Save Strategy

**Decision**: Use `immediateSave` (not debounced) for rename operations.

**Rationale**: Renaming is a discrete, user-initiated action (confirmed by Enter or blur), not continuous input like typing in a section editor. The existing `immediateSave` function in the project store handles this correctly — it cancels any pending debounced saves and writes immediately.

**Alternatives considered**:
- Debounced save (like `updateSection`): Rejected — rename is confirmed by an explicit action, debouncing would add unnecessary delay and risk the user navigating away before the save fires.

## R3: Accessibility for Inline Edit

**Decision**: The heading in display mode gets `role="button"`, `tabIndex={0}`, and handles Enter/Space keydown to enter edit mode. The input in edit mode gets an `aria-label` of "Project name".

**Rationale**: WCAG 2.1 AA requires keyboard accessibility (constitution constraint). The heading must be focusable and activatable via keyboard. The input is natively keyboard accessible.

**Alternatives considered**:
- No special ARIA: Rejected — the clickable heading would not be discoverable by keyboard/screen reader users.
