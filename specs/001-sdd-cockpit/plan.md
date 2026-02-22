# Implementation Plan: SDD Cockpit

**Branch**: `001-sdd-cockpit` | **Date**: 2026-02-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-sdd-cockpit/spec.md`

## Summary

Build a pure frontend SPA that guides developers through the Spec-Driven Development workflow (Requirements → Design → Tasks) with AI-assisted generation via the Claude API, phase gate enforcement, section-level editing with auto-save, and markdown export. Built with Svelte 5 + SvelteKit (SPA mode), Dexie.js for IndexedDB storage, and Vitest for testing.

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: Svelte 5 + SvelteKit (SPA mode, adapter-static)
**Primary Dependencies**: Dexie.js (IndexedDB), Bits UI (accessible primitives), marked (markdown), client-zip (export)
**Storage**: IndexedDB via Dexie.js
**Testing**: Vitest + fake-indexeddb (E2E: Playwright, added later)
**Target Platform**: Web browser (last 2 versions of Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (SPA)
**Performance Goals**: Project list <1s, creation <500ms, navigation <500ms, export <2s, auto-save debounced within 1s
**Constraints**: No backend, WCAG 2.1 AA, offline-capable (IndexedDB only)
**Scale/Scope**: Single user, ~5 screens, 9 requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Pure Frontend, Zero Backend | PASS | No backend in spec. All storage via IndexedDB. API key at runtime. |
| II | Phase Gate Discipline | PASS | Req 7 enforces strict locked→draft→reviewed transitions with cascading resets. |
| III | Spec as Source of Truth | PASS | Req 7 Alt Flow handles edit-cascading. Auto-save in Req 6. Content preserved on reset. |
| IV | EARS Format | PASS | Spec uses EARS. Req 3 generates EARS output. Req 8 exports EARS. |
| V | AI-Agent-Optimized Output | PASS | Req 8 exports fixed-template markdown. Reproducible section structure. |
| VI | Simplicity and YAGNI | PASS | No collaboration, no GitHub integration, no backend, minimal dependencies. |

### Post-Design Check

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Pure Frontend, Zero Backend | PASS | SvelteKit SPA mode with adapter-static. Dexie.js for storage. Direct browser API calls to Claude. |
| II | Phase Gate Discipline | PASS | Phase status state machine (locked→draft→reviewed) modeled in data-model.md. |
| III | Spec as Source of Truth | PASS | Project entity embeds all phase/section data. Single `put()` persists state. |
| IV | EARS Format | PASS | LLM prompts instruct EARS output. Section templates match spec. |
| V | AI-Agent-Optimized Output | PASS | Fixed section templates per phase. Export generates exact markdown structure. |
| VI | Simplicity and YAGNI | PASS | 4 runtime deps (Dexie, Bits UI, marked, client-zip). No state management library — Svelte 5 runes suffice. No backend proxy — direct browser API calls with `anthropic-dangerous-direct-browser-access` header. |

**Gate result**: ALL PASS. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-sdd-cockpit/
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions
├── data-model.md        # Phase 1: Entity definitions and schema
├── quickstart.md        # Phase 1: Setup and project structure guide
├── contracts/
│   ├── llm-api.md       # Claude API interface contract
│   └── indexeddb-schema.md  # IndexedDB schema contract
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── db/                 # Dexie database, schema, CRUD operations
│   ├── api/                # Claude API client, SSE streaming
│   ├── stores/             # Svelte stores for reactive app state
│   ├── components/
│   │   ├── ui/             # Bits UI wrappers, accessible primitives
│   │   ├── editor/         # Section editor, markdown preview
│   │   └── phase/          # Phase gate UI, status indicators
│   ├── prompts/            # LLM system prompts per phase
│   └── types/              # TypeScript interfaces and enums
├── routes/
│   ├── +layout.svelte      # App shell, navigation
│   ├── +page.svelte        # Project list (home)
│   ├── settings/
│   │   └── +page.svelte    # API key configuration
│   └── project/
│       └── [id]/
│           ├── +page.svelte          # Project redirect to active phase
│           ├── requirements/
│           │   └── +page.svelte      # Requirements phase editor
│           ├── design/
│           │   └── +page.svelte      # Design phase editor
│           └── tasks/
│               └── +page.svelte      # Tasks phase editor
├── app.html                # HTML entry point
└── app.css                 # Global styles

tests/
├── unit/
│   ├── db.test.ts          # IndexedDB operations
│   ├── phase-gate.test.ts  # Phase status state machine
│   └── export.test.ts      # Markdown export logic
└── integration/
    ├── project-crud.test.ts
    └── phase-workflow.test.ts
```

**Structure Decision**: SvelteKit SPA with file-based routing. All source lives under `src/` with `lib/` for shared logic and `routes/` for pages. Tests are co-located under `tests/` at the repo root. This is the standard SvelteKit layout — no custom structure needed.

## Complexity Tracking

> No constitution violations detected. No complexity justifications needed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
