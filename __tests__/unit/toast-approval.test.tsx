import { render, screen, act } from "@testing-library/react";
import { ApproveButton } from "@/components/phase/approve-button";
import { useProjectStore } from "@/lib/stores/project-store";
import { toast } from "sonner";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock("@/components/ui/live-region", () => ({
  LiveRegion: () => null,
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
          { id: "problem-statement", title: "Problem Statement", content: "filled" },
          { id: "ears-requirements", title: "EARS Requirements", content: "filled" },
          { id: "non-functional-requirements", title: "Non-Functional Requirements", content: "filled" },
        ],
      },
      plan: { type: "plan" as const, status: "locked" as const, sections: [] },
      tasks: { type: "tasks" as const, status: "locked" as const, sections: [] },
    },
    traceabilityMappings: [],
  };
}

describe("ApproveButton toast", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProjectStore.getState().setProject(makeProject());
  });

  it("shows toast.success when phase is approved", async () => {
    render(<ApproveButton phaseType="spec" />);

    const approveBtn = screen.getByRole("button", { name: /approve/i });
    await act(async () => {
      approveBtn.click();
    });

    expect(toast.success).toHaveBeenCalledWith("Spec phase approved");
  });
});
