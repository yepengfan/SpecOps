import { render, screen } from "@testing-library/react";
import { useProjectStore } from "@/lib/stores/project-store";
import type { Project } from "@/lib/types";
import { PhaseNav } from "@/components/phase/phase-nav";

const mockUsePathname = jest.fn<() => string>();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => mockUsePathname(),
}));

function makeProject(overrides?: Partial<{
  reqStatus: "locked" | "draft" | "reviewed";
  designStatus: "locked" | "draft" | "reviewed";
  tasksStatus: "locked" | "draft" | "reviewed";
}>): Project {
  return {
    id: "proj-1",
    name: "Test",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: {
      requirements: {
        type: "requirements",
        status: overrides?.reqStatus ?? "draft",
        sections: [],
      },
      design: {
        type: "design",
        status: overrides?.designStatus ?? "locked",
        sections: [],
      },
      tasks: {
        type: "tasks",
        status: overrides?.tasksStatus ?? "locked",
        sections: [],
      },
    },
  };
}

beforeEach(() => {
  useProjectStore.getState().clearProject();
  mockUsePathname.mockReturnValue("/project/proj-1/requirements");
});

describe("PhaseNav", () => {
  it("renders three tabs", () => {
    useProjectStore.getState().setProject(makeProject());
    render(<PhaseNav projectId="proj-1" />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("locked tabs show lock icon and are not links", () => {
    useProjectStore.getState().setProject(makeProject());
    render(<PhaseNav projectId="proj-1" />);

    const tabs = screen.getAllByRole("tab");
    // Design and Tasks are locked
    const designTab = tabs[1];
    const tasksTab = tabs[2];

    expect(designTab).toHaveAttribute("aria-disabled", "true");
    expect(tasksTab).toHaveAttribute("aria-disabled", "true");
    expect(designTab.tagName).not.toBe("A");
    expect(tasksTab.tagName).not.toBe("A");
  });

  it("reviewed tabs show check icon", () => {
    useProjectStore.getState().setProject(
      makeProject({ reqStatus: "reviewed", designStatus: "draft" }),
    );
    render(<PhaseNav projectId="proj-1" />);

    const tabs = screen.getAllByRole("tab");
    const reqTab = tabs[0];
    // The check icon should be present (lucide-react renders an svg)
    expect(reqTab.querySelector("svg")).toBeInTheDocument();
  });

  it("active tab highlighted based on URL", () => {
    mockUsePathname.mockReturnValue("/project/proj-1/requirements");
    useProjectStore.getState().setProject(makeProject());
    render(<PhaseNav projectId="proj-1" />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).not.toHaveAttribute("aria-selected", "true");
  });

  it("non-locked tabs are navigable links", () => {
    useProjectStore.getState().setProject(
      makeProject({ reqStatus: "reviewed", designStatus: "draft" }),
    );
    render(<PhaseNav projectId="proj-1" />);

    const tabs = screen.getAllByRole("tab");
    // Requirements (reviewed) and Design (draft) should be links
    expect(tabs[0].tagName).toBe("A");
    expect(tabs[0]).toHaveAttribute("href", "/project/proj-1/requirements");
    expect(tabs[1].tagName).toBe("A");
    expect(tabs[1]).toHaveAttribute("href", "/project/proj-1/design");
  });
});
