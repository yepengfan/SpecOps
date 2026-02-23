# Project Structure

## Organization Philosophy

Layer-first organization with domain grouping within layers. Top-level directories separate concerns (pages, components, shared logic, tests). Within each layer, files are grouped by domain (phase, chat, eval, editor).

## Directory Patterns

### Pages & Routes (`app/`)
**Location**: `app/`
**Purpose**: Next.js App Router pages and API routes
**Example**: `app/project/[id]/spec/page.tsx` — dynamic route for spec phase

### UI Components (`components/`)
**Location**: `components/{domain}/`
**Purpose**: React components grouped by domain
**Domains**: `ui/` (primitives), `phase/` (workflow), `chat/`, `editor/`, `eval/`, `traceability/`
**Example**: `components/phase/gated-phase-page.tsx` — phase content with gate enforcement

### Shared Logic (`lib/`)
**Location**: `lib/{category}/`
**Purpose**: Non-UI logic — database, stores, types, prompts, utilities
**Categories**: `db/` (Dexie operations), `stores/` (Zustand), `types/`, `prompts/` (LLM system prompts), `api/` (client-side wrappers), `chat/`, `eval/`, `export/`
**Example**: `lib/stores/project-store.ts` — Zustand store for project state

### Tests (`__tests__/`)
**Location**: `__tests__/{category}/`
**Purpose**: Jest tests organized by type
**Categories**: `unit/` (isolated), `integration/` (multi-module), `app/` and `components/` (by source location)
**Example**: `__tests__/unit/project-store.test.ts`

### Spec Artifacts (`specs/`)
**Location**: `specs/{NNN-feature-name}/`
**Purpose**: SDD specification documents per feature (spec.md, plan.md, tasks.md, research.md, etc.)
**Example**: `specs/018-framer-motion-animations/plan.md`

## Naming Conventions

- **Files**: kebab-case for all source files (`project-list.tsx`, `chat-store.ts`)
- **Components**: PascalCase function names (`export function ProjectList()`)
- **Stores**: `use{Domain}Store` naming (`useProjectStore`, `useChatStore`)
- **Tests**: `{source-name}.test.ts[x]` mirroring source file name

## Import Organization

```typescript
// 1. React/Next.js imports
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { motion, useReducedMotion } from "framer-motion";
import { useLiveQuery } from "dexie-react-hooks";

// 3. Local imports (absolute paths via @/)
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/lib/stores/project-store";
import { cn } from "@/lib/utils";

// 4. Type-only imports
import type { Project, PhaseType } from "@/lib/types";
```

**Path Aliases**:
- `@/`: Maps to project root (configured in tsconfig.json)

## Code Organization Principles

- **"use client"** directive on all interactive components; server components for layouts and static pages
- **Named exports** for components (not default), except Next.js page/layout conventions
- **Props interfaces** defined inline above the component, not in separate type files
- **Colocation**: Domain-specific types, helpers, and constants live near their consumers, not in a global utils dump
- **No barrel exports**: Import directly from the source file, not through index.ts re-exports

---
_created_at: 2026-02-23_
