# Feature Specification: Align Requirement Identifiers

**Feature Branch**: `015-align-requirement-ids`
**Created**: 2026-02-23
**Status**: Draft
**Input**: User description: "Align requirement identifier format across the SpecOps application. Currently, the spec-kit design documents use FR-001 / NFR-001 format for functional and non-functional requirements, but the AI-generated content within the SpecOps app uses REQ-1 / NFR-1 format. Standardize everything to use FR-001 (zero-padded, three digits) for functional requirements and NFR-001 for non-functional requirements. Update all AI prompt templates, evaluation prompts, and any parsing/display logic that references the old REQ-1 / NFR-1 format."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — AI-Generated Spec Content Uses FR/NFR Format (Priority: P1)

A user creates a new project in SpecOps, enters a description, and triggers AI generation of the Spec phase. The generated EARS requirements use the format `**FR-001**:` for functional requirements and `**NFR-001**:` for non-functional requirements — matching the format used in the project's own spec-kit design documents.

**Why this priority**: This is the core user-facing change. Every new project's AI-generated content will use the aligned format. Without this, all downstream features (evaluation, traceability) would parse the wrong identifiers.

**Independent Test**: Create a new project, enter a description, generate the Spec phase via AI. Verify all functional requirements are labeled FR-001, FR-002, etc. and all non-functional requirements are labeled NFR-001, NFR-002, etc. with zero-padded three-digit numbering.

**Acceptance Scenarios**:

1. **Given** a user triggers AI generation for the Spec phase, **When** the generated content appears, **Then** all functional requirements use the format `**FR-NNN**:` where NNN is a zero-padded three-digit number starting from 001
2. **Given** a user triggers AI generation for the Spec phase, **When** the generated content appears, **Then** all non-functional requirements use the format `**NFR-NNN**:` where NNN is a zero-padded three-digit number starting from 001
3. **Given** a user views previously generated spec content that used the old REQ-N format, **When** they regenerate the content, **Then** the new output uses the FR-NNN / NFR-NNN format

---

### User Story 2 — Spec Evaluation Validates FR/NFR Format (Priority: P1)

A user evaluates a spec (via the spec score feature). The evaluation rules correctly identify and validate requirements using the FR-NNN and NFR-NNN format — checking for EARS keywords on FR lines and recognizing NFR lines as non-functional.

**Why this priority**: Co-priority with US1 because evaluation must match the generation format. If generation outputs FR-NNN but evaluation still looks for REQ-N, scoring breaks entirely.

**Independent Test**: Create a project with AI-generated spec content in the new format, run spec evaluation, and verify the EARS keyword check correctly identifies FR-NNN requirements and validates them.

**Acceptance Scenarios**:

1. **Given** a spec contains requirements in FR-NNN format, **When** the spec evaluation runs, **Then** it correctly identifies all FR lines and checks for EARS keywords (WHEN, THEN, SHALL, WHERE, IF)
2. **Given** a spec contains requirements in NFR-NNN format, **When** the spec evaluation runs, **Then** it correctly identifies all NFR lines and exempts them from EARS keyword validation
3. **Given** a spec contains a mix of FR and NFR requirements, **When** the evaluation runs, **Then** the score accurately reflects EARS compliance for functional requirements only

---

### User Story 3 — Traceability Parsing Uses FR/NFR Format (Priority: P2)

A user views the traceability matrix for a project. The matrix correctly parses requirement identifiers from spec content using the FR-NNN format, maps them to plan sections and tasks, and displays them with the correct labels.

**Why this priority**: Traceability depends on parsing requirement IDs from spec content. It must align with the new format, but it's downstream of generation and evaluation.

**Independent Test**: Create a project with spec content using FR-NNN format, generate traceability mappings, and verify the matrix displays correct requirement labels (e.g., "FR-001: description").

**Acceptance Scenarios**:

1. **Given** a spec section contains `**FR-001**: WHEN the user...`, **When** the traceability parser extracts requirement IDs, **Then** it produces an internal ID of `fr-001` with label `FR-001: WHEN the user...`
2. **Given** a traceability matrix is displayed, **When** the user views requirement rows, **Then** each row shows the FR-NNN or NFR-NNN label
3. **Given** a user triggers AI traceability generation, **When** the AI maps requirements to plan/task sections, **Then** it uses the fr-NNN internal ID format consistently

---

### User Story 4 — Plan and Task Prompts Reference FR/NFR Format (Priority: P2)

