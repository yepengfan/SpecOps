# Quickstart: Align Requirement Identifiers

**Branch**: `015-align-requirement-ids` | **Date**: 2026-02-23

## Overview

This feature aligns AI-generated requirement identifiers from `REQ-1` / `NFR-1` format to `FR-001` / `NFR-001` format. The change affects prompt templates, evaluation rules, traceability parsing, and UI guidance — all within existing source files. No new files or dependencies are introduced.

## Prerequisites

- Node.js 18+
- Existing development environment set up per the main README

## What Changes

### Prompt Templates (4 files)
- `lib/prompts/spec.ts` — EARS requirement format instructions and examples
- `lib/prompts/plan.ts` — Traceability comment format and requirement ID derivation instructions
- `lib/prompts/tasks.ts` — Requirement reference format and traceability comment
- `lib/prompts/traceability.ts` — Requirement ID format in reanalyze prompt

### Evaluation Rules (1 file)
- `lib/eval/rules.ts` — Regex patterns for identifying FR/NFR lines, EARS keyword check, error messages

### Traceability Logic (1 file)
- `lib/db/traceability.ts` — `parseRequirementIds()` regex patterns, ID/label construction, heading fallback

### UI Components (2 files)
- `components/traceability/matrix-table.tsx` — Empty-state guidance message
- `components/traceability/cell-detail.tsx` — Requirement content extraction regex

### Tests (updated to match new format)
- `__tests__/unit/eval-rules.test.ts` — Update test fixtures from REQ-N to FR-NNN
- `__tests__/unit/spec-parser.test.ts` — Update test fixtures
- `__tests__/unit/traceability.test.ts` — Update test fixtures and expected IDs/labels

## What Does NOT Change

- Database schema or IndexedDB structure
- Existing project data (no migration)
- Section headings, phase gates, or workflow logic
- Export format or file structure
- Any files outside the 8 source files + test files listed above

## Testing Strategy

### Automated
- Run `npm test` — all existing tests must pass (updated to use new format)
- Run `npm run lint` — zero errors

### Manual Verification
1. Create a new project, generate spec content — requirements should use FR-001/NFR-001 format
2. Run spec evaluation — EARS keyword check should work correctly with FR-NNN format
3. View traceability matrix — requirements should display as FR-001, FR-002, etc.
4. Click a traceability cell — detail dialog should show requirement content correctly

### Verification Script
```bash
# After implementation, verify no stale REQ- references remain in source:
grep -rn "REQ-" --include="*.ts" --include="*.tsx" lib/ components/ \
  | grep -v node_modules | grep -v .next
# Expected: zero matches

# Verify FR- format is present:
grep -rn "FR-" --include="*.ts" --include="*.tsx" lib/ components/ \
  | grep -v node_modules | grep -v .next
# Expected: matches in all 8 source files
```
