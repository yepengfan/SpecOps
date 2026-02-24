import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportPanel } from "@/components/phase/export-panel";
import { useProjectStore } from "@/lib/stores/project-store";
import { toast } from "sonner";
import * as zipExport from "@/lib/export/zip";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock("@/lib/export/zip", () => ({
  downloadProjectZip: jest.fn().mockResolvedValue(undefined),
  downloadFile: jest.fn(),
}));

jest.mock("@/lib/export/markdown", () => ({
  generateMarkdown: jest.fn().mockReturnValue({
    spec: "# Spec",
    plan: "# Plan",
    tasks: "# Tasks",
  }),
}));

function makeProject() {
  return {
    id: "test-123",
    name: "Test",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: {
      spec: { type: "spec" as const, status: "reviewed" as const, sections: [{ id: "s1", title: "S1", content: "c" }] },
      plan: { type: "plan" as const, status: "reviewed" as const, sections: [{ id: "s1", title: "S1", content: "c" }] },
      tasks: { type: "tasks" as const, status: "reviewed" as const, sections: [{ id: "s1", title: "S1", content: "c" }] },
    },
    traceabilityMappings: [],
  };
}

describe("ExportPanel toast feedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProjectStore.getState().setProject(makeProject());
  });

  it("shows success toast after ZIP export", async () => {
    const user = userEvent.setup();
    render(<ExportPanel />);

    const zipBtn = screen.getByRole("button", { name: /export zip/i });
    await user.click(zipBtn);

    expect(toast.success).toHaveBeenCalledWith("All phases exported as ZIP");
  });

  it("shows success toast after single phase export", async () => {
    const user = userEvent.setup();
    render(<ExportPanel />);

    const specBtn = screen.getByRole("button", { name: /spec/i });
    await user.click(specBtn);

    expect(toast.success).toHaveBeenCalledWith("Spec exported successfully");
  });

  it("shows error toast when ZIP export fails", async () => {
    (zipExport.downloadProjectZip as jest.Mock).mockRejectedValueOnce(
      new Error("Export failed")
    );

    const user = userEvent.setup();
    render(<ExportPanel />);

    const zipBtn = screen.getByRole("button", { name: /export zip/i });
    await user.click(zipBtn);

    expect(toast.error).toHaveBeenCalledWith("Export failed: Export failed");
  });
});
