import { render, screen } from "@testing-library/react";
import { useProjectStore } from "@/lib/stores/project-store";
import type { Project, Phase } from "@/lib/types";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  usePathname: () => "/project/proj-1/spec",
}));

// Mock MarkdownRenderer to avoid react-markdown ESM issues
jest.mock("@/components/editor/markdown-renderer", () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <div>{content}</div>,
}));

import { GatedPhasePage } from "@/components/phase/gated-phase-page";

function makeProject(): Project {
  const sections = [
    { id: "sec-1", title: "Section One", content: "Content for section one" },
    { id: "sec-2", title: "Section Two", content: "Content for section two" },
  ];

  const spec: Phase = { type: "spec", status: "draft", sections };
  const plan: Phase = { type: "plan", status: "locked", sections: [] };
  const tasks: Phase = { type: "tasks", status: "locked", sections: [] };

  return {
    id: "proj-1",
    name: "Test Project",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: { spec, plan, tasks },
    traceabilityMappings: [],
  };
}

beforeEach(() => {
  useProjectStore.getState().clearProject();
});

describe("GatedPhasePage with animated collapsible", () => {
  it("renders sections with AnimatedCollapsibleContent", () => {
    useProjectStore.getState().setProject(makeProject());
    render(<GatedPhasePage phaseType="spec" />);

    // Both sections should be visible (open by default)
    expect(screen.getByText("Section One")).toBeInTheDocument();
    expect(screen.getByText("Section Two")).toBeInTheDocument();
  });

  it("renders section content when open (default state)", () => {
    useProjectStore.getState().setProject(makeProject());
    render(<GatedPhasePage phaseType="spec" />);

    // Content should be visible since sections are open by default
    expect(screen.getByText("Content for section one")).toBeInTheDocument();
    expect(screen.getByText("Content for section two")).toBeInTheDocument();
  });
});
