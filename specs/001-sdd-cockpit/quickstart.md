# Quickstart: SDD Cockpit

**Branch**: `001-sdd-cockpit` | **Date**: 2026-02-22

## Prerequisites

- Node.js 20+ (LTS)
- npm 10+ (included with Node.js)

## Setup

```bash
# Clone and enter the project
git clone <repo-url> sdd-cockpit
cd sdd-cockpit

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app opens at `http://localhost:5173`.

## Tech Stack

| Concern | Tool |
|---------|------|
| Framework | Svelte 5 + SvelteKit (SPA mode) |
| Language | TypeScript 5.x |
| Build | Vite (via SvelteKit) |
| Storage | IndexedDB via Dexie.js |
| Testing | Vitest + fake-indexeddb |
| Accessibility | Svelte compiler warnings + Bits UI |
| LLM API | Anthropic Messages API (Claude) |

## Project Structure

```
src/
├── lib/
│   ├── db/                 # Dexie database, schema, operations
│   ├── api/                # Claude API client, streaming
│   ├── stores/             # Svelte stores for app state
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Bits UI wrappers, primitives
│   │   ├── editor/         # Section editor, markdown preview
│   │   └── phase/          # Phase gate, status indicators
│   ├── prompts/            # LLM system prompts per phase
│   └── types/              # TypeScript types and interfaces
├── routes/
│   ├── +layout.svelte      # App shell, navigation
│   ├── +page.svelte        # Project list (home)
│   ├── settings/
│   │   └── +page.svelte    # API key configuration
│   └── project/
│       └── [id]/
│           ├── +page.svelte          # Project overview / redirect
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
│   ├── phase-gate.test.ts  # Phase status transitions
│   └── export.test.ts      # Markdown export logic
└── integration/
    ├── project-crud.test.ts
    └── phase-workflow.test.ts

static/                     # Static assets (if any)
```

## Key Commands

```bash
npm run dev          # Start dev server with HMR
npm run build        # Production build (static SPA)
npm run preview      # Preview production build
npm run test         # Run Vitest in watch mode
npm run test:run     # Run tests once (CI mode)
npm run check        # Svelte type checking + a11y warnings
```

## First-Time User Flow

1. Open the app → API key setup screen (Req 9)
2. Paste Anthropic API key → validated → proceed to project list
3. Click "New Project" → enter project name → navigate to Requirements phase (Req 1)
4. Enter project description → click "Generate" → AI generates EARS-format requirements (Req 3)
5. Review and edit sections → click "Mark as Reviewed" → Design phase unlocks (Req 7)
6. Click "Generate" in Design → AI generates design doc from approved requirements (Req 4)
7. Review and edit → approve → Tasks phase unlocks
8. Click "Generate" in Tasks → AI generates task breakdown (Req 5)
9. Review and edit → approve → "Export" enabled (Req 8)
10. Export as zip or individual markdown files
