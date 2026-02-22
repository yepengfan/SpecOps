import { db } from "@/lib/db/database";
import { createProject } from "@/lib/db/projects";

const mockUpdateProject = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
jest.mock("@/lib/db/projects", () => ({
  ...jest.requireActual("@/lib/db/projects"),
  updateProject: (...args: unknown[]) => mockUpdateProject(...args),
}));

// Import store after mock is set up
import { useProjectStore } from "@/lib/stores/project-store";

beforeEach(async () => {
  await db.projects.clear();
  useProjectStore.getState().clearProject();
  mockUpdateProject.mockClear();
  mockUpdateProject.mockResolvedValue(undefined);
});

afterAll(() => {
  db.close();
});

describe("approvePhase", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    useProjectStore.getState().cancelPendingSave();
    jest.useRealTimers();
  });

  it("sets spec to reviewed and unlocks plan", async () => {
    const project = await createProject("Test");
    // Fill all spec sections with content
    const filledProject = {
      ...project,
      phases: {
        ...project.phases,
        spec: {
          ...project.phases.spec,
          sections: project.phases.spec.sections.map((s) => ({
            ...s,
            content: "filled",
          })),
        },
      },
    };
    useProjectStore.getState().setProject(filledProject);

    useProjectStore.getState().approvePhase("spec");

    const current = useProjectStore.getState().currentProject!;
    expect(current.phases.spec.status).toBe("reviewed");
    expect(current.phases.plan.status).toBe("draft");
    expect(current.phases.tasks.status).toBe("locked");
  });

  it("sets plan to reviewed and unlocks tasks", async () => {
    const project = await createProject("Test");
    const filledProject = {
      ...project,
      phases: {
        ...project.phases,
        spec: {
          ...project.phases.spec,
          status: "reviewed" as const,
        },
        plan: {
          ...project.phases.plan,
          status: "draft" as const,
          sections: project.phases.plan.sections.map((s) => ({
            ...s,
            content: "filled",
          })),
        },
      },
    };
    useProjectStore.getState().setProject(filledProject);

    useProjectStore.getState().approvePhase("plan");

    const current = useProjectStore.getState().currentProject!;
    expect(current.phases.plan.status).toBe("reviewed");
    expect(current.phases.tasks.status).toBe("draft");
  });

  it("is blocked when any section is empty", async () => {
    const project = await createProject("Test");
    // Leave sections empty (default)
    useProjectStore.getState().setProject(project);

    useProjectStore.getState().approvePhase("spec");

    const current = useProjectStore.getState().currentProject!;
    expect(current.phases.spec.status).toBe("draft");
    expect(mockUpdateProject).not.toHaveBeenCalled();
  });

  it("saves immediately (not debounced)", async () => {
    const project = await createProject("Test");
    const filledProject = {
      ...project,
      phases: {
        ...project.phases,
        spec: {
          ...project.phases.spec,
          sections: project.phases.spec.sections.map((s) => ({
            ...s,
            content: "filled",
          })),
        },
      },
    };
    useProjectStore.getState().setProject(filledProject);

    useProjectStore.getState().approvePhase("spec");

    // Should be called immediately, before any timer advancement
    expect(mockUpdateProject).toHaveBeenCalledTimes(1);
  });
});

describe("editReviewedPhase", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    useProjectStore.getState().cancelPendingSave();
    jest.useRealTimers();
  });

  it("resets current phase to draft", async () => {
    const project = await createProject("Test");
    const reviewedProject = {
      ...project,
      phases: {
        ...project.phases,
        spec: {
          ...project.phases.spec,
          status: "reviewed" as const,
        },
        plan: {
          ...project.phases.plan,
          status: "draft" as const,
        },
      },
    };
    useProjectStore.getState().setProject(reviewedProject);

    useProjectStore.getState().editReviewedPhase("spec");

    const current = useProjectStore.getState().currentProject!;
    expect(current.phases.spec.status).toBe("draft");
  });

  it("cascades: resets all downstream phases to draft, preserves content", async () => {
    const project = await createProject("Test");
    const allReviewedProject = {
      ...project,
      phases: {
        spec: {
          ...project.phases.spec,
          status: "reviewed" as const,
          sections: project.phases.spec.sections.map((s) => ({
            ...s,
            content: "spec content",
          })),
        },
        plan: {
          ...project.phases.plan,
          status: "reviewed" as const,
          sections: project.phases.plan.sections.map((s) => ({
            ...s,
            content: "plan content",
          })),
        },
        tasks: {
          ...project.phases.tasks,
          status: "draft" as const,
          sections: project.phases.tasks.sections.map((s) => ({
            ...s,
            content: "task content",
          })),
        },
      },
    };
    useProjectStore.getState().setProject(allReviewedProject);

    useProjectStore.getState().editReviewedPhase("spec");

    const current = useProjectStore.getState().currentProject!;
    expect(current.phases.spec.status).toBe("draft");
    expect(current.phases.plan.status).toBe("draft");
    expect(current.phases.tasks.status).toBe("draft");
    // Content preserved
    expect(current.phases.plan.sections[0].content).toBe("plan content");
    expect(current.phases.tasks.sections[0].content).toBe("task content");
  });
});

describe("updateSection guards", () => {
  it("is a no-op when phase is reviewed", async () => {
    const project = await createProject("Test");
    const reviewedProject = {
      ...project,
      phases: {
        ...project.phases,
        spec: {
          ...project.phases.spec,
          status: "reviewed" as const,
          sections: project.phases.spec.sections.map((s) => ({
            ...s,
            content: "original",
          })),
        },
      },
    };
    useProjectStore.getState().setProject(reviewedProject);

    useProjectStore.getState().updateSection("spec", "problem-statement", "changed");

    const current = useProjectStore.getState().currentProject!;
    const section = current.phases.spec.sections.find(
      (s) => s.id === "problem-statement",
    );
    expect(section!.content).toBe("original");
  });
});
