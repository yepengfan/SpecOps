import { render, screen } from "@testing-library/react";
import { RuleChecklist } from "@/components/eval/rule-checklist";
import type { RuleCheckResult } from "@/lib/eval/types";

describe("RuleChecklist", () => {
  it("renders nothing when results array is empty", () => {
    const { container } = render(<RuleChecklist results={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders passing results with green checkmark", () => {
    const results: RuleCheckResult[] = [
      { id: "r1", name: "EARS Keywords", passed: true, explanation: "" },
    ];
    render(<RuleChecklist results={results} />);
    expect(screen.getByText("EARS Keywords")).toBeInTheDocument();
    expect(screen.getByLabelText("Passing")).toBeInTheDocument();
  });

  it("renders failing results with red X and explanation", () => {
    const results: RuleCheckResult[] = [
      {
        id: "r1",
        name: "Required Sections",
        passed: false,
        explanation: "Missing: Main Flow, Error Handling",
      },
    ];
    render(<RuleChecklist results={results} />);
    expect(screen.getByText("Required Sections")).toBeInTheDocument();
    expect(screen.getByLabelText("Failing")).toBeInTheDocument();
    expect(
      screen.getByText("Missing: Main Flow, Error Handling")
    ).toBeInTheDocument();
  });

  it("renders mixed pass/fail results correctly", () => {
    const results: RuleCheckResult[] = [
      { id: "r1", name: "Check A", passed: true, explanation: "" },
      {
        id: "r2",
        name: "Check B",
        passed: false,
        explanation: "Something failed",
      },
      { id: "r3", name: "Check C", passed: true, explanation: "" },
    ];
    render(<RuleChecklist results={results} />);
    expect(screen.getAllByLabelText("Passing")).toHaveLength(2);
    expect(screen.getAllByLabelText("Failing")).toHaveLength(1);
  });
});
