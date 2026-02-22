# Implementation Plan: SDD Cockpit

**Branch**: `001-sdd-cockpit` | **Date**: 2026-02-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-sdd-cockpit/spec.md`

## Summary

Build a Next.js web application that guides developers through the Spec-Driven Development workflow (Spec → Plan → Tasks) with AI-assisted generation via server-side Claude API proxy, phase gate enforcement, section-level editing with auto-save, and markdown export. Built with Next.js (App Router), React, Zustand, shadcn/ui, Dexie.js for IndexedDB storage, and Jest + Playwright for testing.

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: Next.js (App Router) with React
**Primary Dependencies**: Zustand (state), shadcn/ui (components), Dexie.js (IndexedDB), react-markdown, remark-gfm, mermaid, client-zip, Anthropic SDK (server-side)
**Storage**: IndexedDB via Dexie.js (client), `.env.local` for API key (server)
**Testing**: Jest + fake-indexeddb (E2E: Playwright)
**Target Platform**: Web browser (last 2 versions of Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Next.js with API routes)
**Performance Goals**: Project list <1s, creation <500ms, navigation <500ms, export <2s, auto-save debounced within 1s
**Constraints**: API key server-side only, WCAG 2.1 AA
**Scale/Scope**: Single user, ~6 screens, 10 requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Minimal Server, Secure API Proxy | PASS | Next.js API routes proxy Claude API calls. API key stays server-side in `.env.local`. |
| II | Phase Gate Discipline | PASS | Req 7 enforces strict locked→draft→reviewed transitions with cascading resets. |
| III | Spec as Source of Truth | PASS | Req 7 Alt Flow handles edit-cascading. Auto-save in Req 6. Content preserved on reset. |
| IV | EARS Format | PASS | Spec uses EARS. Req 3 generates EARS output. Req 8 exports EARS. |
| V | AI-Agent-Optimized Output | PASS | Req 8 exports fixed-template markdown. Reproducible section structure. |
| VI | Simplicity and YAGNI | PASS | No collaboration, no GitHub integration, no backend, minimal dependencies. |

### Post-Design Check (updated for Req 10)

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Minimal Server, Secure API Proxy | PASS | Next.js API routes proxy Claude API calls. API key in `.env.local` server-side. Dexie.js for client storage. No separate backend deployment. Req 10 re-analyze uses the same LLM proxy. |
| II | Phase Gate Discipline | PASS | Phase status state machine (locked→draft→reviewed) modeled in data-model.md. Zustand store enforces transitions. Traceability matrix is accessible at any time (not gated). |
| III | Spec as Source of Truth | PASS | Project entity embeds all phase/section data and traceability mappings. Single `put()` persists state. |
| IV | EARS Format | PASS | LLM prompts instruct EARS output. Section templates match spec. Req 10 identifies requirements by EARS heading slugs. |
| V | AI-Agent-Optimized Output | PASS | Fixed section templates per phase. Export generates exact markdown structure. Traceability mappings are structured metadata, not free-form. |
| VI | Simplicity and YAGNI | PASS | Req 10 adds one new entity (TraceabilityMapping), one page, and two components. Mappings are embedded in the Project record — no new IndexedDB tables or indexes. AI metadata parsing reuses existing LLM proxy. No new dependencies. |

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
app/
├── layout.tsx              # Root layout, navigation shell
├── page.tsx                # Project list (home)
├── settings/
│   └── page.tsx            # API key status page
├── project/
│   └── [id]/
│       ├── page.tsx        # Project redirect to active phase
│       ├── spec/
│       │   └── page.tsx    # Spec phase editor
│       ├── plan/
│       │   └── page.tsx    # Plan phase editor
│       ├── tasks/
│       │   └── page.tsx    # Tasks phase editor
│       └── traceability/
│           └── page.tsx    # Traceability matrix view
└── api/
    ├── generate/
    │   └── route.ts        # LLM proxy: POST /api/generate (streaming)
    └── key-status/
        └── route.ts        # GET /api/key-status

components/
├── ui/                     # shadcn/ui components (Button, Dialog, Tabs, etc.)
├── editor/                 # Section editor, markdown preview
│   ├── markdown-renderer.tsx  # ReactMarkdown + GFM + mermaid rendering
│   └── mermaid-diagram.tsx    # Client-side mermaid SVG renderer
├── phase/                  # Phase gate UI, status indicators
└── traceability/           # Traceability matrix table, cell detail view

lib/
├── db/                     # Dexie database, schema, CRUD operations
├── stores/                 # Zustand stores for app state
├── prompts/                # LLM system prompts per phase
└── types/                  # TypeScript interfaces and enums

__tests__/
├── unit/
│   ├── db.test.ts          # IndexedDB operations
│   ├── phase-gate.test.ts  # Phase status state machine
│   ├── export.test.ts      # Markdown export logic
│   ├── traceability.test.ts       # Traceability mapping CRUD
│   ├── traceability-matrix.test.ts # Matrix component rendering
│   └── markdown-renderer.test.tsx  # Markdown rendering + mermaid detection
├── integration/
│   ├── project-crud.test.ts
│   └── phase-workflow.test.ts
└── e2e/
    └── workflow.spec.ts    # Playwright E2E tests
```

**Structure Decision**: Next.js App Router with file-based routing. `app/` for pages and API routes, `components/` for UI, `lib/` for shared logic, `__tests__/` for all tests. This is the standard Next.js layout.

## Complexity Tracking

> No constitution violations. One complexity note for Req 10.

| Addition | Why Needed | Simpler Alternative Rejected Because |
|----------|------------|-------------------------------------|
| Req 10: TraceabilityMapping entity + AI metadata parsing | Core value: makes requirement coverage gaps visible, which is critical for SDD workflow confidence | Simply listing mappings in markdown export was considered, but doesn't support interactive gap detection or manual override — the key use case. |
