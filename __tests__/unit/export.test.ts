import { generateMarkdown } from "@/lib/export/markdown";
import type { Project } from "@/lib/types";

function makeProject(overrides?: Partial<Project>): Project {
  return {
    id: "test-id",
    name: "Test Project",
    description: "A test project",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: {
      spec: {
        type: "spec",
        status: "reviewed",
        sections: [
          { id: "problem-statement", title: "Problem Statement", content: "The problem is X." },
          { id: "ears-requirements", title: "EARS Requirements", content: "WHEN user does Y, the system SHALL do Z." },
          { id: "non-functional-requirements", title: "Non-Functional Requirements", content: "Response time < 200ms." },
        ],
      },
      plan: {
        type: "plan",
        status: "reviewed",
        sections: [
          { id: "architecture", title: "Architecture", content: "Microservices architecture." },
          { id: "api-contracts", title: "API Contracts", content: "REST API with JSON." },
          { id: "data-model", title: "Data Model", content: "PostgreSQL tables." },
          { id: "tech-decisions", title: "Tech Decisions", content: "Use Next.js." },
          { id: "security-edge-cases", title: "Security & Edge Cases", content: "JWT auth." },
        ],
      },
      tasks: {
        type: "tasks",
        status: "reviewed",
        sections: [
          { id: "task-list", title: "Task List", content: "- **T1**: Setup project" },
          { id: "dependencies", title: "Dependencies", content: "T1 → T2" },
          { id: "file-mapping", title: "File Mapping", content: "T1: package.json" },
          { id: "test-expectations", title: "Test Expectations", content: "T1: unit tests" },
        ],
      },
    },
    traceabilityMappings: [],
    ...overrides,
  };
}

describe("generateMarkdown", () => {
  it("produces markdown for each phase", () => {
    const project = makeProject();
    const result = generateMarkdown(project);

    expect(result.spec).toBeDefined();
    expect(result.plan).toBeDefined();
    expect(result.tasks).toBeDefined();
  });

  it("includes project name as top-level heading", () => {
    const project = makeProject({ name: "My App" });
    const result = generateMarkdown(project);

    expect(result.spec.startsWith("# My App\n\n")).toBe(true);
    expect(result.plan.startsWith("# My App\n\n")).toBe(true);
    expect(result.tasks.startsWith("# My App\n\n")).toBe(true);
  });

  it("includes section headings in correct order for spec", () => {
    const project = makeProject();
    const result = generateMarkdown(project);

    const psIdx = result.spec.indexOf("## Problem Statement");
    const earsIdx = result.spec.indexOf("## EARS Requirements");
    const nfrIdx = result.spec.indexOf("## Non-Functional Requirements");

    expect(psIdx).toBeGreaterThan(-1);
    expect(earsIdx).toBeGreaterThan(psIdx);
    expect(nfrIdx).toBeGreaterThan(earsIdx);
  });

  it("includes section headings in correct order for plan", () => {
    const project = makeProject();
    const result = generateMarkdown(project);

    const archIdx = result.plan.indexOf("## Architecture");
    const apiIdx = result.plan.indexOf("## API Contracts");
    const dataIdx = result.plan.indexOf("## Data Model");
    const techIdx = result.plan.indexOf("## Tech Decisions");
    const secIdx = result.plan.indexOf("## Security & Edge Cases");

    expect(archIdx).toBeGreaterThan(-1);
    expect(apiIdx).toBeGreaterThan(archIdx);
    expect(dataIdx).toBeGreaterThan(apiIdx);
    expect(techIdx).toBeGreaterThan(dataIdx);
    expect(secIdx).toBeGreaterThan(techIdx);
  });

  it("includes section headings in correct order for tasks", () => {
    const project = makeProject();
    const result = generateMarkdown(project);

    const taskIdx = result.tasks.indexOf("## Task List");
    const depIdx = result.tasks.indexOf("## Dependencies");
    const fileIdx = result.tasks.indexOf("## File Mapping");
    const testIdx = result.tasks.indexOf("## Test Expectations");

    expect(taskIdx).toBeGreaterThan(-1);
    expect(depIdx).toBeGreaterThan(taskIdx);
    expect(fileIdx).toBeGreaterThan(depIdx);
    expect(testIdx).toBeGreaterThan(fileIdx);
  });

  it("preserves EARS format in spec output", () => {
    const project = makeProject();
    const result = generateMarkdown(project);

    expect(result.spec).toContain("WHEN user does Y, the system SHALL do Z.");
  });

  it("preserves section content", () => {
    const project = makeProject();
    const result = generateMarkdown(project);

    expect(result.spec).toContain("The problem is X.");
    expect(result.plan).toContain("Microservices architecture.");
    expect(result.tasks).toContain("- **T1**: Setup project");
  });
});
