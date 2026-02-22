import type { Project } from "@/lib/types";
import {
  getProjectDisplayStatus,
  getActivePhase,
  formatRelativeTime,
} from "@/lib/utils/project";

function makeProject(
  overrides: {
    requirements?: "locked" | "draft" | "reviewed";
    design?: "locked" | "draft" | "reviewed";
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
      requirements: {
        type: "requirements",
        status: overrides.requirements ?? "draft",
        sections: [],
      },
      design: {
        type: "design",
        status: overrides.design ?? "locked",
        sections: [],
      },
      tasks: {
        type: "tasks",
        status: overrides.tasks ?? "locked",
        sections: [],
      },
    },
  };
}

describe("getProjectDisplayStatus", () => {
  it('returns "Requirements" for a new project', () => {
    expect(getProjectDisplayStatus(makeProject())).toBe("Requirements");
  });

  it('returns "Design" when requirements reviewed', () => {
    expect(
      getProjectDisplayStatus(makeProject({ requirements: "reviewed" }))
    ).toBe("Design");
  });

  it('returns "Tasks" when requirements + design reviewed', () => {
    expect(
      getProjectDisplayStatus(
        makeProject({ requirements: "reviewed", design: "reviewed" })
      )
    ).toBe("Tasks");
  });

  it('returns "Complete" when all phases reviewed', () => {
    expect(
      getProjectDisplayStatus(
        makeProject({
          requirements: "reviewed",
          design: "reviewed",
          tasks: "reviewed",
        })
      )
    ).toBe("Complete");
  });

  it('returns "Design" when design is draft', () => {
    expect(
      getProjectDisplayStatus(
        makeProject({ requirements: "reviewed", design: "draft" })
      )
    ).toBe("Design");
  });
});

describe("getActivePhase", () => {
  it('returns "requirements" for a new project', () => {
    expect(getActivePhase(makeProject())).toBe("requirements");
  });

  it('returns "design" when requirements reviewed', () => {
    expect(getActivePhase(makeProject({ requirements: "reviewed" }))).toBe(
      "design"
    );
  });

  it('returns "tasks" when requirements + design reviewed', () => {
    expect(
      getActivePhase(
        makeProject({ requirements: "reviewed", design: "reviewed" })
      )
    ).toBe("tasks");
  });

  it('returns "tasks" when all phases reviewed', () => {
    expect(
      getActivePhase(
        makeProject({
          requirements: "reviewed",
          design: "reviewed",
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
