# Req 10: Traceability Matrix

> **Note**: This requirement has been integrated into `specs/001-sdd-cockpit/spec.md` (Req 10). This file is the original reference — the canonical version lives in the spec.

Priority: High
Rationale: In text-based SDD workflows (CLI tools like spec-kit and ai-sdd), developers cannot easily see how requirements map to design decisions and implementation tasks. A visual traceability matrix solves this by showing the cross-phase mapping from requirements to design sections and tasks — making gaps visible at a glance ("this requirement has no corresponding design section") and giving developers confidence that every requirement is accounted for in design and tasks.

Main Flow — AI-Generated Mapping:
WHEN a developer triggers AI generation for the Design or Tasks phase
THEN the system SHALL:
- Include instructions in the LLM prompt to generate traceability metadata alongside the spec content
- For Design generation: the AI MUST output a mapping of each design section to the requirement(s) it addresses (e.g., "API Contracts → Req 1, Req 3, Req 5")
- For Tasks generation: the AI MUST output a mapping of each task to the requirement(s) and design section(s) it implements
- Persist the mapping data in IndexedDB as part of the project record
- Display a loading indicator during generation (same as phase generation)

Main Flow — Matrix View:
WHEN a developer opens the Traceability Matrix view for a project
THEN the system SHALL:
- Display a matrix table with requirements as rows and design sections / tasks as columns
- Each cell indicates whether a mapping exists (linked) or not (gap)
- Highlight coverage gaps: requirements with no linked design sections or tasks are visually flagged (e.g., red/amber row highlight)
- Allow the developer to click any cell to see the linked content from both phases side by side
- Update the matrix automatically when phase content or mappings change

Alternative Flow — Manual Mapping Edit:
WHEN a developer clicks on a cell in the traceability matrix
THEN the system SHALL:
- Allow the developer to manually add or remove a mapping link between a requirement and a design section or task
- Persist the updated mapping to IndexedDB immediately
- Recalculate coverage gap highlighting

Alternative Flow — Re-generate Mappings:
WHEN a developer clicks "Re-analyze Mappings" on the Traceability Matrix view
THEN the system SHALL:
- Send the current content of all phases to the LLM API
- Request the AI to re-generate all traceability mappings based on the latest content
- Replace all existing AI-generated mappings (but preserve any manual mappings marked by the user)
- Display a loading indicator during re-analysis

Validation Rules:
WHERE traceability matrix:
- The matrix view MUST be accessible from the project workspace at any time (not gated by phase status)
- If a phase has no generated content yet, that phase's columns MUST be shown as empty (not hidden)
- Coverage percentage MUST be displayed: "(X of Y requirements have linked design sections)" and "(X of Y requirements have linked tasks)"
- Manual mapping edits MUST be distinguishable from AI-generated mappings (e.g., different icon or label)

Error Handling:
IF AI mapping generation fails THEN:
- Display error message: "Mapping analysis failed. You can add mappings manually or retry."
- Preserve any existing mappings
- Allow retry

IF the traceability data structure is missing or corrupted THEN:
- Display the matrix with empty mappings and a banner: "No traceability data found. Click 'Re-analyze Mappings' to generate."
