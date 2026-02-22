import { render, screen, fireEvent } from "@testing-library/react";
import { useProjectStore } from "@/lib/stores/project-store";
import type { Project } from "@/lib/types";
import { PhaseNav } from "@/components/phase/phase-nav";

const mockPush = jest.fn();
const mockUsePathname = jest.fn<() => string>();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
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
  mockPush.mockClear();
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

  describe("keyboard navigation", () => {
    it("ArrowRight moves focus to next unlocked tab", () => {
      // spec=draft, plan+tasks locked → focusable: spec, traceability
      useProjectStore.getState().setProject(makeProject());
      render(<PhaseNav projectId="proj-1" />);

      const tablist = screen.getByRole("tablist");
      const focusableTabs = tablist.querySelectorAll<HTMLElement>(
        '[role="tab"]:not([aria-disabled="true"])',
      );

      // Focus first tab
      focusableTabs[0].focus();
      expect(document.activeElement).toBe(focusableTabs[0]);

      // ArrowRight → next focusable (traceability)
      fireEvent.keyDown(tablist, { key: "ArrowRight" });
      expect(document.activeElement).toBe(focusableTabs[1]);
    });

    it("ArrowLeft wraps from first to last", () => {
      useProjectStore.getState().setProject(
        makeProject({ specStatus: "reviewed", planStatus: "draft" }),
      );
      render(<PhaseNav projectId="proj-1" />);

      const tablist = screen.getByRole("tablist");
      const focusableTabs = tablist.querySelectorAll<HTMLElement>(
        '[role="tab"]:not([aria-disabled="true"])',
      );

      // Focus first tab
      focusableTabs[0].focus();

      // ArrowLeft from first → wraps to last
      fireEvent.keyDown(tablist, { key: "ArrowLeft" });
      expect(document.activeElement).toBe(
        focusableTabs[focusableTabs.length - 1],
      );
    });

    it("Home/End jump to first/last focusable tab", () => {
      useProjectStore.getState().setProject(
        makeProject({
          specStatus: "reviewed",
          planStatus: "draft",
          tasksStatus: "draft",
        }),
      );
      render(<PhaseNav projectId="proj-1" />);

      const tablist = screen.getByRole("tablist");
      const focusableTabs = tablist.querySelectorAll<HTMLElement>(
        '[role="tab"]:not([aria-disabled="true"])',
      );

      // Focus middle tab
      focusableTabs[1].focus();

      // End → last
      fireEvent.keyDown(tablist, { key: "End" });
      expect(document.activeElement).toBe(
        focusableTabs[focusableTabs.length - 1],
      );

      // Home → first
      fireEvent.keyDown(tablist, { key: "Home" });
      expect(document.activeElement).toBe(focusableTabs[0]);
    });

    it("locked tabs are skipped during arrow navigation", () => {
      // spec=draft, plan=locked, tasks=locked → only spec + traceability focusable
      useProjectStore.getState().setProject(makeProject());
      render(<PhaseNav projectId="proj-1" />);

      const tablist = screen.getByRole("tablist");
      const focusableTabs = tablist.querySelectorAll<HTMLElement>(
        '[role="tab"]:not([aria-disabled="true"])',
      );

      // Only spec + traceability should be focusable
      expect(focusableTabs).toHaveLength(2);

      focusableTabs[0].focus();
      fireEvent.keyDown(tablist, { key: "ArrowRight" });
      // Should jump straight to traceability, skipping locked plan/tasks
      expect(document.activeElement).toBe(focusableTabs[1]);
    });

    it("Enter activates the focused tab", () => {
      useProjectStore.getState().setProject(
        makeProject({ specStatus: "reviewed", planStatus: "draft" }),
      );
      render(<PhaseNav projectId="proj-1" />);

      const tablist = screen.getByRole("tablist");
      const focusableTabs = tablist.querySelectorAll<HTMLElement>(
        '[role="tab"]:not([aria-disabled="true"])',
      );

      // Focus the plan tab (second focusable)
      focusableTabs[1].focus();

      fireEvent.keyDown(tablist, { key: "Enter" });
      expect(mockPush).toHaveBeenCalledWith("/project/proj-1/plan");
    });
  });
});
