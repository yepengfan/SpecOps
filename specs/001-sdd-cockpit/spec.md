# SDD Workflow App Requirements

Version: 1.1.0
Status: Draft
Author: Yepeng
Last updated: 2026-02-22

Context:
Spec-Driven Development (SDD) is one of the most effective methodologies for working with AI coding agents — structured specs lead to predictable, high-quality implementations. However, adopting SDD in practice is difficult due to four core pain points: (1) high learning curve with no guided tooling, (2) phase skipping that undermines the methodology, (3) inconsistent spec quality leading to unpredictable AI agent output, and (4) poor reproducibility without structured templates and validation.

This app provides a guided, gate-enforced workflow that produces consistent, AI-agent-optimized spec documents. It is a Next.js web application with API routes for secure LLM proxy — no user authentication. The API key is stored server-side in `.env.local` and never reaches the browser.

---

## Req 1: Create New Project

Priority: Critical
Rationale: Users need to start a fresh SDD workflow for each new feature or application.

Main Flow:
WHEN a developer clicks "New Project" and provides a project name
THEN the system SHALL:
- Create a new project record with unique ID, name, and created timestamp
- Initialize the project in the Requirements phase with status "draft"
- Initialize Design and Tasks phases with status "locked"
- Persist the project to IndexedDB
- Navigate the developer to the Requirements phase of the new project
- Complete within 500ms

Validation Rules:
WHERE project creation:
- Project name MUST be non-empty and no longer than 100 characters
- Project name MUST be trimmed of leading/trailing whitespace
- Project ID MUST be a UUID v4

Error Handling:
IF IndexedDB storage is full THEN:
- Display error message: "Storage is full. Please delete unused projects."
- Do NOT create the project

IF project name is empty THEN:
- Display inline validation error: "Project name is required."
- Do NOT submit the form

---

## Req 2: List and Manage Projects

Priority: Critical
Rationale: Developers need to manage multiple SDD workflows simultaneously, resuming previous work or cleaning up finished projects.

Main Flow:
WHEN a developer opens the app
THEN the system SHALL:
- Load all projects from IndexedDB
- Display a project list showing: project name, current phase (Requirements / Design / Tasks / Complete), and last updated timestamp
- A project's phase displays as "Complete" when all three phases (Requirements, Design, Tasks) have status "reviewed". "Complete" is a derived display status, not a separate phase
- Sort projects by last updated (most recent first)
- Complete within 1 second

Alternative Flow — Resume:
WHEN a developer clicks on a project in the list
THEN the system SHALL:
- Navigate to that project's current active phase (for "Complete" projects, navigate to the Tasks phase)
- Restore all previously saved content for all phases
- Complete within 500ms
- A "Complete" project remains fully editable — editing any phase triggers the standard phase gate re-review flow (see Req 7)

Alternative Flow — Delete:
WHEN a developer clicks "Delete" on a project and confirms the action
THEN the system SHALL:
- Display a confirmation dialog: "Delete [project name]? This cannot be undone."
- Remove the project and all associated data from IndexedDB
- Update the project list immediately

Error Handling:
IF IndexedDB is corrupted or unreadable THEN:
- Display error message: "Unable to load projects. Storage may be corrupted."
- Offer option to clear all data and start fresh

---

## Req 3: AI-Assisted Requirements Generation

Priority: Critical
Rationale: The core value proposition — developers describe their idea in natural language and the AI generates a structured EARS-format requirements draft, eliminating the blank-page problem.

Main Flow:
WHEN a developer enters a natural language project description and triggers generation
THEN the system SHALL:
- Send the project description to the configured LLM API (Claude)
- Generate a complete requirements.md draft with all fixed sections: Problem Statement, EARS-format requirement entries, and Non-Functional Requirements
- Each generated requirement entry MUST follow EARS format (WHEN/THEN/WHERE/IF)
- Display the generated draft in an editable view, organized by section
- Persist the generated content to IndexedDB
- Display a loading indicator during generation

Validation Rules:
WHERE requirements generation:
- Project description MUST be non-empty (minimum 10 characters)
- Generated requirements MUST use EARS keywords: WHEN, THEN, SHALL, WHERE, IF
- Each generated requirement MUST include: Priority, Rationale, Main Flow, Validation Rules, and Error Handling sections

Error Handling:
IF API call fails (network error, timeout) THEN:
- Display error message describing the failure (e.g., "Network error. Please check your connection.")
- Preserve any previously generated content
- Allow the developer to retry

IF API key is invalid or missing THEN:
- Display error message: "Invalid API key. Please check your configuration."
- Redirect to API key setup screen

IF API rate limit is exceeded THEN:
- Display error message: "Rate limit exceeded. Please wait and try again."
- Preserve existing content

IF LLM response does not conform to the expected section structure THEN:
- Display the raw response in the editor with a warning banner: "Generated content may not follow the expected format. Please review and edit manually."
- Do NOT block phase approval — the developer can manually correct the content
- Allow the developer to retry generation

