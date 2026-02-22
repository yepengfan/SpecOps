# Research: Rename to SpecOps

**Branch**: `014-rename-to-specops` | **Date**: 2026-02-23

## Research Question 1: How does Dexie.js handle database name changes?

**Decision**: Keep the existing database name (`"sdd-cockpit"`) in the Dexie constructor.

**Rationale**: Dexie.js (and the underlying IndexedDB API) uses the database name string as the unique identifier for a database. Changing `super("sdd-cockpit")` to `super("spec-ops")` would create a completely new, empty database. The old database with all user data would still exist in the browser but would be invisible to the application.

**Alternatives considered**:

1. **Manual migration via Dexie API**: Open old database, read all records, write to new database, delete old database. This is fragile — if the user closes the browser mid-migration, data could be lost. It also adds ~50 lines of one-time migration code that provides zero user value.

2. **IndexedDB `IDBFactory.databases()` detection**: Use the browser API to detect if the old database exists, then migrate. This API is not supported in all browsers (Firefox added support only recently). Too fragile for a rename.

3. **Keep old name internally** (chosen): The database name is an internal implementation detail. Users never see it. Renaming the TypeScript class and keeping `super("sdd-cockpit")` with a comment explaining why is the simplest, safest approach.

## Research Question 2: What is the scope of "sdd-cockpit" references in the codebase?

**Decision**: Update all content references; preserve the `specs/001-sdd-cockpit/` directory name.

**Findings**: A grep of the codebase reveals references in:

- **Source code** (2 files): `app/layout.tsx` (UI text), `lib/db/database.ts` (class name + DB name)
- **Configuration** (2 files): `package.json`, `package-lock.json`
- **Documentation** (2 files): `CLAUDE.md`, `README.md`
- **Spec documents** (7 files): Titles and text in `specs/001-sdd-cockpit/*.md` and `specs/011-spec-score/quickstart.md`

Total: ~13 files to modify (+ package-lock.json auto-regenerated).

The `specs/001-sdd-cockpit/` directory name is preserved because it reflects the historical feature branch name — renaming it would break git history references and provide no value.

## Research Question 3: Does the README need structural changes or just name substitution?

**Decision**: Name substitution plus minor content alignment with spec-kit terminology.

**Rationale**: The current README accurately describes the project's purpose and workflow. The changes needed are:
- Replace "SDD Workflow App" / "SDD Cockpit" with "SpecOps"
- Update the `specs/001-sdd-cockpit/` tree listing to reflect correct name references
- The spec-kit methodology description is already well-represented — the README describes the SDD workflow, phase gates, and export format clearly
