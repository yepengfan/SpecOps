import { render } from "@testing-library/react";
import { MatrixTable } from "@/components/traceability/matrix-table";
import type { Project } from "@/lib/types";

function makeProject(): Project {
  return {
    id: "test-123",
    name: "Test",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: {
      spec: {
        type: "spec",
        status: "reviewed",
        sections: [
          {
            id: "ears-requirements",
            title: "EARS Requirements",
            content: "**FR-001**: The system shall do X\n\n**FR-002**: The system shall do Y",
          },
          { id: "problem-statement", title: "Problem Statement", content: "test" },
          { id: "non-functional-requirements", title: "Non-Functional Requirements", content: "" },
        ],
      },
      plan: {
        type: "plan",
        status: "reviewed",
        sections: [
          { id: "architecture", title: "Architecture", content: "test" },
          { id: "api-contracts", title: "API Contracts", content: "" },
          { id: "data-model", title: "Data Model", content: "" },
          { id: "tech-decisions", title: "Tech Decisions", content: "" },
          { id: "security-edge-cases", title: "Security & Edge Cases", content: "" },
        ],
      },
      tasks: {
        type: "tasks",
        status: "reviewed",
        sections: [
          { id: "task-list", title: "Task List", content: "test" },
          { id: "dependencies", title: "Dependencies", content: "" },
          { id: "file-mapping", title: "File Mapping", content: "" },
          { id: "test-expectations", title: "Test Expectations", content: "" },
        ],
      },
    },
    traceabilityMappings: [],
  };
}

describe("MatrixTable sticky column", () => {
  it("applies sticky left-0 classes to first column header", () => {
    const project = makeProject();
    const { container } = render(<MatrixTable project={project} />);

    const firstTh = container.querySelector("thead tr th:first-child");
    expect(firstTh).toBeDefined();
    expect(firstTh!.className).toContain("sticky");
    expect(firstTh!.className).toContain("left-0");
  });

  it("applies sticky left-0 classes to first column data cells", () => {
    const project = makeProject();
    const { container } = render(<MatrixTable project={project} />);

    const firstTds = container.querySelectorAll("tbody tr td:first-child");
    expect(firstTds.length).toBeGreaterThan(0);
    firstTds.forEach((td) => {
      expect(td.className).toContain("sticky");
      expect(td.className).toContain("left-0");
    });
  });

  it("applies z-10 to sticky cells for layering", () => {
    const project = makeProject();
    const { container } = render(<MatrixTable project={project} />);

    const firstTh = container.querySelector("thead tr th:first-child");
    expect(firstTh!.className).toContain("z-10");
  });
});
