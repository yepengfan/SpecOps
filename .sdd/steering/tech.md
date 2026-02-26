# Technology Stack

## Architecture

Client-heavy Next.js web application. All project data lives in the browser (IndexedDB). The server exists only as a thin API proxy to forward LLM requests to the Claude API, keeping the API key server-side. No database, no authentication, no external infrastructure.

## Core Technologies

- **Language**: TypeScript 5.x (strict mode)
- **Framework**: Next.js 16 (App Router) + React 19
- **Runtime**: Node.js 20+

## Key Libraries

- **State**: Zustand 5 — selector-based subscriptions, debounced persistence
- **Storage**: Dexie.js 4 — IndexedDB wrapper with live queries and schema migrations
- **UI**: shadcn/ui + Radix UI primitives + Tailwind CSS 4
- **Animation**: Framer Motion — page transitions, collapsible sections, staggered lists
- **AI**: Anthropic SDK 0.78.x — server-side Claude API calls with SSE streaming
- **Markdown**: react-markdown + remark-gfm for spec content rendering

## Development Standards

### Type Safety
TypeScript strict mode. Prefer `interface` for object shapes, `type` for unions. Use `type` keyword for import-only types. No `any`.

### Code Quality
ESLint 9 with next/core-web-vitals. jsx-a11y plugin for accessibility linting. No Prettier — ESLint handles formatting.

### Testing
Jest 30 + React Testing Library + fake-indexeddb. Tests in `__tests__/` mirroring source structure. Mocks for external deps (framer-motion, react-markdown, next/navigation).

## Development Environment

### Required Tools
- Node.js 20+, npm 10+
- `.env.local` with `ANTHROPIC_API_KEY` for AI features

### Common Commands
```bash
# Dev:   npm run dev
# Build: npm run build
# Test:  npm test
# Lint:  npm run lint
```

## Key Technical Decisions

- **IndexedDB over localStorage**: Structured data, larger quota, live query support via Dexie
- **No server-side database**: All data client-side for simplicity, privacy, and zero infrastructure
- **SSE streaming**: Real-time AI responses via Server-Sent Events, not WebSockets
- **Zustand over Context**: Simpler API, selector-based rerenders, easy testing with getState()
- **shadcn/ui**: Copy-paste components with full ownership, not a dependency to manage

---
_created_at: 2026-02-23_
