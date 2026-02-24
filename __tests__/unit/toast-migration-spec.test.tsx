import { render, screen, act } from "@testing-library/react";
import SpecPage from "@/app/project/[id]/spec/page";
import { useProjectStore } from "@/lib/stores/project-store";
import * as streamClient from "@/lib/api/stream-client";
import { toast } from "sonner";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock("@/lib/api/stream-client", () => ({
  streamGenerate: jest.fn(),
  StreamError: class StreamError extends Error {},
}));

jest.mock("@/components/phase/gated-phase-page", () => ({
  GatedPhasePage: () => <div data-testid="gated-phase-page" />,
}));

jest.mock("@/components/phase/workflow-indicator", () => ({
  WorkflowIndicator: () => <div data-testid="workflow-indicator" />,
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
          { id: "problem-statement", title: "Problem Statement", content: "" },
          { id: "ears-requirements", title: "EARS Requirements", content: "" },
          { id: "non-functional-requirements", title: "Non-Functional Requirements", content: "" },
        ],
      },
      plan: { type: "plan" as const, status: "locked" as const, sections: [] },
      tasks: { type: "tasks" as const, status: "locked" as const, sections: [] },
    },
    traceabilityMappings: [],
  };
}

describe("SpecPage toast migration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProjectStore.getState().setProject(makeProject());
  });

  it("shows toast.warning instead of inline banner when AI response is malformed", async () => {
    // Mock streamGenerate to return malformed content
    const mockStream = async function* () {
      yield "some raw text without sections";
    };
    (streamClient.streamGenerate as jest.Mock).mockReturnValue(mockStream());

    render(<SpecPage />);

    const textarea = screen.getByPlaceholderText(/describe your project/i);
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value"
      )?.set?.call(textarea, "A test project description that is long enough");
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const generateBtn = screen.getByRole("button", { name: /generate/i });
    await act(async () => {
      generateBtn.click();
    });

    // Should use toast.warning, not render an inline banner
    expect(toast.warning).toHaveBeenCalled();
    // Inline amber banner should NOT be in the DOM
    expect(
      screen.queryByText(/did not match the expected section format/i)
    ).not.toBeInTheDocument();
  });
});
