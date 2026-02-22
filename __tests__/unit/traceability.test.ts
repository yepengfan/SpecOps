import {
  addMapping,
  removeMapping,
  clearAiMappings,
  getCoverageStats,
  parseRequirementIds,
} from "@/lib/db/traceability";
import type { Project, TraceabilityMapping } from "@/lib/types";

function makeMapping(overrides?: Partial<TraceabilityMapping>): TraceabilityMapping {
  return {
    id: "mapping-1",
    requirementId: "req-1",
    requirementLabel: "Req 1: Create Project",
    targetType: "plan",
    targetId: "architecture",
    targetLabel: "Architecture",
    origin: "ai",
    createdAt: Date.now(),
    ...overrides,
  };
}

function makeProject(overrides?: Partial<Project>): Project {
  return {
    id: "test-id",
    name: "Test Project",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: {
      spec: {
        type: "spec",
        status: "reviewed",
        sections: [
          { id: "problem-statement", title: "Problem Statement", content: "" },
          {
            id: "ears-requirements",
            title: "EARS Requirements",
            content:
              "- **REQ-1**: WHEN user clicks create, the system SHALL create a new project.\n- **REQ-2**: WHEN user clicks delete, the system SHALL delete the project.\n- **REQ-3**: WHEN user clicks export, the system SHALL export the project.",
          },
          { id: "non-functional-requirements", title: "Non-Functional Requirements", content: "" },
        ],
      },
      plan: {
        type: "plan",
        status: "reviewed",
        sections: [
          { id: "architecture", title: "Architecture", content: "Arch" },
          { id: "api-contracts", title: "API Contracts", content: "API" },
          { id: "data-model", title: "Data Model", content: "Data" },
          { id: "tech-decisions", title: "Tech Decisions", content: "Tech" },
          { id: "security-edge-cases", title: "Security & Edge Cases", content: "Sec" },
        ],
      },
      tasks: {
        type: "tasks",
        status: "reviewed",
        sections: [
          { id: "task-list", title: "Task List", content: "Tasks" },
          { id: "dependencies", title: "Dependencies", content: "Deps" },
          { id: "file-mapping", title: "File Mapping", content: "Files" },
          { id: "test-expectations", title: "Test Expectations", content: "Tests" },
        ],
      },
    },
    traceabilityMappings: [],
    ...overrides,
  };
}

describe("addMapping", () => {
  it("adds a mapping to the project", () => {
    const project = makeProject();
    const mapping = makeMapping();
    const updated = addMapping(project, mapping);

    expect(updated.traceabilityMappings).toHaveLength(1);
    expect(updated.traceabilityMappings[0]).toEqual(mapping);
  });

  it("preserves existing mappings", () => {
    const existing = makeMapping({ id: "existing" });
    const project = makeProject({ traceabilityMappings: [existing] });
    const newMapping = makeMapping({ id: "new-mapping" });
    const updated = addMapping(project, newMapping);

    expect(updated.traceabilityMappings).toHaveLength(2);
    expect(updated.traceabilityMappings[0].id).toBe("existing");
    expect(updated.traceabilityMappings[1].id).toBe("new-mapping");
  });

  it("does not mutate the original project", () => {
    const project = makeProject();
    const mapping = makeMapping();
    addMapping(project, mapping);

    expect(project.traceabilityMappings).toHaveLength(0);
  });
});

describe("removeMapping", () => {
  it("removes a mapping by id", () => {
    const mapping = makeMapping({ id: "to-remove" });
    const project = makeProject({ traceabilityMappings: [mapping] });
    const updated = removeMapping(project, "to-remove");

    expect(updated.traceabilityMappings).toHaveLength(0);
  });

  it("preserves other mappings", () => {
    const m1 = makeMapping({ id: "keep" });
    const m2 = makeMapping({ id: "remove" });
    const project = makeProject({ traceabilityMappings: [m1, m2] });
    const updated = removeMapping(project, "remove");

    expect(updated.traceabilityMappings).toHaveLength(1);
    expect(updated.traceabilityMappings[0].id).toBe("keep");
  });

  it("is a no-op when id not found", () => {
    const m = makeMapping({ id: "existing" });
    const project = makeProject({ traceabilityMappings: [m] });
    const updated = removeMapping(project, "nonexistent");

    expect(updated.traceabilityMappings).toHaveLength(1);
  });
});

