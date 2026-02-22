import { clearAiMappings } from "@/lib/db/traceability";
import { parseReanalyzeResponse } from "@/lib/prompts/traceability";
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

function makeProject(mappings: TraceabilityMapping[] = []): Project {
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
            content: "## Req 1: Feature A\nContent\n\n## Req 2: Feature B\nContent",
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
    traceabilityMappings: mappings,
  };
}

describe("traceability reanalyze flow", () => {
  it("replaces AI mappings and preserves manual mappings", () => {
    const manualMapping = makeMapping({
      id: "manual-1",
      origin: "manual",
      requirementId: "req-1",
      targetType: "plan",
      targetId: "data-model",
    });
    const aiMapping = makeMapping({
      id: "ai-old",
      origin: "ai",
      requirementId: "req-1",
      targetType: "plan",
      targetId: "architecture",
    });

    const project = makeProject([manualMapping, aiMapping]);

    // Simulate LLM response
    const llmResponse = JSON.stringify([
      { sectionId: "architecture", sectionType: "plan", requirementIds: ["req-1", "req-2"] },
      { sectionId: "task-list", sectionType: "task", requirementIds: ["req-1"] },
    ]);

    const newMappings = parseReanalyzeResponse(llmResponse);

    // Clear AI mappings, preserve manual
    const cleared = clearAiMappings(project);
    expect(cleared.traceabilityMappings).toHaveLength(1);
    expect(cleared.traceabilityMappings[0].id).toBe("manual-1");

    // Add new AI mappings
    const updated = {
      ...cleared,
      traceabilityMappings: [
        ...cleared.traceabilityMappings,
        ...newMappings,
      ],
    };

    // Verify manual mapping is preserved
    const manualMappings = updated.traceabilityMappings.filter((m) => m.origin === "manual");
    expect(manualMappings).toHaveLength(1);
    expect(manualMappings[0].id).toBe("manual-1");

    // Verify new AI mappings are present
    const aiMappings = updated.traceabilityMappings.filter((m) => m.origin === "ai");
    expect(aiMappings).toHaveLength(3); // req-1 + req-2 to architecture + req-1 to task-list

    // Verify old AI mapping is gone
    expect(updated.traceabilityMappings.find((m) => m.id === "ai-old")).toBeUndefined();

    // Total mappings
    expect(updated.traceabilityMappings).toHaveLength(4);
  });

  it("handles reanalyze with no existing mappings", () => {
    const project = makeProject();

    const llmResponse = JSON.stringify([
      { sectionId: "architecture", sectionType: "plan", requirementIds: ["req-1"] },
    ]);

    const newMappings = parseReanalyzeResponse(llmResponse);
    const cleared = clearAiMappings(project);
    const updated = {
      ...cleared,
      traceabilityMappings: [...cleared.traceabilityMappings, ...newMappings],
    };

    expect(updated.traceabilityMappings).toHaveLength(1);
    expect(updated.traceabilityMappings[0].origin).toBe("ai");
  });

  it("handles malformed LLM response gracefully", () => {
    const manualMapping = makeMapping({ id: "manual-1", origin: "manual" });
    const project = makeProject([manualMapping]);

    const newMappings = parseReanalyzeResponse("not valid json");
    const cleared = clearAiMappings(project);
    const updated = {
      ...cleared,
      traceabilityMappings: [...cleared.traceabilityMappings, ...newMappings],
    };

    // Manual mapping preserved, no new AI mappings
    expect(updated.traceabilityMappings).toHaveLength(1);
    expect(updated.traceabilityMappings[0].id).toBe("manual-1");
  });
});
