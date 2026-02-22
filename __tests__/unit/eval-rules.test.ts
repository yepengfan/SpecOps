import { evaluateSpec, evaluatePlan, evaluateTasks } from "@/lib/eval/rules";

describe("evaluateSpec", () => {
  it("passes when requirements contain EARS keywords", () => {
    const content = `## Problem Statement
Users need a login system.

## EARS Requirements
- **REQ-1**: System SHALL display a login form WHEN the user navigates to /login
- **REQ-2**: IF the user enters invalid credentials, THEN the system SHALL display an error

## Non-Functional Requirements
- **NFR-1**: The login page SHALL load in under 2 seconds (performance)`;

    const results = evaluateSpec(content);
    const earsCheck = results.find((r) => r.id === "spec-ears-keywords");
    expect(earsCheck?.passed).toBe(true);
  });

  it("fails when requirements lack EARS keywords", () => {
    const content = `## Problem Statement
Users need a login system.

## EARS Requirements
- **REQ-1**: Display a login form
- **REQ-2**: Show an error message

## Non-Functional Requirements
- **NFR-1**: The system should be fast (performance)`;

    const results = evaluateSpec(content);
    const earsCheck = results.find((r) => r.id === "spec-ears-keywords");
    expect(earsCheck?.passed).toBe(false);
    expect(earsCheck?.explanation).toContain("REQ-1");
  });

  it("only checks EARS keywords on REQ lines, not NFR lines", () => {
    const content = `## Problem Statement
Description.

## EARS Requirements
- **REQ-1**: WHEN the user logs in, the system SHALL create a session

## Non-Functional Requirements
- **NFR-1**: The system must support 1000 concurrent users`;

    const results = evaluateSpec(content);
    const earsCheck = results.find((r) => r.id === "spec-ears-keywords");
    expect(earsCheck?.passed).toBe(true);
  });

  it("checks required sections are present", () => {
    const content = `## Problem Statement
Some description.

## EARS Requirements
- **REQ-1**: System SHALL do something`;
    // Missing Non-Functional Requirements section

    const results = evaluateSpec(content);
    const sectionCheck = results.find((r) => r.id === "spec-required-sections");
    expect(sectionCheck?.passed).toBe(false);
    expect(sectionCheck?.explanation).toContain("Non-Functional Requirements");
  });

  it("checks performance target exists", () => {
    const content = `## Problem Statement
Description.

## EARS Requirements
- **REQ-1**: System SHALL do something

## Non-Functional Requirements
- **NFR-1**: The system must be secure`;

    const results = evaluateSpec(content);
    const perfCheck = results.find((r) => r.id === "spec-performance-target");
    expect(perfCheck?.passed).toBe(false);
  });

  it("detects performance keywords in NFR content", () => {
    const content = `## Problem Statement
Description.

## EARS Requirements
- **REQ-1**: System SHALL do something

## Non-Functional Requirements
- **NFR-1**: The system response time must be under 200ms`;

    const results = evaluateSpec(content);
    const perfCheck = results.find((r) => r.id === "spec-performance-target");
    expect(perfCheck?.passed).toBe(true);
  });

  it("handles empty content", () => {
    const results = evaluateSpec("");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      if (!r.passed) {
        expect(r.explanation).toBeTruthy();
      }
    });
  });
});

describe("evaluatePlan", () => {
  it("passes when all expected sections exist with content", () => {
    const content = `## Architecture
Microservices approach

## API Contracts
REST endpoints defined

## Data Model
User, Order entities

## Tech Decisions
Next.js, PostgreSQL

## Security & Edge Cases
Rate limiting, input validation`;

    const results = evaluatePlan(content);
    const sectionCheck = results.find((r) => r.id === "plan-required-sections");
    expect(sectionCheck?.passed).toBe(true);
  });

  it("fails when sections are missing", () => {
    const content = `## Architecture
Some architecture`;

    const results = evaluatePlan(content);
    const sectionCheck = results.find((r) => r.id === "plan-required-sections");
    expect(sectionCheck?.passed).toBe(false);
    expect(sectionCheck?.explanation).toBeTruthy();
  });

  it("fails when sections exist but are empty", () => {
    const content = `## Architecture

## API Contracts

## Data Model

## Tech Decisions

## Security & Edge Cases`;

    const results = evaluatePlan(content);
    const contentCheck = results.find(
      (r) => r.id === "plan-sections-non-empty"
    );
    expect(contentCheck?.passed).toBe(false);
  });

  it("handles empty content", () => {
    const results = evaluatePlan("");
    expect(results.length).toBeGreaterThan(0);
  });
});

describe("evaluateTasks", () => {
  it("passes for well-formed tasks with valid dependencies", () => {
    const content = `## Task List
- **T1**: Setup project structure
- **T2**: Implement authentication

## Dependencies
- T1 → T2 (setup before implementation)

## File Mapping
- T1: src/index.ts
- T2: src/auth.ts

## Test Expectations
- T1: Verify project scaffolding
- T2: Unit test for auth middleware`;

    const results = evaluateTasks(content);
    const structureCheck = results.find((r) => r.id === "tasks-structure");
    expect(structureCheck?.passed).toBe(true);
    const depCheck = results.find((r) => r.id === "tasks-dependency-valid");
    expect(depCheck?.passed).toBe(true);
  });

  it("fails when task references non-existent dependency", () => {
    const content = `## Task List
- **T1**: Setup project
- **T2**: Implement feature

## Dependencies
- T1 → T99 (invalid reference)

## File Mapping
- T1: src/index.ts

## Test Expectations
- T1: Unit test`;

    const results = evaluateTasks(content);
    const depCheck = results.find((r) => r.id === "tasks-dependency-valid");
    expect(depCheck?.passed).toBe(false);
    expect(depCheck?.explanation).toContain("T99");
  });

  it("checks required sections exist", () => {
    const content = `## Task List
- **T1**: Some task`;
    // Missing Dependencies, File Mapping, Test Expectations

    const results = evaluateTasks(content);
    const sectionCheck = results.find((r) => r.id === "tasks-required-sections");
    expect(sectionCheck?.passed).toBe(false);
    expect(sectionCheck?.explanation).toContain("Dependencies");
  });

  it("handles empty content", () => {
    const results = evaluateTasks("");
    expect(results.length).toBeGreaterThan(0);
  });
});
