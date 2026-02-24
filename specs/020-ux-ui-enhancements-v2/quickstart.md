# Quickstart: UX/UI Enhancements v2

**Branch**: `020-ux-ui-enhancements-v2` | **Date**: 2026-02-24

## Prerequisites

- Node.js 18+ and npm
- Clone the repo and checkout the feature branch:
  ```bash
  git checkout 020-ux-ui-enhancements-v2
  ```

## Setup

```bash
npm install
cp .env.example .env.local  # Add your Anthropic API key
npm run dev
```

No new dependencies to install. All required packages (Sonner, Framer Motion, Dexie.js, shadcn/ui) are already in `package.json`.

## Development Workflow

Per the project constitution, all implementation must follow **TDD** with **atomic commits**:

1. Write a failing test
2. Commit the test
3. Write minimal code to pass the test
4. Commit the implementation
5. Refactor if needed
6. Commit the refactor

## Key Files to Modify

| Feature | Primary File(s) |
|---------|-----------------|
| Toast notifications | `app/project/[id]/spec/page.tsx`, `plan/page.tsx`, `tasks/page.tsx` |
| Search & sort | `components/ui/project-list.tsx` |
| Description on cards | `components/ui/project-card.tsx` |
| Breadcrumb | `components/ui/breadcrumb.tsx` (new), `app/project/[id]/layout.tsx` |
| Progress indicator | `components/editor/section-editor.tsx` |
| Export feedback | `components/phase/export-panel.tsx` |
| Chat resize | `components/chat/chat-panel.tsx`, `chat-resize-handle.tsx` (new) |
| Responsive table | `components/traceability/matrix-table.tsx` |
| Project archiving | `lib/types/index.ts`, `lib/db/database.ts`, `lib/db/projects.ts`, `components/ui/project-card.tsx`, `components/ui/project-list.tsx` |

## Testing

```bash
npm test              # Run all Jest tests
npm run test:e2e      # Run Playwright E2E tests (if configured)
npm run lint          # Lint check
```

## Verification Checklist

- [ ] All toasts appear on success/error actions (no inline banners for transient feedback)
- [ ] Search filters projects by name, sort reorders correctly
- [ ] Project descriptions visible on cards (truncated at 3 lines)
- [ ] Breadcrumbs show on all project subpages, segments are clickable
- [ ] Skeleton loader appears during AI generation (not static text)
- [ ] Export actions show success toast
- [ ] Chat panel resizable on desktop, width persists across sessions
- [ ] Traceability table first column stays fixed on horizontal scroll
- [ ] Projects can be archived/unarchived, archived hidden by default
