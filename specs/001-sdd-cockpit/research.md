# Research: SDD Cockpit

**Branch**: `001-sdd-cockpit` | **Date**: 2026-02-22

## R1: Frontend Framework

**Decision**: Svelte 5 + SvelteKit (SPA mode)

**Rationale**:
- Simplicity aligns with YAGNI principle — components are `.svelte` files with minimal ceremony
- Svelte 5 runes (`$state`, `$derived`, `$effect`) provide clean reactive state management for the phase gate state machine without external libraries
- Deep reactivity proxy handles nested project state (e.g., `project.phases.requirements.status = 'draft'`) without immutability gymnastics
- Compiler produces smallest bundles (~2-3 KB baseline vs React's ~42 KB)
- Built-in compile-time accessibility warnings catch WCAG issues automatically
- SvelteKit in SPA mode (`adapter-static` with `fallback: 'index.html'`) provides routing, build tooling (Vite), and project structure with zero server requirements
- Dexie.js `liveQuery()` returns Observables that work as Svelte stores directly — zero adapter code

**Alternatives considered**:
- **React**: Overengineered for 5 screens. More boilerplate for state management (useState/useEffect/useReducer + Zustand/XState). Larger bundle. The ecosystem advantages are less relevant at this project's scale.
- **Vue 3**: Composition API is clean, deep reactivity works. Occupies a middle ground — not as simple as Svelte, not as ecosystem-rich as React. No compelling unique advantage.
- **SolidJS**: Best raw performance, but ecosystem too immature. Weaker AI agent familiarity. Performance advantage over Svelte negligible for this use case.
- **Vanilla TypeScript**: Sounds simple but you end up building routing, reactive updates, component lifecycle from scratch. Violates YAGNI in the opposite direction.

## R2: Build Tool

**Decision**: Vite (via SvelteKit)

**Rationale**:
- Included with SvelteKit — zero additional setup
- Cold start ~1.2s vs webpack's 7+s; HMR updates in 10-20ms
- Native TypeScript transpilation via esbuild (20-30x faster than tsc)
- Rollup production builds with tree-shaking and code-splitting
- Configuration is near-zero (~20 lines of `vite.config.ts`)
- `build.target` supports "last 2 versions" browser requirement via browserslist

**Alternatives considered**:
- **webpack**: Significantly slower. 5-10x more configuration. No advantage for greenfield SPA.
- **esbuild**: Extremely fast but low-level — no dev server, no HMR framework. Vite already uses esbuild internally.
- **Parcel**: Zero-config appealing but slower HMR, smaller plugin ecosystem, less optimized production output.

## R3: Testing Framework

**Decision**: Vitest (unit/integration) + Playwright (E2E, added later)

**Rationale**:
- Vitest runs 10-20x faster than Jest in watch mode, 3.3x faster in CI
- Reuses `vite.config.ts` directly — same path aliases, TypeScript transform, plugins
- Native ESM and TypeScript — no `transformIgnorePatterns` hacks
- `fake-indexeddb` works via setup file for IndexedDB mocking
- Playwright for E2E later — tests real browsers (Chromium, Firefox, WebKit) covering browser support requirements
- YAGNI: start with Vitest only, add Playwright when there are actual user flows

**Alternatives considered**:
- **Jest**: Slower TypeScript execution, no native ESM, requires separate configuration duplicating Vite's.
- **Playwright as sole framework**: Too heavyweight for unit testing pure functions (state machine, markdown generation).

## R4: IndexedDB Wrapper

**Decision**: Dexie.js

**Rationale**:
- Excellent TypeScript support with generics on tables (`Table<IProject, string>`)
- Fluent query API: `db.projects.orderBy('updatedAt').reverse().toArray()` — trivial for "sort by last updated" (Req 2)
- Typed error hierarchy: `Dexie.QuotaExceededError` (Req 1 error handling), `Dexie.OpenFailedError` (Req 2 corruption handling)
- Declarative migration system: `db.version(2).stores({...}).upgrade(tx => { ... })` for schema evolution
- `liveQuery()` returns Observables that integrate natively with Svelte stores
- Active maintenance (v4.x, ~712K weekly downloads, ~13.7K GitHub stars)
- ~27 KB gzipped — acceptable for an SPA

**Alternatives considered**:
- **idb**: Tiny (~1.2 KB) but manual transaction management, no query builder, no typed errors, no declarative migrations. Better for simple caching, not data-centric SPAs.
- **localForage**: Stale (last release ~4 years ago). Key-value only — no indexing, no sorting, no migrations.
- **Raw IndexedDB**: Verbose event-based API. Would require hundreds of lines of infrastructure code that Dexie provides out of the box.

## R5: Accessibility Approach

**Decision**: Svelte compile-time warnings + Bits UI headless primitives

**Rationale**:
- Svelte compiler produces accessibility warnings at build time (missing alt text, non-interactive elements with click handlers, missing form labels)
- Bits UI provides unstyled, accessible headless primitives built for Svelte 5 (dialogs, tabs, buttons)
- WCAG 2.1 AA scope is narrow: keyboard navigation, focus management, accessible labels
- The app has ~6-8 interactive patterns (inputs, buttons, tabs, dialogs, text editors, loading indicators)
- Native `<dialog>` for confirmations, `role="tablist"` for phase navigation, `aria-live` for status updates

**Alternatives considered**:
- **React Aria / Radix UI**: React-only. Not applicable with Svelte.
- **No library (pure ARIA)**: Viable but Bits UI provides well-tested patterns for dialogs and tabs without reinventing the wheel.

## R6: Additional Libraries

| Concern | Library | Rationale |
|---------|---------|-----------|
| Markdown rendering | marked + svelte-markdown | Lightweight, well-maintained, Svelte wrapper available |
| Zip export | client-zip or JSZip | Client-side zip generation for Req 8 |
| UUID generation | crypto.randomUUID() | Built-in browser API, no library needed (Req 1) |
| Streaming | Native fetch + ReadableStream | Framework-agnostic, no library needed for Claude API SSE |

## Resolved Technical Context

| Field | Value |
|-------|-------|
| Language/Version | TypeScript 5.x |
| Framework | Svelte 5 + SvelteKit (SPA mode, adapter-static) |
| Primary Dependencies | Dexie.js, Bits UI, marked, client-zip |
| Storage | IndexedDB via Dexie.js |
| Testing | Vitest + fake-indexeddb (E2E: Playwright, added later) |
| Target Platform | Web browser (last 2 versions Chrome/FF/Safari/Edge) |
| Project Type | Web application (SPA) |
| Performance Goals | List <1s, create <500ms, nav <500ms, export <2s |
| Constraints | Offline-capable (no backend), WCAG 2.1 AA |
| Scale/Scope | Single user, ~5 screens, 9 requirements |