describe("clearAiMappings", () => {
  it("removes all AI-origin mappings", () => {
    const ai1 = makeMapping({ id: "ai-1", origin: "ai" });
    const ai2 = makeMapping({ id: "ai-2", origin: "ai" });
    const project = makeProject({ traceabilityMappings: [ai1, ai2] });
    const updated = clearAiMappings(project);

    expect(updated.traceabilityMappings).toHaveLength(0);
  });

  it("preserves manual mappings", () => {
    const ai = makeMapping({ id: "ai-1", origin: "ai" });
    const manual = makeMapping({ id: "manual-1", origin: "manual" });
    const project = makeProject({ traceabilityMappings: [ai, manual] });
    const updated = clearAiMappings(project);

    expect(updated.traceabilityMappings).toHaveLength(1);
    expect(updated.traceabilityMappings[0].id).toBe("manual-1");
    expect(updated.traceabilityMappings[0].origin).toBe("manual");
  });

  it("handles empty mappings array", () => {
    const project = makeProject();
    const updated = clearAiMappings(project);

    expect(updated.traceabilityMappings).toHaveLength(0);
  });
});

describe("parseRequirementIds", () => {
  it("extracts requirement IDs from spec content", () => {
    const project = makeProject();
    const reqs = parseRequirementIds(project);

    expect(reqs).toHaveLength(3);
    expect(reqs[0]).toEqual({ id: "req-1", label: "REQ-1: WHEN user clicks create, the system SHALL create a new project." });
    expect(reqs[1]).toEqual({ id: "req-2", label: "REQ-2: WHEN user clicks delete, the system SHALL delete the project." });
    expect(reqs[2]).toEqual({ id: "req-3", label: "REQ-3: WHEN user clicks export, the system SHALL export the project." });
  });

  it("returns empty array when no requirements exist", () => {
    const project = makeProject({
      phases: {
        spec: {
          type: "spec",
          status: "reviewed",
          sections: [
            { id: "problem-statement", title: "Problem Statement", content: "Just text" },
            { id: "ears-requirements", title: "EARS Requirements", content: "No requirement headings here" },
            { id: "non-functional-requirements", title: "Non-Functional Requirements", content: "" },
          ],
        },
        plan: makeProject().phases.plan,
        tasks: makeProject().phases.tasks,
      },
    });
    const reqs = parseRequirementIds(project);

    expect(reqs).toHaveLength(0);
  });
});

describe("getCoverageStats", () => {
  it("returns zero coverage with no mappings", () => {
    const project = makeProject();
    const stats = getCoverageStats(project);

    expect(stats.planCoverage).toEqual({ covered: 0, total: 3 });
    expect(stats.taskCoverage).toEqual({ covered: 0, total: 3 });
  });

  it("counts plan coverage correctly", () => {
    const project = makeProject({
      traceabilityMappings: [
        makeMapping({ id: "m1", requirementId: "req-1", targetType: "plan" }),
        makeMapping({ id: "m2", requirementId: "req-2", targetType: "plan" }),
      ],
    });
    const stats = getCoverageStats(project);

    expect(stats.planCoverage).toEqual({ covered: 2, total: 3 });
  });

  it("counts task coverage correctly", () => {
    const project = makeProject({
      traceabilityMappings: [
        makeMapping({ id: "m1", requirementId: "req-1", targetType: "task" }),
      ],
    });
    const stats = getCoverageStats(project);

    expect(stats.taskCoverage).toEqual({ covered: 1, total: 3 });
  });

  it("does not double-count same requirement with multiple mappings", () => {
    const project = makeProject({
      traceabilityMappings: [
        makeMapping({ id: "m1", requirementId: "req-1", targetType: "plan", targetId: "architecture" }),
        makeMapping({ id: "m2", requirementId: "req-1", targetType: "plan", targetId: "data-model" }),
      ],
    });
    const stats = getCoverageStats(project);

    expect(stats.planCoverage).toEqual({ covered: 1, total: 3 });
  });

  it("returns total 0 when no requirements exist", () => {
    const project = makeProject({
      phases: {
        spec: {
          type: "spec",
          status: "reviewed",
          sections: [
            { id: "problem-statement", title: "Problem Statement", content: "" },
            { id: "ears-requirements", title: "EARS Requirements", content: "No reqs" },
            { id: "non-functional-requirements", title: "Non-Functional Requirements", content: "" },
          ],
        },
        plan: makeProject().phases.plan,
        tasks: makeProject().phases.tasks,
      },
    });
    const stats = getCoverageStats(project);

    expect(stats.planCoverage).toEqual({ covered: 0, total: 0 });
    expect(stats.taskCoverage).toEqual({ covered: 0, total: 0 });
  });
});
