# Research: SpecOps

**Branch**: `001-spec-ops-core` | **Date**: 2026-02-22

## R1: Frontend Framework

**Decision**: Next.js (App Router) with React

**Rationale**:
- Developer familiarity — team has strong React/Next.js experience, enabling faster development
- Next.js App Router provides file-based routing with layouts, loading states, and error boundaries built in
- API routes (`app/api/`) enable a server-side proxy for the Claude API, keeping the API key on the server in `.env.local` instead of exposing it in the browser
- Largest ecosystem of any frontend framework — best AI agent familiarity for code generation
- `dexie-react-hooks` provides `useLiveQuery()` for reactive IndexedDB queries
- Turbopack for fast HMR in development

**Alternatives considered**:
- **Svelte 5 + SvelteKit**: Simpler, smaller bundles, built-in a11y warnings. Rejected due to less developer familiarity and smaller ecosystem. Would require `anthropic-dangerous-direct-browser-access` for API calls without a backend.
- **Vue 3**: Composition API is clean, deep reactivity works. Occupies a middle ground — not as familiar as React, not as simple as Svelte. No compelling unique advantage.
- **SolidJS**: Best raw performance, but ecosystem too immature. Weaker AI agent familiarity.
- **Vanilla TypeScript**: Sounds simple but you end up building routing, reactive updates, component lifecycle from scratch. Violates YAGNI in the opposite direction.

## R2: Build Tool

**Decision**: Turbopack (via Next.js)

**Rationale**:
- Included with Next.js — zero additional setup (`next dev --turbopack`)
- Fast HMR with incremental compilation
- Native TypeScript support via SWC (faster than Babel)
- Handles both client and server bundles (needed for API routes)
- No separate configuration required

**Alternatives considered**:
- **Vite**: Excellent standalone, but Next.js has its own build system. Using Vite with Next.js requires workarounds and loses API route support.
- **webpack**: Next.js legacy bundler. Slower than Turbopack. Still available as fallback if needed.

## R3: Testing Framework

**Decision**: Jest (unit/integration) + Playwright (E2E)

**Rationale**:
- Jest has built-in Next.js support via `next/jest` — uses SWC for fast TypeScript transpilation, zero manual config
- `fake-indexeddb` works via Jest setup file for IndexedDB mocking
- Playwright for E2E — tests real browser flows (project creation, phase gates, export) in Chromium, Firefox, WebKit
- E2E tests can validate the full API route proxy flow (frontend → API route → Claude API mock)
- React Testing Library for component-level tests

**Alternatives considered**:
- **Vitest**: Faster in isolation, but doesn't share Next.js's SWC config. Requires separate setup for path aliases and module resolution.
- **Playwright as sole framework**: Too heavyweight for unit testing pure functions (state machine, markdown generation).

## R4: IndexedDB Wrapper

**Decision**: Dexie.js

**Rationale**:
- Excellent TypeScript support with generics on tables (`Table<IProject, string>`)
- Fluent query API: `db.projects.orderBy('updatedAt').reverse().toArray()` — trivial for "sort by last updated" (Req 2)
- Typed error hierarchy: `Dexie.QuotaExceededError` (Req 1 error handling), `Dexie.OpenFailedError` (Req 2 corruption handling)
- Declarative migration system: `db.version(2).stores({...}).upgrade(tx => { ... })` for schema evolution
- `useLiveQuery()` React hook via `dexie-react-hooks` for reactive queries
- Active maintenance (v4.x, ~712K weekly downloads, ~13.7K GitHub stars)
- ~27 KB gzipped — acceptable for an SPA

**Alternatives considered**:
- **idb**: Tiny (~1.2 KB) but manual transaction management, no query builder, no typed errors, no declarative migrations. Better for simple caching, not data-centric SPAs.
- **localForage**: Stale (last release ~4 years ago). Key-value only — no indexing, no sorting, no migrations.
- **Raw IndexedDB**: Verbose event-based API. Would require hundreds of lines of infrastructure code that Dexie provides out of the box.

## R5: Accessibility Approach

**Decision**: shadcn/ui (Radix UI + Tailwind CSS) + eslint-plugin-jsx-a11y

**Rationale**:
- shadcn/ui is built on Radix UI primitives — battle-tested WCAG-compliant components (dialogs, tabs, buttons, forms)
- Copy-paste component model — components live in the project, fully customizable
- Tailwind CSS for styling — utility-first, no CSS-in-JS runtime
- eslint-plugin-jsx-a11y catches accessibility issues at lint time (missing alt text, non-interactive handlers, missing ARIA attributes)
- WCAG 2.1 AA scope is narrow: keyboard navigation, focus management, accessible labels
- The app has ~6-8 interactive patterns (inputs, buttons, tabs, dialogs, text editors, loading indicators)

**Alternatives considered**:
- **Radix UI (unstyled)**: Full control over styling but requires more manual work. shadcn/ui provides a sensible starting point.
- **React Aria (Adobe)**: Most thorough WCAG implementation but more verbose API. Overkill for this scope.
- **No library (pure ARIA)**: Viable but Radix provides well-tested patterns for dialogs, tabs, and focus management.

## R6: Additional Libraries

| Concern | Library | Rationale |
|---------|---------|-----------|
| State management | Zustand | Lightweight (~1KB), simple API, works well with React and Dexie.js |
| Markdown rendering | react-markdown | React component for rendering markdown, well-maintained |
| Zip export | client-zip or JSZip | Client-side zip generation for Req 8 |
| UUID generation | crypto.randomUUID() | Built-in browser API, no library needed (Req 1) |
| Streaming | Anthropic SDK (server-side) | Official SDK handles auth, streaming, and error types on the server |
| A11y linting | eslint-plugin-jsx-a11y | Catches accessibility issues at lint time |

## R7: API Key Architecture

**Decision**: Server-side API route proxy with `.env.local`

**Rationale**:
- API key stored in `.env.local` on the server — never reaches the browser
- Next.js API routes (`app/api/generate/route.ts`) proxy requests to Claude API
- Frontend calls `/api/generate` instead of `api.anthropic.com` directly
- Eliminates need for `anthropic-dangerous-direct-browser-access` header
- The Anthropic SDK can be used server-side for proper auth, streaming, and typed errors
- Secure by default — even if the app is exposed on a network, the key is not in the browser
- Settings page shows key status (configured / not configured) without storing the key in IndexedDB

**Alternatives considered**:
- **Direct browser calls**: Requires `anthropic-dangerous-direct-browser-access` header, exposes API key in browser Network tab and IndexedDB. Simpler but less secure.
- **Separate backend service**: Overkill — Next.js API routes provide the same protection without a separate deployment.

## Resolved Technical Context

| Field | Value |
|-------|-------|
| Language/Version | TypeScript 5.x |
| Framework | Next.js (App Router) with React |
| Primary Dependencies | Zustand, shadcn/ui, Dexie.js, react-markdown, client-zip, Anthropic SDK |
| Storage | IndexedDB via Dexie.js (client), `.env.local` for API key (server) |
| Testing | Jest + fake-indexeddb (E2E: Playwright) |
| Target Platform | Web browser (last 2 versions Chrome/FF/Safari/Edge) |
| Project Type | Web application (Next.js with API routes) |
| Performance Goals | List <1s, create <500ms, nav <500ms, export <2s |
| Constraints | API key server-side only, WCAG 2.1 AA |
| Scale/Scope | Single user, ~5 screens, 9 requirements |
