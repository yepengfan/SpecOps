import { render, screen } from "@testing-library/react";
import { SectionEditor } from "@/components/editor/section-editor";
import { useProjectStore } from "@/lib/stores/project-store";

jest.mock("@/components/editor/markdown-renderer", () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <div>{content}</div>,
}));

function makeProject() {
  return {
    id: "test-123",
    name: "Test",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: {
      spec: {
        type: "spec" as const,
        status: "draft" as const,
        sections: [
          { id: "problem-statement", title: "Problem Statement", content: "some content" },
        ],
      },
      plan: { type: "plan" as const, status: "locked" as const, sections: [] },
      tasks: { type: "tasks" as const, status: "locked" as const, sections: [] },
    },
    traceabilityMappings: [],
  };
}

describe("SectionEditor skeleton loader", () => {
  beforeEach(() => {
    useProjectStore.getState().setProject(makeProject());
  });

  it("shows skeleton loaders when isRegenerating is true", () => {
    const { container } = render(
      <SectionEditor
        phaseType="spec"
        sectionId="problem-statement"
        title="Problem Statement"
        content="some content"
        isRegenerating={true}
      />
    );

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it("does not show skeleton loaders when isRegenerating is false", () => {
    const { container } = render(
      <SectionEditor
        phaseType="spec"
        sectionId="problem-statement"
        title="Problem Statement"
        content="some content"
        isRegenerating={false}
      />
    );

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons).toHaveLength(0);
  });

  it("shows status text above skeletons when regenerating", () => {
    render(
      <SectionEditor
        phaseType="spec"
        sectionId="problem-statement"
        title="Problem Statement"
        content="some content"
        isRegenerating={true}
      />
    );

    expect(screen.getByText(/regenerating/i)).toBeInTheDocument();
  });
});
