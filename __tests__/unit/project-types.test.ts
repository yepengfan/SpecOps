import type { Project } from "@/lib/types";

describe("Project interface", () => {
  function makeProject(overrides: Partial<Project> = {}): Project {
    return {
      id: "test-123",
      name: "Test Project",
      description: "A test project",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      phases: {
        spec: { type: "spec", status: "draft", sections: [] },
        plan: { type: "plan", status: "locked", sections: [] },
        tasks: { type: "tasks", status: "locked", sections: [] },
      },
      traceabilityMappings: [],
      ...overrides,
    };
  }

  it("allows archivedAt to be undefined (active project)", () => {
    const project = makeProject();
    expect(project.archivedAt).toBeUndefined();
  });

  it("allows archivedAt to be a timestamp (archived project)", () => {
    const now = Date.now();
    const project = makeProject({ archivedAt: now });
    expect(project.archivedAt).toBe(now);
  });

  it("considers project active when archivedAt is undefined", () => {
    const project = makeProject();
    const isArchived = project.archivedAt !== undefined;
    expect(isArchived).toBe(false);
  });

  it("considers project archived when archivedAt is set", () => {
    const project = makeProject({ archivedAt: Date.now() });
    const isArchived = project.archivedAt !== undefined;
    expect(isArchived).toBe(true);
  });
});
