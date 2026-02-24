import { render, screen } from "@testing-library/react";
import { ProjectCard } from "@/components/ui/project-card";
import type { Project } from "@/lib/types";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "test-123",
    name: "Test Project",
    description: "A test project description",
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

describe("ProjectCard description", () => {
  it("displays the project description when present", () => {
    const project = makeProject({ description: "My project does cool stuff" });
    render(<ProjectCard project={project} />);

    expect(screen.getByText("My project does cool stuff")).toBeInTheDocument();
  });

  it("shows 'No description' placeholder when description is empty", () => {
    const project = makeProject({ description: "" });
    render(<ProjectCard project={project} />);

    expect(screen.getByText("No description")).toBeInTheDocument();
  });

  it("applies line-clamp-3 class for truncation", () => {
    const project = makeProject({
      description: "A very long description that should be truncated after three lines of text to prevent overflow on the project card",
    });
    render(<ProjectCard project={project} />);

    const descEl = screen.getByText(/very long description/);
    expect(descEl.className).toContain("line-clamp-3");
  });
});
