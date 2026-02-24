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

describe("filterProjects — archive toggle", () => {
  const active1 = makeProject({ name: "Active One" });
  const active2 = makeProject({ name: "Active Two" });
  const archived1 = makeProject({ name: "Old One", archivedAt: Date.now() });
  const archived2 = makeProject({ name: "Old Two", archivedAt: Date.now() });
  const all = [active1, active2, archived1, archived2];

  it("hides archived projects when showArchived=false", () => {
    const result = filterProjects(all, "", false);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.name)).toEqual(["Active One", "Active Two"]);
  });

  it("shows all projects when showArchived=true", () => {
    const result = filterProjects(all, "", true);
    expect(result).toHaveLength(4);
  });

  it("combines archive filter with search", () => {
    const result = filterProjects(all, "one", false);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Active One");
  });

  it("combines archive toggle with search (show all)", () => {
    const result = filterProjects(all, "one", true);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.name)).toEqual(
      expect.arrayContaining(["Active One", "Old One"]),
    );
  });
});
