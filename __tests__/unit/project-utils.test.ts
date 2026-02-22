import type { Project } from "@/lib/types";
import {
  getProjectDisplayStatus,
  getActivePhase,
  formatRelativeTime,
} from "@/lib/utils/project";

function makeProject(
  overrides: {
    spec?: "locked" | "draft" | "reviewed";
    plan?: "locked" | "draft" | "reviewed";
    tasks?: "locked" | "draft" | "reviewed";
  } = {}
): Project {
  return {
    id: "test-id",
    name: "Test",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    phases: {
      spec: {
        type: "spec",
        status: overrides.spec ?? "draft",
        sections: [],
      },
      plan: {
        type: "plan",
        status: overrides.plan ?? "locked",
        sections: [],
      },
      tasks: {
        type: "tasks",
        status: overrides.tasks ?? "locked",
        sections: [],
      },
    },
    traceabilityMappings: [],
  };
}

describe("getProjectDisplayStatus", () => {
  it('returns "Spec" for a new project', () => {
    expect(getProjectDisplayStatus(makeProject())).toBe("Spec");
  });

  it('returns "Plan" when spec reviewed', () => {
    expect(
      getProjectDisplayStatus(makeProject({ spec: "reviewed" }))
    ).toBe("Plan");
  });

  it('returns "Tasks" when spec + plan reviewed', () => {
    expect(
      getProjectDisplayStatus(
        makeProject({ spec: "reviewed", plan: "reviewed" })
      )
    ).toBe("Tasks");
  });

  it('returns "Complete" when all phases reviewed', () => {
    expect(
      getProjectDisplayStatus(
        makeProject({
          spec: "reviewed",
          plan: "reviewed",
          tasks: "reviewed",
        })
      )
    ).toBe("Complete");
  });

  it('returns "Plan" when plan is draft', () => {
    expect(
      getProjectDisplayStatus(
        makeProject({ spec: "reviewed", plan: "draft" })
      )
    ).toBe("Plan");
  });
});

describe("getActivePhase", () => {
  it('returns "spec" for a new project', () => {
    expect(getActivePhase(makeProject())).toBe("spec");
  });

  it('returns "plan" when spec reviewed', () => {
    expect(getActivePhase(makeProject({ spec: "reviewed" }))).toBe(
      "plan"
    );
  });

  it('returns "tasks" when spec + plan reviewed', () => {
    expect(
      getActivePhase(
        makeProject({ spec: "reviewed", plan: "reviewed" })
      )
    ).toBe("tasks");
  });

  it('returns "tasks" when all phases reviewed', () => {
    expect(
      getActivePhase(
        makeProject({
          spec: "reviewed",
          plan: "reviewed",
          tasks: "reviewed",
        })
      )
    ).toBe("tasks");
  });
});

describe("formatRelativeTime", () => {
  it('returns "just now" for future timestamps', () => {
    expect(formatRelativeTime(Date.now() + 10000)).toBe("just now");
  });

  it("returns seconds ago for recent timestamps", () => {
    const result = formatRelativeTime(Date.now() - 30 * 1000);
    expect(result).toMatch(/30 seconds ago/);
  });

  it("returns minutes ago", () => {
    const result = formatRelativeTime(Date.now() - 5 * 60 * 1000);
    expect(result).toMatch(/5 minutes ago/);
  });

  it("returns hours ago", () => {
    const result = formatRelativeTime(Date.now() - 3 * 60 * 60 * 1000);
    expect(result).toMatch(/3 hours ago/);
  });

  it("returns days ago", () => {
    const result = formatRelativeTime(Date.now() - 7 * 24 * 60 * 60 * 1000);
    expect(result).toMatch(/7 days ago/);
  });

  it("returns absolute date for 30+ days", () => {
    const old = new Date("2024-01-15").getTime();
    const result = formatRelativeTime(old);
    expect(result).toMatch(/Jan 15, 2024/);
  });
});
