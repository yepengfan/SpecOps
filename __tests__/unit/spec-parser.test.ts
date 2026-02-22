import { getRegenerateSpecSectionPrompt, parseSpecSections } from "@/lib/prompts/spec";

describe("getRegenerateSpecSectionPrompt", () => {
  it("includes the section name", () => {
    const prompt = getRegenerateSpecSectionPrompt("EARS Requirements");
    expect(prompt).toContain("EARS Requirements");
  });

  it("includes instruction when provided", () => {
    const prompt = getRegenerateSpecSectionPrompt("EARS Requirements", "Focus on authentication");
    expect(prompt).toContain("Architect's advice");
    expect(prompt).toContain("Focus on authentication");
  });

  it("does not include instruction block when not provided", () => {
    const prompt = getRegenerateSpecSectionPrompt("EARS Requirements");
    expect(prompt).not.toContain("Architect's advice");
  });
});

describe("parseSpecSections", () => {
  const validInput = [
    "## Problem Statement",
    "The app needs to do X.",
    "",
    "## EARS Requirements",
    "- **FR-001**: WHEN user clicks, the system SHALL respond.",
    "",
    "## Non-Functional Requirements",
    "- **NFR-001**: The system SHALL respond within 200ms.",
  ].join("\n");

  it("parses valid input into three sections", () => {
    const result = parseSpecSections(validInput);

    expect(result.malformed).toBe(false);
    expect(result.problemStatement).toBe("The app needs to do X.");
    expect(result.earsRequirements).toBe(
      "- **FR-001**: WHEN user clicks, the system SHALL respond.",
    );
    expect(result.nonFunctionalRequirements).toBe(
      "- **NFR-001**: The system SHALL respond within 200ms.",
    );
  });

  it("returns malformed when Problem Statement heading is missing", () => {
    const input = [
      "## EARS Requirements",
      "content",
      "## Non-Functional Requirements",
      "content",
    ].join("\n");

    const result = parseSpecSections(input);
    expect(result.malformed).toBe(true);
  });

  it("returns malformed when EARS Requirements heading is missing", () => {
    const input = [
      "## Problem Statement",
      "content",
      "## Non-Functional Requirements",
      "content",
    ].join("\n");

    const result = parseSpecSections(input);
    expect(result.malformed).toBe(true);
  });

  it("returns malformed when Non-Functional Requirements heading is missing", () => {
    const input = [
      "## Problem Statement",
      "content",
      "## EARS Requirements",
      "content",
    ].join("\n");

    const result = parseSpecSections(input);
    expect(result.malformed).toBe(true);
  });

  it("returns malformed when headings are out of order", () => {
    const input = [
      "## EARS Requirements",
      "content",
      "## Problem Statement",
      "content",
      "## Non-Functional Requirements",
      "content",
    ].join("\n");

    const result = parseSpecSections(input);
    expect(result.malformed).toBe(true);
  });

  it("returns malformed for empty string", () => {
    const result = parseSpecSections("");
    expect(result.malformed).toBe(true);
  });

  it("returns malformed for plain text without headings", () => {
    const result = parseSpecSections(
      "Just some random text with no section headings.",
    );
    expect(result.malformed).toBe(true);
  });

  it("trims whitespace from extracted content", () => {
    const input = [
      "## Problem Statement",
      "",
      "  Trimmed content  ",
      "",
      "## EARS Requirements",
      "",
      "  More content  ",
      "",
      "## Non-Functional Requirements",
      "",
      "  Final content  ",
      "",
    ].join("\n");

    const result = parseSpecSections(input);

    expect(result.malformed).toBe(false);
    expect(result.problemStatement).toBe("Trimmed content");
    expect(result.earsRequirements).toBe("More content");
    expect(result.nonFunctionalRequirements).toBe("Final content");
  });

  it("handles multiline content within sections", () => {
    const input = [
      "## Problem Statement",
      "Line 1",
      "Line 2",
      "Line 3",
      "## EARS Requirements",
      "- FR-001: first",
      "- FR-002: second",
      "## Non-Functional Requirements",
      "- NFR-001: perf",
    ].join("\n");

    const result = parseSpecSections(input);

    expect(result.malformed).toBe(false);
    expect(result.problemStatement).toBe("Line 1\nLine 2\nLine 3");
  });
});
