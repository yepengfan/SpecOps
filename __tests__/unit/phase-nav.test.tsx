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
  specStatus: "locked" | "draft" | "reviewed";
  planStatus: "locked" | "draft" | "reviewed";
  tasksStatus: "locked" | "draft" | "reviewed";
}>): Project {
  return {
    id: "proj-1",
    name: "Test",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: {
      spec: {
        type: "spec",
        status: overrides?.specStatus ?? "draft",
        sections: [],
      },
      plan: {
        type: "plan",
        status: overrides?.planStatus ?? "locked",
        sections: [],
      },
      tasks: {
        type: "tasks",
        status: overrides?.tasksStatus ?? "locked",
        sections: [],
      },
    },
    traceabilityMappings: [],
  };
}

beforeEach(() => {
  useProjectStore.getState().clearProject();
  mockUsePathname.mockReturnValue("/project/proj-1/spec");
});

describe("PhaseNav", () => {
  it("renders phase tabs plus traceability link", () => {
    useProjectStore.getState().setProject(makeProject());
    render(<PhaseNav projectId="proj-1" />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4); // 3 phases + traceability
  });

  it("locked tabs show lock icon and are not links", () => {
    useProjectStore.getState().setProject(makeProject());
    render(<PhaseNav projectId="proj-1" />);

    const tabs = screen.getAllByRole("tab");
    // Plan and Tasks are locked
    const planTab = tabs[1];
    const tasksTab = tabs[2];

    expect(planTab).toHaveAttribute("aria-disabled", "true");
    expect(tasksTab).toHaveAttribute("aria-disabled", "true");
    expect(planTab.tagName).not.toBe("A");
    expect(tasksTab.tagName).not.toBe("A");
  });

  it("reviewed tabs show check icon", () => {
    useProjectStore.getState().setProject(
      makeProject({ specStatus: "reviewed", planStatus: "draft" }),
    );
    render(<PhaseNav projectId="proj-1" />);

    const tabs = screen.getAllByRole("tab");
    const specTab = tabs[0];
    // The check icon should be present (lucide-react renders an svg)
    expect(specTab.querySelector("svg")).toBeInTheDocument();
  });

  it("active tab highlighted based on URL", () => {
    mockUsePathname.mockReturnValue("/project/proj-1/spec");
    useProjectStore.getState().setProject(makeProject());
    render(<PhaseNav projectId="proj-1" />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).not.toHaveAttribute("aria-selected", "true");
  });

  it("non-locked tabs are navigable links", () => {
    useProjectStore.getState().setProject(
      makeProject({ specStatus: "reviewed", planStatus: "draft" }),
    );
    render(<PhaseNav projectId="proj-1" />);

    const tabs = screen.getAllByRole("tab");
    // Spec (reviewed) and Plan (draft) should be links
    expect(tabs[0].tagName).toBe("A");
    expect(tabs[0]).toHaveAttribute("href", "/project/proj-1/spec");
    expect(tabs[1].tagName).toBe("A");
    expect(tabs[1]).toHaveAttribute("href", "/project/proj-1/plan");
  });
});