---

## Req 4: AI-Assisted Design Generation

Priority: Critical
Rationale: Once requirements are approved, the AI generates a design.md draft based on the approved requirements, translating "what" into "how".

Main Flow:
WHEN a developer triggers design generation after Requirements phase is approved
THEN the system SHALL:
- Send the approved requirements.md content as context to the LLM API
- Generate a complete design.md draft with all fixed sections: Architecture, API Contracts, Data Model, Tech Decisions, Security & Edge Cases
- Display the generated draft in an editable view, organized by section
- Persist the generated content to IndexedDB
- Display a loading indicator during generation

Validation Rules:
WHERE design generation:
- Requirements phase MUST have status "reviewed" before design generation is allowed
- The full approved requirements content MUST be included in the LLM prompt as context

Error Handling:
IF API call fails THEN:
- Display error message describing the failure
- Preserve any previously generated content
- Allow the developer to retry

IF LLM response does not conform to the expected section structure THEN:
- Display the raw response with a warning banner: "Generated content may not follow the expected format. Please review and edit manually."
- Allow the developer to retry generation

---

## Req 5: AI-Assisted Task Breakdown Generation

Priority: Critical
Rationale: Once design is approved, the AI generates a tasks.md draft based on approved requirements and design, producing an implementation plan that AI coding agents can execute.

Main Flow:
WHEN a developer triggers task generation after Design phase is approved
THEN the system SHALL:
- Send the approved requirements.md AND design.md content as context to the LLM API
- Generate a complete tasks.md draft with all fixed sections: Task List (ordered, atomic tasks with clear inputs and outputs), Dependencies, File Mapping, Test Expectations
- Each generated task MUST include: task number, title, dependencies, file mapping, and test expectations
- Display the generated draft in an editable view, organized by section
- Persist the generated content to IndexedDB
- Display a loading indicator during generation

Validation Rules:
WHERE task generation:
- Design phase MUST have status "reviewed" before task generation is allowed
- The full approved requirements AND design content MUST be included in the LLM prompt as context

Error Handling:
IF API call fails THEN:
- Display error message describing the failure
- Preserve any previously generated content
- Allow the developer to retry

IF LLM response does not conform to the expected section structure THEN:
- Display the raw response with a warning banner: "Generated content may not follow the expected format. Please review and edit manually."
- Allow the developer to retry generation

---

## Req 6: Section-Level Review and Edit

Priority: Critical
Rationale: Developers must be able to review, edit, and refine each section of AI-generated content before approving a phase.

Main Flow:
WHEN a developer views a generated phase (Requirements, Design, or Tasks)
THEN the system SHALL:
- Display each section of the generated content in an editable text area
- Allow the developer to edit any section's content directly
- Auto-save edits to IndexedDB on change (debounced, within 1 second of last keystroke)

Alternative Flow — Regenerate Section:
WHEN a developer clicks "Regenerate" on a specific section
THEN the system SHALL:
- Re-send the relevant context to the LLM API requesting only that section be regenerated
- Replace only the targeted section's content with the new generation
- Preserve all other sections' content and approval state unchanged
- Display a loading indicator on the targeted section only

Error Handling:
IF regeneration fails THEN:
- Display error on the targeted section: "Regeneration failed. Previous content preserved."
- Keep the previous content intact
- Allow retry

---

## Req 7: Phase Gate Enforcement

Priority: Critical
Rationale: SDD's core discipline requires completing each phase before advancing. Without enforcement, developers fall back to phase skipping — the second pain point this app solves.

Main Flow:
WHEN a developer attempts to navigate to the Design phase
THEN the system SHALL:
- Check that Requirements phase has status "reviewed"
- IF status is "reviewed": allow navigation to Design phase
- IF status is NOT "reviewed": block navigation and display the Design phase as visually locked/disabled

WHEN a developer attempts to navigate to the Tasks phase
THEN the system SHALL:
- Check that Design phase has status "reviewed"
- IF status is "reviewed": allow navigation to Tasks phase
- IF status is NOT "reviewed": block navigation and display the Tasks phase as visually locked/disabled

Alternative Flow — Approve Phase:
WHEN a developer clicks "Mark as Reviewed" on a phase
THEN the system SHALL:
- Set the current phase's status to "reviewed"
- Unlock the next phase (change status from "locked" to "draft")
- Persist the updated statuses to IndexedDB

Alternative Flow — Edit Approved Phase:
WHEN a developer attempts to edit content in a phase that has status "reviewed"
THEN the system SHALL:
- Keep the text field read-only and immediately display a confirmation warning: "Editing this phase will require re-review of all downstream phases. Continue?"
- Auto-save MUST be suppressed until the user confirms
- IF confirmed: make the field editable, reset the current phase's status to "draft", reset all downstream phases' status to "draft" (NOT "locked"), preserve all downstream content (do NOT delete), then resume normal auto-save behavior
- IF cancelled: keep the field read-only, make no changes to content or status

