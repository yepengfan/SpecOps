# Research: Align Requirement Identifiers

**Branch**: `015-align-requirement-ids` | **Date**: 2026-02-23

## Decision 1: Identifier Format

**Decision**: Use `FR-NNN` (zero-padded three-digit) for functional requirements and `NFR-NNN` for non-functional requirements.

**Rationale**: Aligns AI-generated content with the project's own spec-kit design documents, which already use this format. Zero-padding ensures consistent sorting and display (FR-001, FR-002, ..., FR-010).

**Alternatives considered**:
- `FR-N` (unpadded) — Inconsistent with spec-kit docs, poor visual alignment in lists.
- `FREQ-001` / `NFREQ-001` — Nonstandard, more verbose, no benefit.
- Keep `REQ-N` everywhere — Would require changing all spec-kit design docs instead; the spec-kit format is the standard we want to adopt.

## Decision 2: Internal ID Format

**Decision**: Internal lowercase IDs change from `req-N` to `fr-NNN` (e.g., `req-1` → `fr-001`). NFR internal IDs are `nfr-NNN`.

**Rationale**: Internal IDs should mirror the display format for consistency. The zero-padding ensures alphabetical sort matches numerical sort.

**Alternatives considered**:
- Keep `req-N` internally, only change display — Creates a confusing mismatch between stored IDs and displayed labels.
- Use `fr-N` (unpadded internal) — Inconsistent with the padded display format; sorting issues.

## Decision 3: Backward Compatibility

**Decision**: Parsing logic handles both old (`REQ-N`) and new (`FR-NNN`) formats during a transition period. Existing project data is not auto-migrated.

**Rationale**: Users may have existing projects with the old format. Forcing migration or breaking existing data is unnecessary — they can simply regenerate content. Dual parsing is low-cost (one extra regex branch) and prevents breakage.

**Alternatives considered**:
- Auto-migrate existing IndexedDB content — Complex, risky, and unnecessary for a local-only development tool.
- Hard-break old format (no backward compat) — Would break traceability for existing projects with no recovery path short of regeneration.

## Decision 4: Heading Fallback Parser

**Decision**: Update the heading fallback parser (`## Req N: Title`) to also support `## FR-NNN: Title` format, keeping the old format as a secondary fallback.

**Rationale**: The heading format is a fallback for manually-written specs. Supporting both ensures robustness.

**Alternatives considered**:
- Remove heading fallback entirely — May break edge cases where users manually write specs with heading-based requirements.
