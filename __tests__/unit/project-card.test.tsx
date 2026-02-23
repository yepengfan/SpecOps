import { render, screen } from "@testing-library/react";
import { ProjectCard } from "@/components/ui/project-card";
import type { Project } from "@/lib/types";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

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

describe("ProjectCard", () => {
  it("links to the overview page, not the active phase", () => {
    const project = makeProject();
    render(<ProjectCard project={project} />);

    const link = screen.getByRole("link", { name: project.name });
    expect(link).toHaveAttribute("href", `/project/${project.id}/overview`);
  });
});