A user generates plan or task content via AI. The AI prompt instructions reference the FR-NNN / NFR-NNN format so the generated plan and task content correctly cross-references spec requirements by their new identifiers.

**Why this priority**: Plan and task generation prompts instruct the AI to reference spec requirements. These instructions must use the aligned format to ensure consistent cross-referencing across all phases.

**Independent Test**: Generate plan content and task content for a project with FR-NNN requirements. Verify the generated output references requirements using the FR-NNN format (not REQ-N).

**Acceptance Scenarios**:

1. **Given** a user generates plan content via AI, **When** the plan references spec requirements, **Then** it uses FR-NNN identifiers (e.g., "addresses FR-001")
2. **Given** a user generates task content via AI, **When** the tasks reference spec requirements, **Then** it uses FR-NNN / NFR-NNN identifiers
3. **Given** a user views the traceability cell detail dialog, **When** it displays requirement content, **Then** it correctly extracts content using the FR-NNN format from the spec

---

### Edge Cases

- What happens if a user has existing projects with requirements in the old REQ-N format? The existing content is not automatically migrated. Users can regenerate sections to get the new format. Traceability parsing should handle both old and new formats gracefully during a transition period.
- What happens if the AI generates a requirement number that is not zero-padded (e.g., FR-1 instead of FR-001)? The parsing logic should handle both padded and unpadded numbers, normalizing to the zero-padded format for internal IDs.
- What happens if a spec has more than 999 requirements? This is unrealistic for practical use. The format supports three digits (001-999), which is more than sufficient.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: AI-generated functional requirements MUST use the format `**FR-NNN**:` where NNN is a zero-padded three-digit number starting from 001
- **FR-002**: AI-generated non-functional requirements MUST use the format `**NFR-NNN**:` where NNN is a zero-padded three-digit number starting from 001
- **FR-003**: Spec evaluation MUST identify lines matching the `**FR-NNN**:` pattern as functional requirements subject to EARS keyword validation
- **FR-004**: Spec evaluation MUST identify lines matching the `**NFR-NNN**:` pattern as non-functional requirements exempt from EARS keyword validation
- **FR-005**: Requirement ID parsing for traceability MUST extract IDs from the `**FR-NNN**:` and `**NFR-NNN**:` patterns and convert them to lowercase internal IDs (e.g., `fr-001`, `nfr-001`)
- **FR-006**: Plan generation prompts MUST instruct the AI to reference requirements using the FR-NNN format
- **FR-007**: Task generation prompts MUST instruct the AI to reference requirements using the FR-NNN / NFR-NNN format
- **FR-008**: Traceability generation prompts MUST use the fr-NNN internal ID format for requirement mapping
- **FR-009**: The traceability cell detail dialog MUST extract requirement content using the `**FR-NNN**:` pattern from spec sections
- **FR-010**: User-facing guidance messages about requirement format MUST reference the FR-NNN format
- **FR-011**: No occurrence of the old `REQ-` identifier format SHALL remain in prompt templates, evaluation logic, or parsing code after this change

### Key Entities

- **Requirement Identifier**: A structured label for a single requirement. Format: `FR-NNN` (functional) or `NFR-NNN` (non-functional), where NNN is a zero-padded three-digit number. Internal (lowercase) form: `fr-nnn` or `nfr-nnn`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of AI-generated spec content uses FR-NNN / NFR-NNN format with zero occurrences of the old REQ-N pattern
- **SC-002**: Spec evaluation correctly scores requirements in the FR-NNN format with identical accuracy to the previous REQ-N format
- **SC-003**: Traceability matrix correctly parses and displays all FR-NNN / NFR-NNN requirements from spec content
- **SC-004**: A full-text search of prompt templates and evaluation code for the pattern "REQ-" returns zero matches (excluding test files that verify backward compatibility)
- **SC-005**: All existing automated tests pass after the format change with zero regressions

## Assumptions

- The old REQ-N / NFR-N format in existing project data (stored in IndexedDB) is NOT automatically migrated — users can regenerate content to get the new format
- The `**NFR-NNN**:` format uses the same zero-padded three-digit numbering as `**FR-NNN**:` (the old NFR-N was not zero-padded)
- The internal lowercase ID format changes from `req-N` to `fr-NNN` (e.g., `req-1` becomes `fr-001`) — this affects traceability mappings in new projects only
- Test files may retain references to the old format for backward-compatibility testing during the transition
- The heading-based fallback parser (`## Req N: Title`) is updated to use the new format or removed if no longer needed
