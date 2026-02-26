# Product Overview

SpecOps is a browser-based Spec-Driven Development (SDD) tool that enforces disciplined phase ordering — Requirements → Design → Tasks — for software projects. It uses AI (Claude) to generate and refine spec content while keeping the human in the loop as reviewer and approver at each phase gate.

## Core Capabilities

1. **Phase-Gated Spec Authoring** — Three sequential phases (Spec, Plan, Tasks) with strict gate enforcement. Each phase must be reviewed before the next unlocks. Editing an approved phase resets downstream phases.
2. **AI-Assisted Content Generation** — Claude generates and regenerates spec sections via streaming API. Users provide descriptions and instructions; the AI produces structured, EARS-formatted requirements, designs, and task breakdowns.
3. **Traceability & Evaluation** — Cross-phase traceability matrices map requirements to design to tasks. Rule-based evaluation scores spec quality and flags gaps.
4. **Export for AI Agents** — Specs export as structured markdown files (requirements.md, design.md, tasks.md) optimized for consumption by AI coding agents.

## Target Use Cases

- Solo developers or small teams who want AI-assisted spec writing with enforced discipline
- Projects where spec quality directly impacts AI code generation quality
- Teams adopting SDD methodology who need a tool that prevents phase skipping

## Value Proposition

SpecOps prevents the #1 anti-pattern in AI-assisted development: jumping straight to code without proper requirements. By enforcing phase gates and providing AI assistance at each stage, it produces higher-quality specs that lead to more reliable AI-generated implementations.

---
_created_at: 2026-02-23_
