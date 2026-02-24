import { sortProjects, type SortOption } from "@/components/ui/project-list-utils";
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

describe("sortProjects", () => {
  const now = Date.now();
  const projects = [
    makeProject({ name: "Charlie", createdAt: now - 2000, updatedAt: now - 1000 }),
    makeProject({ name: "Alpha", createdAt: now - 1000, updatedAt: now - 3000 }),
    makeProject({ name: "Bravo", createdAt: now - 3000, updatedAt: now }),
  ];

  it("sorts by name ascending", () => {
    const sorted = sortProjects(projects, "name-asc");
    expect(sorted.map((p) => p.name)).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("sorts by name descending", () => {
    const sorted = sortProjects(projects, "name-desc");
    expect(sorted.map((p) => p.name)).toEqual(["Charlie", "Bravo", "Alpha"]);
  });

  it("sorts by newest created first", () => {
    const sorted = sortProjects(projects, "created-desc");
    expect(sorted.map((p) => p.name)).toEqual(["Alpha", "Charlie", "Bravo"]);
  });

  it("sorts by oldest created first", () => {
    const sorted = sortProjects(projects, "created-asc");
    expect(sorted.map((p) => p.name)).toEqual(["Bravo", "Charlie", "Alpha"]);
  });

  it("sorts by last updated (default)", () => {
    const sorted = sortProjects(projects, "updated-desc");
    expect(sorted.map((p) => p.name)).toEqual(["Bravo", "Charlie", "Alpha"]);
  });
});
