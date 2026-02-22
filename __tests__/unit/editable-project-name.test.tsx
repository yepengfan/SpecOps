import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditableProjectName } from "@/components/ui/editable-project-name";
import { useProjectStore } from "@/lib/stores/project-store";
import type { Project } from "@/lib/types";

function makeProject(name: string): Project {
  return {
    id: "test-id",
    name,
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: {
      spec: { type: "spec", status: "draft", sections: [] },
      plan: { type: "plan", status: "locked", sections: [] },
      tasks: { type: "tasks", status: "locked", sections: [] },
    },
    traceabilityMappings: [],
  };
}

beforeEach(() => {
  useProjectStore.getState().clearProject();
});

describe("EditableProjectName", () => {
  it("renders project name as heading text", () => {
    useProjectStore.getState().setProject(makeProject("My Project"));
    render(<EditableProjectName />);
    expect(screen.getByText("My Project")).toBeInTheDocument();
  });

  it("renders nothing when no project is loaded", () => {
    const { container } = render(<EditableProjectName />);
    expect(container.firstChild).toBeNull();
  });

  it("enters edit mode on click and shows input pre-filled", async () => {
    const user = userEvent.setup();
    useProjectStore.getState().setProject(makeProject("My Project"));
    render(<EditableProjectName />);

    await user.click(screen.getByText("My Project"));
    const input = screen.getByLabelText("Project name");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("My Project");
  });

  it("saves on Enter and exits edit mode", async () => {
    const user = userEvent.setup();
    useProjectStore.getState().setProject(makeProject("Old Name"));
    render(<EditableProjectName />);

    await user.click(screen.getByText("Old Name"));
    const input = screen.getByLabelText("Project name");
    await user.clear(input);
    await user.type(input, "New Name{Enter}");

    // Should exit edit mode and show new name
    expect(screen.queryByLabelText("Project name")).not.toBeInTheDocument();
    expect(useProjectStore.getState().currentProject?.name).toBe("New Name");
  });

  it("saves on blur and exits edit mode", async () => {
    const user = userEvent.setup();
    useProjectStore.getState().setProject(makeProject("Old Name"));
    render(<EditableProjectName />);

    await user.click(screen.getByText("Old Name"));
    const input = screen.getByLabelText("Project name");
    await user.clear(input);
    await user.type(input, "Blurred Name");
    await user.tab(); // blur

    expect(screen.queryByLabelText("Project name")).not.toBeInTheDocument();
    expect(useProjectStore.getState().currentProject?.name).toBe("Blurred Name");
  });

  it("cancels on Escape and restores original name", async () => {
    const user = userEvent.setup();
    useProjectStore.getState().setProject(makeProject("Original"));
    render(<EditableProjectName />);

    await user.click(screen.getByText("Original"));
    const input = screen.getByLabelText("Project name");
    await user.clear(input);
    await user.type(input, "Changed");
    await user.keyboard("{Escape}");

    expect(screen.queryByLabelText("Project name")).not.toBeInTheDocument();
    expect(screen.getByText("Original")).toBeInTheDocument();
    expect(useProjectStore.getState().currentProject?.name).toBe("Original");
  });

  it("enters edit mode via keyboard (Enter on heading)", async () => {
    const user = userEvent.setup();
    useProjectStore.getState().setProject(makeProject("Keyboard Test"));
    render(<EditableProjectName />);

    const heading = screen.getByText("Keyboard Test");
    heading.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByLabelText("Project name")).toBeInTheDocument();
  });

  it("enters edit mode via keyboard (Space on heading)", async () => {
    const user = userEvent.setup();
    useProjectStore.getState().setProject(makeProject("Space Test"));
    render(<EditableProjectName />);

    const heading = screen.getByText("Space Test");
    heading.focus();
    await user.keyboard(" ");

    expect(screen.getByLabelText("Project name")).toBeInTheDocument();
  });

  // US2 validation tests
  it("restores original name when input is empty on Enter", async () => {
    const user = userEvent.setup();
    useProjectStore.getState().setProject(makeProject("Keep Me"));
    render(<EditableProjectName />);

    await user.click(screen.getByText("Keep Me"));
    const input = screen.getByLabelText("Project name");
    await user.clear(input);
    await user.keyboard("{Enter}");

    expect(screen.queryByLabelText("Project name")).not.toBeInTheDocument();
    expect(screen.getByText("Keep Me")).toBeInTheDocument();
    expect(useProjectStore.getState().currentProject?.name).toBe("Keep Me");
  });

  it("restores original name when input is whitespace-only on Enter", async () => {
    const user = userEvent.setup();
    useProjectStore.getState().setProject(makeProject("Keep Me Too"));
    render(<EditableProjectName />);

    await user.click(screen.getByText("Keep Me Too"));
    const input = screen.getByLabelText("Project name");
    await user.clear(input);
    await user.type(input, "   ");
    await user.keyboard("{Enter}");

    expect(screen.queryByLabelText("Project name")).not.toBeInTheDocument();
    expect(screen.getByText("Keep Me Too")).toBeInTheDocument();
    expect(useProjectStore.getState().currentProject?.name).toBe("Keep Me Too");
  });

  it("does not call renameProject when name is unchanged", async () => {
    const user = userEvent.setup();
    useProjectStore.getState().setProject(makeProject("Same Name"));
    render(<EditableProjectName />);

    await user.click(screen.getByText("Same Name"));
    await user.keyboard("{Enter}");

    expect(screen.queryByLabelText("Project name")).not.toBeInTheDocument();
    // Name unchanged — no save should have occurred
    expect(useProjectStore.getState().currentProject?.name).toBe("Same Name");
  });
});
