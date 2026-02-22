# Feature Specification: Rename to SpecOps

**Feature Branch**: `014-rename-to-specops`
**Created**: 2026-02-23
**Status**: Draft
**Input**: User description: "Rename the project from SDD Cockpit / sdd-cockpit to SpecOps / spec-ops across all user-facing UI, configuration, documentation, and spec files. The GitHub repo has already been renamed to SpecOps. Update package.json name, Next.js page title and nav header, Dexie IndexedDB database name with migration so existing user data is preserved, README.md with updated name references aligned with spec-kit methodology, CLAUDE.md development guidelines, and all spec document titles and references in specs/. Do not rename the specs/001-sdd-cockpit/ directory itself as it is historical record, but update document titles and text references within those files."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — App Identity Update (Priority: P1)

A user opens the application and sees "SpecOps" as the app name everywhere — in the browser tab title, the navigation header, and any branding text. The old name "SDD Cockpit" no longer appears anywhere in the running application.

**Why this priority**: The app identity is the most visible change. Users interacting with the live application must see the correct name immediately. This is the core deliverable of the rename.

**Independent Test**: Open the application, verify the browser tab reads "SpecOps", the navigation header reads "SpecOps", and no visible UI element contains "SDD Cockpit".

**Acceptance Scenarios**:

1. **Given** a user opens the application in a browser, **When** the page loads, **Then** the browser tab title displays "SpecOps"
2. **Given** a user views any page in the application, **When** they look at the navigation header, **Then** it displays "SpecOps" instead of "SDD Cockpit"
3. **Given** a user navigates through all application pages, **When** they inspect any visible text, **Then** no occurrence of "SDD Cockpit" appears in the UI

---

### User Story 2 — Database Name Alignment (Priority: P1)

The IndexedDB database name is updated from "sdd-cockpit" to "spec-ops" to align with the new project identity. Existing local data is not preserved — this is acceptable as the application is only running locally in development.

**Why this priority**: Co-priority with US1 because the database name is part of the project identity. A clean rename avoids carrying legacy naming internally.

**Independent Test**: Open the application after the rename, verify the app loads with a fresh empty database named "spec-ops".

**Acceptance Scenarios**:

1. **Given** a user opens the renamed application, **When** the database initializes, **Then** it uses the name "spec-ops"
2. **Given** a user creates new projects after the rename, **When** they inspect browser storage, **Then** the database is listed as "spec-ops"

---

### User Story 3 — Documentation Accuracy (Priority: P2)

A developer cloning the repository reads accurate documentation that references "SpecOps" consistently. The README describes the project correctly, the development guidelines reflect the current name, and all spec documents use the updated name in their titles and references.

**Why this priority**: Documentation accuracy matters for onboarding and project credibility but does not affect the running application. It is important but secondary to the live app identity and data preservation.

**Independent Test**: Clone the repository, read the README, CLAUDE.md, and spec documents — verify all references use "SpecOps" or "spec-ops" and no stale "SDD Cockpit" or "sdd-cockpit" references remain (except in the historical `specs/001-sdd-cockpit/` directory name, which is preserved).

**Acceptance Scenarios**:

1. **Given** a developer reads the README, **When** they look for the project name, **Then** it reads "SpecOps" and the content aligns with the spec-kit development methodology
2. **Given** a developer reads CLAUDE.md, **When** they look at the guidelines header and feature references, **Then** all references use "SpecOps" or "spec-ops"
3. **Given** a developer reads any spec document in the specs/ directory, **When** they look at document titles and text references, **Then** all references use "SpecOps" instead of "SDD Cockpit" (the directory name `specs/001-sdd-cockpit/` is preserved as historical record)
4. **Given** a developer runs a full-text search for "sdd-cockpit" on the repository (excluding node_modules, .git, .next, and the `specs/001-sdd-cockpit/` directory name itself), **When** they review the results, **Then** no matches are found in any file content

---

### User Story 4 — Package and Configuration Consistency (Priority: P2)

A developer working on the project sees the correct package name in configuration files. The package.json name field, lock file references, and any build output reflect "spec-ops".

**Why this priority**: Configuration consistency prevents confusion during development and deployment but does not affect end users directly.

**Independent Test**: Run `npm install` and verify the package name in package.json and lock file reads "spec-ops". Verify no build errors result from the rename.

**Acceptance Scenarios**:

1. **Given** a developer opens package.json, **When** they check the `name` field, **Then** it reads "spec-ops"
2. **Given** a developer runs the install command, **When** the install completes, **Then** no errors occur and the lock file references the updated name
3. **Given** a developer runs the build command, **When** the build completes, **Then** no errors reference the old name

---

### Edge Cases

- What happens if a user has no existing data (fresh install)? The application works normally with a fresh "spec-ops" database.
- What happens to existing data under the old "sdd-cockpit" database name? It becomes inaccessible. This is acceptable as the app is only running locally in development.
- What happens if a developer searches for "sdd-cockpit" in the codebase? They should find matches only in the `specs/001-sdd-cockpit/` directory path and not in any file content, configuration, or source code.
- What happens to the constitution document? The constitution has already been updated to reference "SpecOps" — no further changes needed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The browser tab title MUST display "SpecOps" on all pages
- **FR-002**: The navigation header MUST display "SpecOps" as the application name
- **FR-003**: The package configuration name MUST be "spec-ops"
- **FR-004**: The browser storage database name MUST be updated from "sdd-cockpit" to "spec-ops"
- **FR-005**: (Removed — data migration not required; data loss is acceptable at this stage)
- **FR-006**: The README MUST reference "SpecOps" consistently and describe the project in alignment with the spec-kit development methodology
- **FR-007**: The development guidelines file MUST reference "SpecOps" or "spec-ops" in all name references
- **FR-008**: All spec document titles and text references in the specs/ directory MUST use "SpecOps" instead of "SDD Cockpit"
- **FR-009**: The `specs/001-sdd-cockpit/` directory MUST NOT be renamed (preserved as historical record)
- **FR-010**: No visible occurrence of "SDD Cockpit" or "sdd-cockpit" SHALL remain in the running application UI
- **FR-011**: No occurrence of "SDD Cockpit" or "sdd-cockpit" SHALL remain in source code, configuration, or documentation content (excluding the historical directory path `specs/001-sdd-cockpit/`)

### Key Entities

- **Name Reference**: Any occurrence of the old name ("SDD Cockpit", "sdd-cockpit") in source code, configuration, documentation, or UI text that must be updated to the new name ("SpecOps", "spec-ops")

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of visible UI text references display "SpecOps" with zero occurrences of "SDD Cockpit"
- **SC-002**: The IndexedDB database is named "spec-ops" in the running application
- **SC-003**: A full-text search of the repository for "sdd-cockpit" returns matches only in the `specs/001-sdd-cockpit/` directory path, not in any file content
- **SC-004**: A full-text search of the repository for "SDD Cockpit" returns zero matches across all files
- **SC-005**: All automated tests pass after the rename with zero regressions
- **SC-006**: The application builds and runs successfully with the new name

## Assumptions

- The GitHub repository has already been renamed to "SpecOps" — no Git remote URL changes are needed as part of this feature
- The constitution has already been updated to reference "SpecOps" — no constitution changes are in scope
- The `specs/001-sdd-cockpit/` directory name is preserved as a historical record of the original feature branch name — this is intentional, not an oversight
- "SpecOps" is the display name (title case), "spec-ops" is the kebab-case identifier used in package names and configuration
- Data loss from the database rename is acceptable — the application is only running locally in development with no production users
