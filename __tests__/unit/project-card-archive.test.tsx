import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProjectCard } from "@/components/ui/project-card";
import { archiveProject, unarchiveProject } from "@/lib/db/projects";
import { toast } from "sonner";
import type { Project } from "@/lib/types";

jest.mock("@/lib/db/projects", () => ({
  deleteProject: jest.fn(),
  archiveProject: jest.fn().mockResolvedValue(undefined),
  unarchiveProject: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn() },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "test-id",
    name: "Test Project",
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ProjectCard — archive functionality", () => {
  it("renders archive button for active projects", () => {
    render(<ProjectCard project={makeProject()} />);
    expect(
      screen.getByRole("button", { name: /archive test project/i }),
    ).toBeInTheDocument();
  });

  it("calls archiveProject when archive button is clicked", async () => {
    render(<ProjectCard project={makeProject()} />);
    fireEvent.click(
      screen.getByRole("button", { name: /archive test project/i }),
    );
    await waitFor(() => {
      expect(archiveProject).toHaveBeenCalledWith("test-id");
    });
  });

  it("shows archived visual indicator for archived projects", () => {
    const archived = makeProject({ archivedAt: Date.now() });
    render(<ProjectCard project={archived} />);
    const article = screen.getByRole("article");
    expect(article.className).toContain("opacity");
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("renders unarchive button for archived projects", () => {
    const archived = makeProject({ archivedAt: Date.now() });
    render(<ProjectCard project={archived} />);
    expect(
      screen.getByRole("button", { name: /unarchive test project/i }),
    ).toBeInTheDocument();
  });

  it("calls unarchiveProject when unarchive button is clicked", async () => {
    const archived = makeProject({ archivedAt: Date.now() });
    render(<ProjectCard project={archived} />);
    fireEvent.click(
      screen.getByRole("button", { name: /unarchive test project/i }),
    );
    await waitFor(() => {
      expect(unarchiveProject).toHaveBeenCalledWith("test-id");
    });
  });

  it("shows toast on archive", async () => {
    render(<ProjectCard project={makeProject()} />);
    fireEvent.click(
      screen.getByRole("button", { name: /archive test project/i }),
    );
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Project archived");
    });
  });

  it("shows toast on unarchive", async () => {
    const archived = makeProject({ archivedAt: Date.now() });
    render(<ProjectCard project={archived} />);
    fireEvent.click(
      screen.getByRole("button", { name: /unarchive test project/i }),
    );
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Project restored");
    });
  });
});
