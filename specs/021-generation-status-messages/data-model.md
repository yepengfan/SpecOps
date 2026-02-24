# Data Model: Animated Status Messages During Generation

**Branch**: `021-generation-status-messages` | **Date**: 2026-02-24

## No Schema Changes

This feature is a purely visual enhancement. No new entities, fields, or relationships are introduced. The existing IndexedDB schema (Dexie.js) is unaffected.

### Rationale

- Status messages are ephemeral UI state managed by React `useState` — no persistence required
- Message rotation state (current index) resets each time generation starts — no need to remember position
- Reduced motion preference is read from the OS/browser media query at runtime — no stored setting
- Message sets are static constants defined in the component — no database involvement
