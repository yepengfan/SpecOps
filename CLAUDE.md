# sdd-cockpit Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-22

## Active Technologies
- TypeScript 5.x + Zustand (state), shadcn/ui (components), Dexie.js (IndexedDB), react-markdown, client-zip, Anthropic SDK (server-side) (001-sdd-cockpit)
- IndexedDB via Dexie.js (client), `.env.local` for API key (server) (001-sdd-cockpit)

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
- 001-sdd-cockpit: Added TypeScript 5.x + Zustand (state), shadcn/ui (components), Dexie.js (IndexedDB), react-markdown, client-zip, Anthropic SDK (server-side)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
