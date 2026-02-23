# Research: Rename to SpecOps

**Branch**: `014-rename-to-specops` | **Date**: 2026-02-23

## Research Question 1: How does Dexie.js handle database name changes?

**Decision**: Rename the database from `"sdd-cockpit"` to `"spec-ops"` in the Dexie constructor. Accept data loss.

**Rationale**: Dexie.js (and the underlying IndexedDB API) uses the database name string as the unique identifier for a database. Changing `super("sdd-cockpit")` to `super("spec-ops")` creates a new, empty database. The old database still exists in the browser but is invisible to the application. Since the app is only running locally in development with no production users, data loss is acceptable and a clean rename is preferred over carrying legacy naming internally.

**Alternatives considered**:

1. **Manual migration via Dexie API**: Open old database, read all records, write to new database, delete old database. Adds complexity for no value since data loss is acceptable.

2. **Keep old name internally**: Rename only the TypeScript class, keep `super("sdd-cockpit")`. Avoids data loss but leaves a legacy name in the codebase — rejected because aligning all names is preferred when data loss is acceptable.

## Research Question 2: What is the scope of "sdd-cockpit" references in the codebase?

**Decision**: Update all content references; preserve the `specs/001-sdd-cockpit/` directory name. *(Note: this decision was later reversed — directory renamed to `specs/001-spec-ops-core/` in feature 018.)*

**Findings**: A grep of the codebase reveals references in:

- **Source code** (2 files): `app/layout.tsx` (UI text), `lib/db/database.ts` (class name + DB name)
- **Configuration** (2 files): `package.json`, `package-lock.json`
- **Documentation** (2 files): `CLAUDE.md`, `README.md`
- **Spec documents** (7 files): Titles and text in `specs/001-spec-ops-core/*.md` and `specs/011-spec-score/quickstart.md`

Total: ~13 files to modify (+ package-lock.json auto-regenerated).

The `specs/001-sdd-cockpit/` directory name is preserved because it reflects the historical feature branch name — renaming it would break git history references and provide no value. *(Note: this decision was later reversed — directory renamed to `specs/001-spec-ops-core/` in feature 018.)*

## Research Question 3: Does the README need structural changes or just name substitution?

**Decision**: Name substitution plus minor content alignment with spec-kit terminology.

**Rationale**: The current README accurately describes the project's purpose and workflow. The changes needed are:
- Replace "SDD Workflow App" / "SDD Cockpit" with "SpecOps"
- Update the `specs/001-spec-ops-core/` tree listing to reflect correct name references
- The spec-kit methodology description is already well-represented — the README describes the SDD workflow, phase gates, and export format clearly
