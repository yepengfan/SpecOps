import {
  SPEC_SECTIONS,
  PLAN_SECTIONS,
  TASKS_SECTIONS,
  getSectionsForPhase,
} from "@/lib/types/sections";

describe("SPEC_SECTIONS", () => {
  it("has 3 sections", () => {
    expect(SPEC_SECTIONS).toHaveLength(3);
  });

  it("contains expected section ids", () => {
    const ids = SPEC_SECTIONS.map((s) => s.id);
    expect(ids).toEqual([
      "problem-statement",
      "ears-requirements",
      "non-functional-requirements",
    ]);
  });

  it("all sections have id, title, and empty content", () => {
    for (const section of SPEC_SECTIONS) {
      expect(section.id).toBeTruthy();
      expect(section.title).toBeTruthy();
      expect(section.content).toBe("");
    }
  });
});

describe("PLAN_SECTIONS", () => {
  it("has 5 sections", () => {
    expect(PLAN_SECTIONS).toHaveLength(5);
  });

  it("contains expected section ids", () => {
    const ids = PLAN_SECTIONS.map((s) => s.id);
    expect(ids).toEqual([
      "architecture",
      "api-contracts",
      "data-model",
      "tech-decisions",
      "security-edge-cases",
    ]);
  });

  it("all sections have id, title, and empty content", () => {
    for (const section of PLAN_SECTIONS) {
      expect(section.id).toBeTruthy();
      expect(section.title).toBeTruthy();
      expect(section.content).toBe("");
    }
  });
});

describe("TASKS_SECTIONS", () => {
  it("has 4 sections", () => {
    expect(TASKS_SECTIONS).toHaveLength(4);
  });

  it("contains expected section ids", () => {
    const ids = TASKS_SECTIONS.map((s) => s.id);
    expect(ids).toEqual([
      "task-list",
      "dependencies",
      "file-mapping",
      "test-expectations",
    ]);
  });

  it("all sections have id, title, and empty content", () => {
    for (const section of TASKS_SECTIONS) {
      expect(section.id).toBeTruthy();
      expect(section.title).toBeTruthy();
      expect(section.content).toBe("");
    }
  });
});

describe("getSectionsForPhase", () => {
  it("returns sections for spec phase", () => {
    const sections = getSectionsForPhase("spec");
    expect(sections).toHaveLength(3);
    expect(sections[0].id).toBe("problem-statement");
  });

  it("returns sections for plan phase", () => {
    const sections = getSectionsForPhase("plan");
    expect(sections).toHaveLength(5);
    expect(sections[0].id).toBe("architecture");
  });

  it("returns sections for tasks phase", () => {
    const sections = getSectionsForPhase("tasks");
    expect(sections).toHaveLength(4);
    expect(sections[0].id).toBe("task-list");
  });

  it("returns deep copies (mutations do not affect templates)", () => {
    const sections = getSectionsForPhase("spec");
    sections[0].content = "mutated";
    const fresh = getSectionsForPhase("spec");
    expect(fresh[0].content).toBe("");
  });
});
