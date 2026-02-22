import { db } from "@/lib/db/database";
import { createProject, getProject } from "@/lib/db/projects";
import { useProjectStore } from "@/lib/stores/project-store";
import { computePhaseHash } from "@/lib/eval/hash";
import {
  setEvaluation,
  getEvaluation,
  clearEvaluation,
} from "@/lib/db/evaluations";
import { evaluateSpec } from "@/lib/eval/rules";
import type { PhaseEvaluation } from "@/lib/eval/types";

beforeEach(async () => {
  await db.projects.clear();
  useProjectStore.getState().clearProject();
});

afterAll(() => {
  db.close();
});

describe("Evaluation persistence and invalidation", () => {
  it("full lifecycle: evaluate → persist → reload → verify → edit → invalidate", async () => {
    jest.useFakeTimers();

    // Create project and fill spec content
    const project = await createProject("Eval Test");
    useProjectStore.getState().setProject(project);
    useProjectStore
      .getState()
      .updateSection(
        "spec",
        "problem-statement",
        "## Requirements\n- **FR-001**: System SHALL display login WHEN user navigates\n\n## Priority\nHigh\n\n## Rationale\nNeeded\n\n## Main Flow\n1. Login\n\n## Validation Rules\n- Valid\n\n## Error Handling\n- Error\n\n## Performance\n- 2 seconds"
      );
    await jest.runAllTimersAsync();

    // Load persisted project
    let persisted = await getProject(project.id);
    expect(persisted).toBeDefined();

    // Evaluate spec
    const phase = persisted!.phases.spec;
    const content = phase.sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n");
    const ruleResults = evaluateSpec(content);
    const contentHash = computePhaseHash(phase.sections);

    const evaluation: PhaseEvaluation = {
      contentHash,
      ruleResults,
      deepAnalysis: null,
      evaluatedAt: Date.now(),
    };

    // Persist evaluation
    const withEval = setEvaluation(persisted!, "spec", evaluation);
    const { updateProject } = await import("@/lib/db/projects");
    await updateProject(withEval);

    // Reload and verify results present
    persisted = await getProject(project.id);
    const storedEval = getEvaluation(persisted!, "spec");
    expect(storedEval).toBeDefined();
    expect(storedEval!.ruleResults.length).toBeGreaterThan(0);
    expect(storedEval!.contentHash).toBe(contentHash);

    // Edit content — should invalidate on debounced save
    useProjectStore.getState().setProject(persisted!);
    useProjectStore
      .getState()
      .updateSection("spec", "problem-statement", "Changed content completely");
    await jest.runAllTimersAsync();

    // Verify results cleared
    persisted = await getProject(project.id);
    const clearedEval = getEvaluation(persisted!, "spec");
    expect(clearedEval).toBeUndefined();

    jest.useRealTimers();
  });

  it("clearEvaluation removes only the target phase", async () => {
    const project = await createProject("Multi Phase");

    const specEval: PhaseEvaluation = {
      contentHash: "abc",
      ruleResults: [{ id: "r1", name: "Test", passed: true, explanation: "" }],
      deepAnalysis: null,
      evaluatedAt: Date.now(),
    };

    const planEval: PhaseEvaluation = {
      contentHash: "def",
      ruleResults: [{ id: "r2", name: "Test", passed: false, explanation: "fail" }],
      deepAnalysis: null,
      evaluatedAt: Date.now(),
    };

    let updated = setEvaluation(project, "spec", specEval);
    updated = setEvaluation(updated, "plan", planEval);

    expect(getEvaluation(updated, "spec")).toBeDefined();
    expect(getEvaluation(updated, "plan")).toBeDefined();

    // Clear spec only
    const cleared = clearEvaluation(updated, "spec");
    expect(getEvaluation(cleared, "spec")).toBeUndefined();
    expect(getEvaluation(cleared, "plan")).toBeDefined();
  });

  it("setEvaluation preserves other phase evaluations", async () => {
    const project = await createProject("Preserve Test");

    const specEval: PhaseEvaluation = {
      contentHash: "abc",
      ruleResults: [],
      deepAnalysis: null,
      evaluatedAt: Date.now(),
    };

    const planEval: PhaseEvaluation = {
      contentHash: "def",
      ruleResults: [],
      deepAnalysis: null,
      evaluatedAt: Date.now(),
    };

    let updated = setEvaluation(project, "spec", specEval);
    updated = setEvaluation(updated, "plan", planEval);

    // Both should exist
    expect(getEvaluation(updated, "spec")?.contentHash).toBe("abc");
    expect(getEvaluation(updated, "plan")?.contentHash).toBe("def");
  });
});
