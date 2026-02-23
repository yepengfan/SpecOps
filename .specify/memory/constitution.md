# SpecOps Constitution

## Core Principles

### I. Minimal Server, Secure API Proxy
The app is a Next.js web application with API routes that proxy LLM requests to the Claude API. Project data is stored in the browser via IndexedDB. The API key is stored server-side in `.env.local` and never reaches the browser. No user authentication. No external database or infrastructure beyond the Next.js server.

### II. Phase Gate Discipline (NON-NEGOTIABLE)
SDD's core value is enforced phase ordering: Requirements → Design → Tasks. Each phase must be reviewed before the next unlocks. Phase skipping is the #1 anti-pattern this app exists to prevent. All phase gate logic must be implemented strictly — no workarounds, no "skip for now" options.

### III. Spec as Source of Truth
Spec documents (requirements.md, design.md, tasks.md) are the authoritative source. If requirements change, they are updated in the spec first, then cascaded downstream. Editing an approved phase resets downstream phases to draft (preserving content). The app never silently modifies spec content.

### IV. EARS Format for Requirements
All requirements use the EARS (Easy Approach to Requirements Syntax) format with structured keywords: WHEN/THEN for event-driven behavior, WHERE for state-driven constraints, IF/THEN for error handling. This ensures consistent, testable, AI-parseable requirements.

### V. AI-Agent-Optimized Output
All exported specs must be structured for reliable AI coding agent consumption. Fixed section templates per phase ensure consistency across projects. The goal is reproducibility: given the same spec, any AI agent should produce a consistent implementation.

### VI. Simplicity and YAGNI
Start simple. No features beyond what the current requirements specify. No GitHub integration, no collaboration features in v1. API routes are thin proxies — no custom backend logic beyond forwarding requests to Claude. Prefer straightforward implementations over clever abstractions. Three similar lines of code are better than a premature abstraction.

## Technical Constraints

- **Storage**: IndexedDB for project data (chosen over localStorage for larger quota and structured data support). No server-side database.
- **Security**: API key stored server-side in `.env.local` — never sent to the browser, logged, or committed to version control. `.env*` files in `.gitignore`.
- **Performance**: Project list <1s, creation <500ms, navigation <500ms, export <2s, auto-save debounced within 1s.
- **Browser support**: Last 2 versions of Chrome, Firefox, Safari, Edge.
- **Accessibility**: WCAG 2.1 AA keyboard navigation, focus management, accessible labels on all interactive elements.
- **Data privacy**: No data sent anywhere except LLM API calls. No analytics, no telemetry.

## Development Workflow

- **Spec-Driven Development**: This project follows its own SDD methodology — requirements first, then design, then tasks. Spec artifacts (spec.md, plan.md, tasks.md) must be created and reviewed before any implementation code is written.
- **Branch-Per-Requirement**: When a new requirement or feature is added, a dedicated branch must be created for that work (e.g., `019-feature-name`). All spec artifacts and implementation for that requirement live on its branch until merged.
- **Test-Driven Development (TDD)**: All implementation must follow TDD — write a failing test first, write the minimal code to make it pass, then refactor. No production code without a corresponding test written beforehand.
- **Atomic Commits**: Each commit must be a single, self-contained logical change. One commit per test addition, one commit per implementation to pass that test, one commit per refactor. Avoid bundling unrelated changes. Commit messages must clearly describe the single change.
- **EARS format**: All requirements use EARS structured keywords (WHEN/THEN/WHERE/IF).
- **Fixed section templates**: Each phase has a fixed set of sections defined in the README. Do not add or remove sections without updating the template definition.
- **Export format**: Three markdown files (requirements.md, design.md, tasks.md) matching the section templates exactly.

## Governance

This constitution defines the non-negotiable principles for the SpecOps project. All implementation decisions must align with these principles. Phase gate enforcement is the single most critical feature — it must never be weakened or bypassed. Amendments to this constitution require updating this document, reviewing the change, and verifying no existing implementation violates the new rules.

**Version**: 1.1.0 | **Ratified**: 2026-02-22 | **Amended**: 2026-02-24
