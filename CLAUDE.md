# spec-ops Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-22

## Active Technologies
- TypeScript 5.x + Zustand (state), shadcn/ui (components), Dexie.js (IndexedDB), react-markdown, client-zip, Anthropic SDK (server-side) (001-spec-ops-core)
- IndexedDB via Dexie.js (client), `.env.local` for API key (server) (001-spec-ops-core)
- TypeScript 5.x + Next.js (App Router), Zustand (state), shadcn/ui (components), Dexie.js (IndexedDB), Anthropic SDK (server-side) (011-spec-score)
- IndexedDB via Dexie.js (evaluation results stored alongside project data) (011-spec-score)
- TypeScript 5.x + React 19, Next.js 16, Zustand 5, Dexie.js 4, shadcn/ui, Tailwind CSS 4 (012-rename-project)
- IndexedDB via Dexie.js (client-side only) (012-rename-project)
- TypeScript 5.x + React 19, Next.js 16, Zustand 5, Dexie.js 4, shadcn/ui, Tailwind CSS 4, Anthropic SDK 0.78.x, react-markdown (013-ai-chat-assistant)
- IndexedDB via Dexie.js (client-side only) — new `chatMessages` table (013-ai-chat-assistant)
- TypeScript 5.x + Next.js 16, React 19, Zustand 5, Dexie.js 4, shadcn/ui, Tailwind CSS 4, Anthropic SDK 0.78.x, react-markdown (014-rename-to-specops)
- IndexedDB via Dexie.js (no schema changes) (015-align-requirement-ids)
- TypeScript 5.x + Next.js 16, React 19, shadcn/ui (017-default-overview-tab)
- IndexedDB via Dexie.js (no changes) (017-default-overview-tab)
- TypeScript 5.x + React 19 + Next.js 16 (App Router) + Framer Motion (new), shadcn/ui (existing), Radix UI Collapsible (existing), Zustand 5 (existing) (018-framer-motion-animations)
- N/A — no storage changes (018-framer-motion-animations)

## Project Structure

```text
app/          # Next.js App Router pages and API routes
components/   # UI components (ui/, editor/, phase/)
lib/          # Shared logic (db/, stores/, prompts/, types/)
__tests__/    # Jest unit/integration tests, Playwright E2E
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x: Follow standard conventions

## Recent Changes
- 018-framer-motion-animations: Added TypeScript 5.x + React 19 + Next.js 16 (App Router) + Framer Motion (new), shadcn/ui (existing), Radix UI Collapsible (existing), Zustand 5 (existing)
- 017-default-overview-tab: Added TypeScript 5.x + Next.js 16, React 19, shadcn/ui
- 016-ux-ui-enhancements: Added TypeScript 5.x + Next.js 16, React 19, Zustand 5, Dexie.js 4, shadcn/ui, Tailwind CSS 4, sonner, next-themes
- 016-ux-ui-enhancements: IndexedDB via Dexie.js (no schema changes)
- 015-align-requirement-ids: Added TypeScript 5.x + Next.js 16, React 19, Zustand 5, Dexie.js 4
- 014-rename-to-specops: Added TypeScript 5.x + Next.js 16, React 19, Zustand 5, Dexie.js 4, shadcn/ui, Tailwind CSS 4, Anthropic SDK 0.78.x, react-markdown
- 013-ai-chat-assistant: Added TypeScript 5.x + React 19, Next.js 16, Zustand 5, Dexie.js 4, shadcn/ui, Tailwind CSS 4, Anthropic SDK 0.78.x, react-markdown
- 012-rename-project: Added TypeScript 5.x + React 19, Next.js 16, Zustand 5, Dexie.js 4, shadcn/ui, Tailwind CSS 4
- 011-spec-score: Added TypeScript 5.x + Next.js (App Router), Zustand (state), shadcn/ui (components), Dexie.js (IndexedDB), Anthropic SDK (server-side)
- 001-spec-ops-core: Added TypeScript 5.x + Zustand (state), shadcn/ui (components), Dexie.js (IndexedDB), react-markdown, client-zip, Anthropic SDK (server-side)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