Validation Rules:
WHERE phase gate enforcement:
- Phase status transitions MUST follow: "locked" → "draft" → "reviewed"
- A phase with status "locked" MUST NOT be editable or navigable
- A phase with status "draft" MUST be editable but NOT approvable until all sections have content
- Only the "reviewed" → "draft" transition is allowed when editing an approved phase

---

## Req 8: Export Specs

Priority: High
Rationale: The final output of the workflow — markdown files ready to be committed to a project's specs/ directory for AI coding agent consumption.

Main Flow:
WHEN a developer clicks "Export" after all three phases are marked as "reviewed"
THEN the system SHALL:
- Generate three markdown files: `requirements.md`, `design.md`, `tasks.md`
- Each file MUST follow the fixed section template for its phase
- Offer download as individual files
- Offer download as a single zip archive containing all three files
- Complete export within 2 seconds

Validation Rules:
WHERE export:
- Export MUST be disabled (button greyed out with tooltip) if any phase status is not "reviewed"
- Exported content MUST match the latest saved content exactly (no stale data)
- Exported requirements.md MUST use EARS format (WHEN/THEN/WHERE/IF)

Error Handling:
IF zip generation fails THEN:
- Display error message: "Export failed. Please try individual file downloads."
- Fall back to individual file download option

---

## Req 9: API Key Configuration

Priority: High
Rationale: The app requires a valid LLM API key for all AI generation features. The key is stored server-side in `.env.local` and accessed only by Next.js API routes — it never reaches the browser.

Main Flow:
WHEN the Next.js server starts
THEN the system SHALL:
- Read the API key from the `ANTHROPIC_API_KEY` environment variable (`.env.local`)
- Make the key available to API route handlers only (server-side)
- The key MUST NOT be sent to the browser or included in any client-side bundle

Alternative Flow — Key Not Configured:
WHEN a developer triggers any AI generation and the API key is not set in `.env.local`
THEN the system SHALL:
- Return an error from the API route: "API key not configured. Set ANTHROPIC_API_KEY in .env.local"
- Display the error in the UI with setup instructions
- Block AI generation features but allow manual editing, review, and export

Alternative Flow — Settings Page:
WHEN a developer opens the settings page
THEN the system SHALL:
- Call a lightweight API endpoint (`/api/key-status`) that returns whether the key is configured (without revealing the key)
- Display key status: "Configured" or "Not configured"
- If not configured, display instructions to add `ANTHROPIC_API_KEY=sk-ant-...` to `.env.local` and restart the dev server

Validation Rules:
WHERE API key configuration:
- The API key MUST be stored in `.env.local` on the server — never in the browser, IndexedDB, or client-side code
- The key MUST NOT be logged, displayed, or included in API route responses
- The app MUST allow manual editing, review, and export without a valid API key — only AI generation is blocked
- API routes MUST validate the key is present before forwarding requests to Claude

---

## Req 10: Traceability Matrix

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
- If the requirements phase has no content yet, the coverage percentage MUST display "(0 of 0 requirements have linked design sections)" — the denominator is always the count of distinct requirements currently parsed from the requirements phase content
- Coverage percentage MUST be displayed in the matrix header above the table: "(X of Y requirements have linked design sections)" and "(X of Y requirements have linked tasks)". Y is the total number of distinct requirements parsed from the requirements phase content.
- Manual mapping edits MUST be distinguishable from AI-generated mappings (e.g., different icon or label)

Error Handling:
IF AI mapping generation fails THEN:
- Display error message: "Mapping analysis failed. You can add mappings manually or retry."
- Preserve any existing mappings
- Allow retry

IF the traceability data structure is missing or corrupted THEN:
- Display the matrix with empty mappings and a banner: "No traceability data found. Click 'Re-analyze Mappings' to generate."

---

## Non-Functional Requirements

Performance:
- Project list load: <1 second
- Project creation: <500ms
- Phase navigation: <500ms
- AI generation: display loading indicator immediately, no timeout enforced (LLM response times vary)
- Auto-save: within 1 second of last keystroke (debounced)
- Export generation: <2 seconds

Accessibility:
- Basic keyboard navigation for all interactive elements (WCAG 2.1 AA)
- Focus management when navigating between phases
- All buttons and form inputs MUST have accessible labels

Browser Support:
- Last 2 versions of Chrome, Firefox, Safari, and Edge

Storage:
- All project data persisted in IndexedDB (chosen over localStorage for larger storage quota and structured data support)
- No server-side storage
- No data sent to any server other than LLM API calls

Security:
- API key stored server-side in `.env.local` — never sent to the browser, bundled into client JS, or committed to version control
- No user authentication required
- API key MUST NOT be logged, displayed, or included in API route responses
