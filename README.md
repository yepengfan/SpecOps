# SDD Workflow App

A pure frontend web application that guides developers through the [Spec-Driven Development (SDD)](https://github.com/github/spec-kit) workflow — from idea to implementation-ready specs — with structured templates, phase gate enforcement, and markdown export for AI coding agents.

## Problem

SDD (Spec-Driven Development) is one of the most effective ways to work with AI coding agents — you write structured specs before code, so the agent has a clear, reliable blueprint to implement against. But adopting SDD in practice is surprisingly hard, and most teams hit the same walls:

**1. High learning curve, no guided tooling.** SDD knowledge is scattered across blog posts (Addy Osmani, Martin Fowler), open-source repos (spec-kit, cc-sdd, OpenSpec), and individual practitioner write-ups. There's no tool that walks you through the process step by step. A developer staring at a blank `requirements.md` has no idea what sections to include, how detailed to be, or when it's "done enough" to move on.

**2. Phase skipping breaks the whole point of SDD.** In practice, developers instinctively jump from a vague idea straight to design, or from a half-baked design straight to task breakdown — essentially falling back to vibe coding with extra files. Without enforced phase gates, the discipline of "requirements first, then design, then tasks" erodes quickly, especially under delivery pressure.

**3. Inconsistent spec quality leads to unpredictable AI agent output.** The same feature requirement, written by two different developers, can produce wildly different specs — one missing API contracts, another missing acceptance criteria. This inconsistency directly impacts AI agent performance: garbage spec in, garbage code out. There's no structural validation to ensure completeness before handoff to an agent.

**4. Poor reproducibility.** If a spec isn't structured and complete, running the same requirement through an AI agent twice can produce fundamentally different implementations. SDD promises reproducibility — given the same spec, any agent should produce a consistent result — but this only works when the spec itself is rigorous. Without templates and validation, reproducibility is aspirational, not actual.

This app solves these problems by providing a guided, gate-enforced workflow that produces consistent, AI-agent-optimized spec documents every time.

## SDD Workflow

The core of SDD is a phased, gate-controlled pipeline. Each phase produces a specific spec document, and you cannot advance to the next phase until the current one is reviewed and approved. All specs are the **source of truth** — if requirements change, you update the spec first, then cascade changes down.

```mermaid
graph LR
    A["💡 Idea"] --> B["📋 Requirements"]
    B -->|"✅ Review"| C["🏗️ Design"]
    C -->|"✅ Review"| D["📝 Tasks"]
    D -->|"📦 Export"| E["🚀 AI Agent"]

    style A fill:#0f172a,stroke:#64748b,color:#e2e8f0
    style B fill:#1e293b,stroke:#3b82f6,color:#e2e8f0
    style C fill:#1e293b,stroke:#8b5cf6,color:#e2e8f0
    style D fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
    style E fill:#1e293b,stroke:#10b981,color:#e2e8f0
```

### Phase 1 — Requirements (`requirements.md`)

Define **what** you're building and **why**. This is the problem space, not the solution space.

| Section                      | Purpose                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| Problem Statement            | What pain point or opportunity are we addressing?          |
| EARS-format Requirements     | Structured requirements using WHEN/THEN/WHERE/IF keywords  |
| Non-Functional Requirements  | Performance, accessibility, browser support, security      |

**Gate:** Requirements must be reviewed before proceeding to Design. The app enforces this — you can't skip ahead.

### Phase 2 — Design (`design.md`)

Define **how** the system works. Translate requirements into a technical blueprint.

| Section            | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| Architecture       | System components, their responsibilities, and boundaries  |
| API Contracts      | Endpoints, request/response shapes, error codes            |
| Data Model         | Entities, relationships, storage decisions                 |
| Tech Decisions     | Key choices and their rationale (e.g., "Why IndexedDB?")   |
| Security & Edge Cases | Auth, validation, error handling strategies             |

**Gate:** Design must be reviewed before proceeding to Task Breakdown.

### Phase 3 — Task Breakdown (`tasks.md`)

Define the **step-by-step implementation plan**. Each task should be small enough for an AI agent to execute in one pass.

| Section            | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| Task List          | Ordered, atomic tasks with clear inputs and outputs        |
| Dependencies       | Which tasks depend on others?                              |
| File Mapping       | Which files each task will create or modify                |
| Test Expectations  | What tests should pass after each task is complete?        |

**Gate:** Tasks are exported as markdown files, ready to be placed in a Git repo's `specs/` directory for AI agent consumption.

### Phase 4 — Implementation (Outside this app)

The developer takes the exported spec documents, commits them to their project repo, and uses an AI coding agent (Claude Code, Copilot, Cursor, etc.) to implement against the specs. Steering happens in the developer's IDE, not in this app.

## Spec Document Plan

The following design documents define how this app itself is built, following the same SDD methodology:

```
specs/
├── requirements.md          # App requirements and user stories
├── design.md                # Frontend architecture, state management, UI/UX
└── tasks.md                 # Implementation task breakdown
```

> These spec documents will be added in subsequent commits as part of the SDD workflow.

## Key Decisions

- **Pure frontend SPA** — No backend. All data stored in browser (IndexedDB). API key entered at runtime, never bundled. Zero auth complexity.
- **Export-oriented** — Specs are exported as markdown files. Users place them in their own Git repos. No GitHub integration in v1.
- **AI-agent-optimized output** — Exported specs follow conventions that AI coding agents can parse and implement against reliably.

## License

MIT
