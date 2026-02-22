import { db } from "@/lib/db/database";
import { createProject, getProject } from "@/lib/db/projects";
import { useProjectStore } from "@/lib/stores/project-store";
import type { PhaseType } from "@/lib/types";
import {
  SPEC_SECTIONS,
  PLAN_SECTIONS,
  TASKS_SECTIONS,
} from "@/lib/types/sections";

const SECTIONS_BY_PHASE: Record<PhaseType, readonly { id: string }[]> = {
  spec: SPEC_SECTIONS,
  plan: PLAN_SECTIONS,
  tasks: TASKS_SECTIONS,
};

/** Fill every section in a phase with non-empty content. */
function fillPhase(phaseType: PhaseType) {
  for (const section of SECTIONS_BY_PHASE[phaseType]) {
    useProjectStore
      .getState()
      .updateSection(phaseType, section.id, `Content for ${section.id}`);
  }
}

beforeEach(async () => {
  await db.projects.clear();
  useProjectStore.getState().clearProject();
});

afterAll(() => {
  db.close();
});

describe("Phase gate workflow integration", () => {
  it("full workflow: fill spec → approve → verify statuses → persisted", async () => {
    const project = await createProject("Workflow Test");
    useProjectStore.getState().setProject(project);

    // Fill spec sections
    fillPhase("spec");

    // Approve spec (uses immediate save)
    useProjectStore.getState().approvePhase("spec");

    const state = useProjectStore.getState().currentProject!;
    expect(state.phases.spec.status).toBe("reviewed");
    expect(state.phases.plan.status).toBe("draft");
    expect(state.phases.tasks.status).toBe("locked");

    // Verify persisted in Dexie
    const persisted = await getProject(project.id);
    expect(persisted!.phases.spec.status).toBe("reviewed");
    expect(persisted!.phases.plan.status).toBe("draft");
    expect(persisted!.phases.tasks.status).toBe("locked");
  });

  it("approve is blocked when a section is empty", async () => {
    const project = await createProject("Block Test");
    useProjectStore.getState().setProject(project);

    // Fill only 2 of 3 spec sections
    useProjectStore
      .getState()
      .updateSection("spec", "problem-statement", "Filled");
    useProjectStore
      .getState()
      .updateSection("spec", "ears-requirements", "Filled");
    // non-functional-requirements left empty

    useProjectStore.getState().approvePhase("spec");

    // Should still be draft
    expect(
      useProjectStore.getState().currentProject!.phases.spec.status,
    ).toBe("draft");
  });

  it("editReviewedPhase cascades: all phases → draft, content preserved", async () => {
    const project = await createProject("Cascade Test");
    useProjectStore.getState().setProject(project);

    // Fill and approve spec
    fillPhase("spec");
    useProjectStore.getState().approvePhase("spec");

    // Fill and approve plan
    fillPhase("plan");
    useProjectStore.getState().approvePhase("plan");

    // Fill tasks
    fillPhase("tasks");

    // Edit spec (cascade resets everything downstream)
    useProjectStore.getState().editReviewedPhase("spec");

    const state = useProjectStore.getState().currentProject!;
    expect(state.phases.spec.status).toBe("draft");
    expect(state.phases.plan.status).toBe("draft");
    expect(state.phases.tasks.status).toBe("draft");

    // Content preserved
    expect(
      state.phases.spec.sections.find((s) => s.id === "problem-statement")!
        .content,
    ).toBe("Content for problem-statement");
    expect(
      state.phases.plan.sections.find((s) => s.id === "architecture")!.content,
    ).toBe("Content for architecture");

    // Verify persisted in Dexie
    const persisted = await getProject(project.id);
    expect(persisted!.phases.spec.status).toBe("draft");
    expect(persisted!.phases.plan.status).toBe("draft");
    expect(persisted!.phases.tasks.status).toBe("draft");
  });

  it("editReviewedPhase on plan resets only plan+tasks, spec stays reviewed", async () => {
    const project = await createProject("Partial Cascade Test");
    useProjectStore.getState().setProject(project);

    // Fill and approve spec
    fillPhase("spec");
    useProjectStore.getState().approvePhase("spec");

    // Fill and approve plan
    fillPhase("plan");
    useProjectStore.getState().approvePhase("plan");

    // Edit plan (only plan+tasks reset)
    useProjectStore.getState().editReviewedPhase("plan");

    const state = useProjectStore.getState().currentProject!;
    expect(state.phases.spec.status).toBe("reviewed");
    expect(state.phases.plan.status).toBe("draft");
    expect(state.phases.tasks.status).toBe("draft");

    // Verify persisted
    const persisted = await getProject(project.id);
    expect(persisted!.phases.spec.status).toBe("reviewed");
    expect(persisted!.phases.plan.status).toBe("draft");
  });

  it("approvePhase uses immediate save (no timer flush needed)", async () => {
    jest.useFakeTimers();

    const project = await createProject("Immediate Save Test");
    useProjectStore.getState().setProject(project);

    fillPhase("spec");

    // Flush the debounced saves from fillPhase
    await jest.runAllTimersAsync();

    useProjectStore.getState().approvePhase("spec");

    // Should be persisted immediately without needing timer flush
    const persisted = await getProject(project.id);
    expect(persisted!.phases.spec.status).toBe("reviewed");

    jest.useRealTimers();
  });
});
