# Quickstart: Rename Project

**Feature**: 012-rename-project
**Date**: 2026-02-23

## Testing Strategy

### Unit Tests (`__tests__/unit/editable-project-name.test.tsx`)

1. **Display mode**: Renders project name as heading text, clickable
2. **Enter edit mode**: Click on name → shows input pre-filled with current name
3. **Save on Enter**: Type new name + press Enter → calls `renameProject`, exits edit mode
4. **Save on blur**: Type new name + blur → calls `renameProject`, exits edit mode
5. **Cancel on Escape**: Press Escape → restores original name, exits edit mode
6. **Reject empty**: Clear input + Enter → does not call `renameProject`, restores original name
7. **Reject whitespace-only**: Enter spaces + Enter → does not call `renameProject`, restores original name
8. **Skip unchanged**: Enter same name + Enter → does not call `renameProject`, exits edit mode
9. **Keyboard accessible**: Tab to heading, press Enter → enters edit mode
10. **Select all on focus**: When entering edit mode, input text is selected

### Integration Tests (`__tests__/integration/project-crud.test.ts`)

11. **Rename persists**: Create project → rename via store action → reload from DB → verify new name
12. **updatedAt advances on rename**: Verify timestamp changes after rename

### Manual Verification

1. Create a project, navigate to it
2. Click the project name in the header
3. Verify the name becomes editable with text selected
4. Type a new name, press Enter
5. Verify the header shows the new name
6. Navigate back to project list
7. Verify the project card shows the updated name
8. Navigate back to the project, verify name persists
9. Click name, press Escape — verify original name restored
10. Click name, clear field, press Enter — verify original name restored
11. Tab to the project name, press Enter — verify edit mode activates
