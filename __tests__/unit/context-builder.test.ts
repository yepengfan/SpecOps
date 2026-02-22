import { buildProjectContext } from "@/lib/chat/context-builder";
import type { Project, Phase, PhaseType } from "@/lib/types";

function makePhase(type: PhaseType, sections: { title: string; content: string }[] = []): Phase {
  return {
    type,
    status: "draft",
    sections: sections.map((s, i) => ({ id: `${type}-${i}`, ...s })),
  };
}

function makeProject(overrides?: {
  spec?: { title: string; content: string }[];
  plan?: { title: string; content: string }[];
  tasks?: { title: string; content: string }[];
}): Project {
  return {
    id: "proj-1",
    name: "Test Project",
    description: "A test project",
    createdAt: 1000,
    updatedAt: 2000,
    phases: {
      spec: makePhase("spec", overrides?.spec ?? [
        { title: "Problem Statement", content: "Users need a dashboard." },
        { title: "Requirements", content: "- Must load in <2s\n- Must support 1000 users" },
      ]),
      plan: makePhase("plan", overrides?.plan ?? [
        { title: "Architecture", content: "Microservices with API gateway." },
        { title: "Data Model", content: "PostgreSQL with users table." },
      ]),
      tasks: makePhase("tasks", overrides?.tasks ?? [
        { title: "Sprint 1", content: "- Build auth module\n- Build dashboard" },
      ]),
    },
    traceabilityMappings: [],
  };
}

describe("buildProjectContext", () => {
  const project = makeProject();

  describe("phase filtering", () => {
    it("returns only spec sections when phaseType is spec", () => {
      const result = buildProjectContext(project, "spec");

      expect(result).toContain("Spec - Problem Statement");
      expect(result).toContain("Users need a dashboard.");
      expect(result).toContain("Spec - Requirements");

      expect(result).not.toContain("Plan");
      expect(result).not.toContain("Tasks");
    });

    it("returns spec and plan sections when phaseType is plan", () => {
      const result = buildProjectContext(project, "plan");

      expect(result).toContain("Spec - Problem Statement");
      expect(result).toContain("Plan - Architecture");
      expect(result).toContain("Plan - Data Model");

      expect(result).not.toContain("Tasks");
      expect(result).not.toContain("Sprint 1");
    });

    it("returns all three phases when phaseType is tasks", () => {
      const result = buildProjectContext(project, "tasks");

      expect(result).toContain("Spec - Problem Statement");
      expect(result).toContain("Spec - Requirements");
      expect(result).toContain("Plan - Architecture");
      expect(result).toContain("Plan - Data Model");
      expect(result).toContain("Tasks - Sprint 1");
      expect(result).toContain("Build auth module");
    });
  });

  describe("empty section handling", () => {
    it("omits sections with empty content", () => {
      const proj = makeProject({
        spec: [
          { title: "Problem Statement", content: "Has content." },
          { title: "Empty Section", content: "" },
        ],
      });

      const result = buildProjectContext(proj, "spec");

      expect(result).toContain("Spec - Problem Statement");
      expect(result).not.toContain("Empty Section");
    });

    it("returns empty string when all sections are empty", () => {
      const proj = makeProject({
        spec: [
          { title: "A", content: "" },
          { title: "B", content: "" },
        ],
        plan: [{ title: "C", content: "" }],
        tasks: [{ title: "D", content: "" }],
      });

      const result = buildProjectContext(proj, "tasks");

      expect(result).toBe("");
    });

    it("returns empty string when there are no sections at all", () => {
      const proj = makeProject({
        spec: [],
        plan: [],
        tasks: [],
      });

      const result = buildProjectContext(proj, "tasks");

      expect(result).toBe("");
    });
  });

  describe("section labeling", () => {
    it("labels each section with ## PhaseName - SectionTitle", () => {
      const result = buildProjectContext(project, "tasks");

      expect(result).toContain("## Spec - Problem Statement");
      expect(result).toContain("## Plan - Architecture");
      expect(result).toContain("## Tasks - Sprint 1");
    });

    it("places content on the line after the heading with a blank line separator", () => {
      const proj = makeProject({
        spec: [{ title: "Only Section", content: "Some content here." }],
        plan: [],
        tasks: [],
      });

      const result = buildProjectContext(proj, "spec");

      expect(result).toBe("## Spec - Only Section\n\nSome content here.");
    });
  });

  describe("block ordering and joining", () => {
    it("orders blocks by phase order: spec before plan before tasks", () => {
      const result = buildProjectContext(project, "tasks");

      const specIdx = result.indexOf("## Spec - Problem Statement");
      const planIdx = result.indexOf("## Plan - Architecture");
      const tasksIdx = result.indexOf("## Tasks - Sprint 1");

      expect(specIdx).toBeLessThan(planIdx);
      expect(planIdx).toBeLessThan(tasksIdx);
    });

    it("separates blocks with double newlines", () => {
      const proj = makeProject({
        spec: [
          { title: "A", content: "Content A" },
          { title: "B", content: "Content B" },
        ],
        plan: [],
        tasks: [],
      });

      const result = buildProjectContext(proj, "spec");

      expect(result).toBe(
        "## Spec - A\n\nContent A\n\n## Spec - B\n\nContent B",
      );
    });

    it("preserves section order within a phase", () => {
      const proj = makeProject({
        spec: [
          { title: "First", content: "1" },
          { title: "Second", content: "2" },
          { title: "Third", content: "3" },
        ],
        plan: [],
        tasks: [],
      });

      const result = buildProjectContext(proj, "spec");

      const firstIdx = result.indexOf("First");
      const secondIdx = result.indexOf("Second");
      const thirdIdx = result.indexOf("Third");

      expect(firstIdx).toBeLessThan(secondIdx);
      expect(secondIdx).toBeLessThan(thirdIdx);
    });
  });

  describe("multiline content", () => {
    it("preserves multiline content within a section", () => {
      const proj = makeProject({
        spec: [{ title: "Reqs", content: "- Req 1\n- Req 2\n- Req 3" }],
        plan: [],
        tasks: [],
      });

      const result = buildProjectContext(proj, "spec");

      expect(result).toBe("## Spec - Reqs\n\n- Req 1\n- Req 2\n- Req 3");
    });
  });
});
