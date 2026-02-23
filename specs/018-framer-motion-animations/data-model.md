# Data Model: Framer Motion Animations

**Branch**: `018-framer-motion-animations` | **Date**: 2026-02-23

## No Schema Changes

This feature is a purely visual enhancement. No new entities, fields, or relationships are introduced. The existing IndexedDB schema (Dexie.js) is unaffected.

### Rationale

- Animations are ephemeral UI state managed by Framer Motion — no persistence required
- Reduced motion preference is read from the OS/browser media query at runtime — no stored setting
- Animation variants are static configuration constants — no database involvement
