import {
  getTasksSystemPrompt,
  getRegenerateTaskSectionPrompt,
  parseTaskSections,
} from "@/lib/prompts/tasks";

describe("getTasksSystemPrompt", () => {
  const prompt = getTasksSystemPrompt();

  it("includes all 4 section headings", () => {
    expect(prompt).toContain("## Task List");
    expect(prompt).toContain("## Dependencies");
    expect(prompt).toContain("## File Mapping");
    expect(prompt).toContain("## Test Expectations");
  });

  it("references spec and plan input", () => {
    expect(prompt).toMatch(/spec/i);
    expect(prompt).toMatch(/plan/i);
  });
});

describe("getRegenerateTaskSectionPrompt", () => {
  it("includes the section name", () => {
    const prompt = getRegenerateTaskSectionPrompt("Task List");
    expect(prompt).toContain("Task List");
  });

  it("includes instruction when provided", () => {
    const prompt = getRegenerateTaskSectionPrompt("Task List", "Break into smaller tasks");
    expect(prompt).toContain("Architect's advice");
    expect(prompt).toContain("Break into smaller tasks");
  });

  it("does not include instruction block when not provided", () => {
    const prompt = getRegenerateTaskSectionPrompt("Task List");
    expect(prompt).not.toContain("Architect's advice");
  });
});

describe("parseTaskSections", () => {
  const validInput = [
    "## Task List",
    "- T001: Set up project structure",
    "- T002: Implement auth module",
    "",
    "## Dependencies",
    "T002 depends on T001",
    "",
    "## File Mapping",
    "T001 → src/index.ts, src/config.ts",
    "",
    "## Test Expectations",
    "T001: Unit tests for config loading",
  ].join("\n");

  it("parses valid input into four sections", () => {
    const result = parseTaskSections(validInput);

    expect(result.malformed).toBe(false);
    expect(result.taskList).toBe(
      "- T001: Set up project structure\n- T002: Implement auth module",
    );
    expect(result.dependencies).toBe("T002 depends on T001");
    expect(result.fileMapping).toBe("T001 → src/index.ts, src/config.ts");
    expect(result.testExpectations).toBe(
      "T001: Unit tests for config loading",
    );
  });

  it("returns malformed when a heading is missing", () => {
    const input = [
      "## Task List",
      "content",
      "## Dependencies",
      "content",
      "## File Mapping",
      "content",
    ].join("\n");

    const result = parseTaskSections(input);
    expect(result.malformed).toBe(true);
  });

  it("returns malformed when headings are out of order", () => {
    const input = [
      "## Dependencies",
      "content",
      "## Task List",
      "content",
      "## File Mapping",
      "content",
      "## Test Expectations",
      "content",
    ].join("\n");

    const result = parseTaskSections(input);
    expect(result.malformed).toBe(true);
  });

  it("returns malformed for empty string", () => {
    const result = parseTaskSections("");
    expect(result.malformed).toBe(true);
  });

  it("trims whitespace from extracted content", () => {
    const input = [
      "## Task List",
      "",
      "  Trimmed tasks  ",
      "",
      "## Dependencies",
      "",
      "  Trimmed deps  ",
      "",
      "## File Mapping",
      "",
      "  Trimmed files  ",
      "",
      "## Test Expectations",
      "",
      "  Trimmed tests  ",
      "",
    ].join("\n");

    const result = parseTaskSections(input);

    expect(result.malformed).toBe(false);
    expect(result.taskList).toBe("Trimmed tasks");
    expect(result.dependencies).toBe("Trimmed deps");
    expect(result.fileMapping).toBe("Trimmed files");
    expect(result.testExpectations).toBe("Trimmed tests");
  });

  it("handles multiline content within sections", () => {
    const input = [
      "## Task List",
      "- Task 1",
      "- Task 2",
      "- Task 3",
      "## Dependencies",
      "Dep content",
      "## File Mapping",
      "File content",
      "## Test Expectations",
      "Test content",
    ].join("\n");

    const result = parseTaskSections(input);

    expect(result.malformed).toBe(false);
    expect(result.taskList).toBe("- Task 1\n- Task 2\n- Task 3");
  });
});
