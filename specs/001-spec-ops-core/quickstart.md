# Quickstart: SpecOps

**Branch**: `001-spec-ops-core` | **Date**: 2026-02-22

## Prerequisites

- Node.js 20+ (LTS)
- npm 10+ (included with Node.js)
- Anthropic API key

## Setup

```bash
# Clone and enter the project
git clone <repo-url> spec-ops
cd spec-ops

# Install dependencies
npm install

# Configure API key
cp .env.example .env.local
# Edit .env.local and set: ANTHROPIC_API_KEY=sk-ant-...

# Start dev server
npm run dev
```

The app opens at `http://localhost:3000`.

## Tech Stack

| Concern | Tool |
|---------|------|
| Framework | Next.js (App Router) with React |
| Language | TypeScript 5.x |
| State management | Zustand |
| UI components | shadcn/ui (Radix + Tailwind CSS) |
| Storage | IndexedDB via Dexie.js |
| LLM API | Anthropic SDK (server-side, via API routes) |
| Testing | Jest + React Testing Library (unit), Playwright (E2E) |
| A11y linting | eslint-plugin-jsx-a11y |

## Project Structure

```
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
│       └── tasks/
│           └── page.tsx    # Tasks phase editor
└── api/
    ├── generate/
    │   └── route.ts        # LLM proxy: POST /api/generate (streaming)
    └── key-status/
        └── route.ts        # GET /api/key-status

components/
├── ui/                     # shadcn/ui components (Button, Dialog, Tabs, etc.)
├── editor/                 # Section editor, markdown preview
└── phase/                  # Phase gate UI, status indicators

lib/
├── db/                     # Dexie database, schema, CRUD operations
├── stores/                 # Zustand stores for app state
├── prompts/                # LLM system prompts per phase
└── types/                  # TypeScript interfaces and enums

__tests__/
├── unit/                   # Jest unit tests
├── integration/            # Jest integration tests
└── e2e/                    # Playwright E2E tests
```

## Key Commands

```bash
npm run dev          # Start dev server with Turbopack HMR
npm run build        # Production build
npm run start        # Start production server
npm run test         # Run Jest tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # ESLint + jsx-a11y checks
```

## Environment Variables

```bash
# .env.local (required)
ANTHROPIC_API_KEY=sk-ant-...    # Your Anthropic API key (server-side only)
```

## First-Time User Flow

1. Set `ANTHROPIC_API_KEY` in `.env.local` and start the dev server
2. Open the app → project list (empty)
3. Click "New Project" → enter project name → navigate to Spec phase (Req 1)
4. Enter project description → click "Generate" → AI generates EARS-format spec (Req 3)
5. Review and edit sections → click "Mark as Reviewed" → Plan phase unlocks (Req 7)
6. Click "Generate" in Plan → AI generates plan doc from approved spec (Req 4)
7. Review and edit → approve → Tasks phase unlocks
8. Click "Generate" in Tasks → AI generates task breakdown (Req 5)
9. Review and edit → approve → "Export" enabled (Req 8)
10. Export as zip or individual markdown files
