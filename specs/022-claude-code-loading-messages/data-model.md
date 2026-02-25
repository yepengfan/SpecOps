# Data Model: Claude Code-Style Loading Messages

**Branch**: `022-claude-code-loading-messages` | **Date**: 2026-02-25

## No Schema Changes

This feature modifies only the static message content and selection logic within the `GenerationStatus` component. No new entities, fields, or relationships are introduced. The existing IndexedDB schema (Dexie.js) is unaffected.

### Rationale

- Status messages are static constants in the component source — no persistence
- Message selection state (current index) is ephemeral React `useState` — no persistence
- The only change is from `Record<Phase, string[]>` to `string[]` and from sequential to random selection — both are in-memory only
