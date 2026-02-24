import { filterProjects } from "@/components/ui/project-list-utils";
import type { Project } from "@/lib/types";

function makeProject(
  overrides: Partial<Project> & { name: string },
): Project {
  return {
    id: crypto.randomUUID(),
    description: "",
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

describe("filterProjects — empty state", () => {
  it("returns empty array when no projects match search", () => {
    const projects = [
      makeProject({ name: "Alpha" }),
      makeProject({ name: "Beta" }),
    ];
    expect(filterProjects(projects, "xyz", false)).toEqual([]);
  });

  it("returns empty array when all projects are archived and showArchived=false", () => {
    const projects = [
      makeProject({ name: "Alpha", archivedAt: Date.now() }),
      makeProject({ name: "Beta", archivedAt: Date.now() }),
    ];
    expect(filterProjects(projects, "", false)).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    expect(filterProjects([], "", false)).toEqual([]);
  });
});
