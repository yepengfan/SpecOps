import { filterProjects } from "@/components/ui/project-list-utils";
import type { Project } from "@/lib/types";

function makeProject(overrides: Partial<Project> & { name: string }): Project {
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

describe("filterProjects — search by name", () => {
  const projects = [
    makeProject({ name: "Alpha App" }),
    makeProject({ name: "Beta Service" }),
    makeProject({ name: "alpha tool" }),
  ];

  it("returns all projects when search is empty", () => {
    expect(filterProjects(projects, "", false)).toHaveLength(3);
  });

  it("filters case-insensitively by name substring", () => {
    const result = filterProjects(projects, "alpha", false);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.name)).toEqual(
      expect.arrayContaining(["Alpha App", "alpha tool"]),
    );
  });

  it("returns empty array when no match", () => {
    expect(filterProjects(projects, "gamma", false)).toHaveLength(0);
  });

  it("excludes archived projects when showArchived is false", () => {
    const withArchived = [
      ...projects,
      makeProject({ name: "Archived Alpha", archivedAt: Date.now() }),
    ];
    const result = filterProjects(withArchived, "alpha", false);
    expect(result.every((p) => !p.archivedAt)).toBe(true);
  });

  it("includes archived projects when showArchived is true", () => {
    const withArchived = [
      ...projects,
      makeProject({ name: "Archived Alpha", archivedAt: Date.now() }),
    ];
    const result = filterProjects(withArchived, "alpha", true);
    expect(result).toHaveLength(3);
  });
});
