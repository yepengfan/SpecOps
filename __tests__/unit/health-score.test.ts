import { computeHealthScore } from "@/lib/utils/project";
import type { Project } from "@/lib/types";
import type { PhaseEvaluation } from "@/lib/eval/types";

function makeProject(evaluations?: Project["evaluations"]): Project {
  return {
    id: "test",
    name: "Test",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: {
      spec: { type: "spec", status: "draft", sections: [] },
      plan: { type: "plan", status: "locked", sections: [] },
      tasks: { type: "tasks", status: "locked", sections: [] },
    },
    traceabilityMappings: [],
    evaluations,
  };
}

function makeEval(results: { passed: boolean }[]): PhaseEvaluation {
  return {
    contentHash: "abc",
    ruleResults: results.map((r, i) => ({
      id: `r${i}`,
      name: `Check ${i}`,
      passed: r.passed,
      explanation: r.passed ? "" : "fail",
    })),
    deepAnalysis: null,
    evaluatedAt: Date.now(),
  };
}

describe("computeHealthScore", () => {
  it("returns null when project has no evaluations", () => {
    const project = makeProject();
    expect(computeHealthScore(project)).toBeNull();
  });

  it("returns null when evaluations is undefined", () => {
    const project = makeProject(undefined);
    expect(computeHealthScore(project)).toBeNull();
  });

  it("returns null when evaluations exist but all have empty ruleResults", () => {
    const project = makeProject({
      spec: makeEval([]),
    });
    expect(computeHealthScore(project)).toBeNull();
  });

  it("counts passing and total from a single phase", () => {
    const project = makeProject({
      spec: makeEval([{ passed: true }, { passed: false }, { passed: true }]),
    });
    const score = computeHealthScore(project);
    expect(score).toEqual({ passed: 2, total: 3 });
  });

  it("aggregates across multiple phases", () => {
    const project = makeProject({
      spec: makeEval([{ passed: true }, { passed: true }]),
      plan: makeEval([{ passed: false }, { passed: true }]),
      tasks: makeEval([{ passed: true }]),
    });
    const score = computeHealthScore(project);
    expect(score).toEqual({ passed: 4, total: 5 });
  });

  it("handles partial evaluations (only some phases evaluated)", () => {
    const project = makeProject({
      spec: makeEval([{ passed: true }]),
    });
    const score = computeHealthScore(project);
    expect(score).toEqual({ passed: 1, total: 1 });
  });
});
