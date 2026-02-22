import { evaluateSpec, evaluatePlan, evaluateTasks } from "@/lib/eval/rules";

describe("evaluateSpec", () => {
  it("passes when requirements contain EARS keywords", () => {
    const content = `## Requirements
- **REQ-1**: System SHALL display a login form WHEN the user navigates to /login
- **REQ-2**: IF the user enters invalid credentials, THEN the system SHALL display an error

## Priority
High

## Rationale
User authentication is needed

## Main Flow
1. User navigates to login
2. User enters credentials

## Validation Rules
- Email must be valid format

## Error Handling
- Invalid credentials show error message

## Performance
- Login page loads in under 2 seconds`;

    const results = evaluateSpec(content);
    const earsCheck = results.find((r) => r.id === "spec-ears-keywords");
    expect(earsCheck?.passed).toBe(true);
  });

  it("fails when requirements lack EARS keywords", () => {
    const content = `## Requirements
- **REQ-1**: Display a login form
- **REQ-2**: Show an error message

## Priority
High

## Rationale
Needed

## Main Flow
1. User logs in

## Validation Rules
- Valid format

## Error Handling
- Show error

## Performance
- Fast loading`;

    const results = evaluateSpec(content);
    const earsCheck = results.find((r) => r.id === "spec-ears-keywords");
    expect(earsCheck?.passed).toBe(false);
    expect(earsCheck?.explanation).toBeTruthy();
  });

  it("checks required sections are present", () => {
    const content = `## Requirements
- **REQ-1**: System SHALL do something

## Priority
High

## Rationale
Because`;

    const results = evaluateSpec(content);
    const sectionCheck = results.find((r) => r.id === "spec-required-sections");
    expect(sectionCheck?.passed).toBe(false);
    expect(sectionCheck?.explanation).toContain("Main Flow");
  });

  it("checks performance target exists", () => {
    const content = `## Requirements
- **REQ-1**: System SHALL do something

## Priority
High

## Rationale
Because

## Main Flow
1. Do something

## Validation Rules
- Must be valid

## Error Handling
- Show error`;

    const results = evaluateSpec(content);
    const perfCheck = results.find((r) => r.id === "spec-performance-target");
    expect(perfCheck?.passed).toBe(false);
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
    const content = `- [ ] T001 Setup project structure
  - Dependencies: None
  - Files: src/index.ts
  - Tests: Unit test for setup

- [ ] T002 [P] Implement feature
  - Dependencies: T001
  - Files: src/feature.ts
  - Tests: Unit test for feature`;

    const results = evaluateTasks(content);
    const structureCheck = results.find(
      (r) => r.id === "tasks-structure"
    );
    expect(structureCheck?.passed).toBe(true);
  });

  it("fails when task references non-existent dependency", () => {
    const content = `- [ ] T001 Setup project
  - Dependencies: None
  - Files: src/index.ts
  - Tests: Unit test

- [ ] T002 Implement feature
  - Dependencies: T099
  - Files: src/feature.ts
  - Tests: Unit test`;

    const results = evaluateTasks(content);
    const depCheck = results.find(
      (r) => r.id === "tasks-dependency-valid"
    );
    expect(depCheck?.passed).toBe(false);
    expect(depCheck?.explanation).toContain("T099");
  });

  it("handles empty content", () => {
    const results = evaluateTasks("");
    expect(results.length).toBeGreaterThan(0);
  });
});
