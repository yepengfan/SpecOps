import { parseRequirementsSections } from "@/lib/prompts/requirements";

describe("parseRequirementsSections", () => {
  const validInput = [
    "## Problem Statement",
    "The app needs to do X.",
    "",
    "## EARS Requirements",
    "- **REQ-1**: WHEN user clicks, the system SHALL respond.",
    "",
    "## Non-Functional Requirements",
    "- **NFR-1**: The system SHALL respond within 200ms.",
  ].join("\n");

  it("parses valid input into three sections", () => {
    const result = parseRequirementsSections(validInput);

    expect(result.malformed).toBe(false);
    expect(result.problemStatement).toBe("The app needs to do X.");
    expect(result.earsRequirements).toBe(
      "- **REQ-1**: WHEN user clicks, the system SHALL respond.",
    );
    expect(result.nonFunctionalRequirements).toBe(
      "- **NFR-1**: The system SHALL respond within 200ms.",
    );
  });

  it("returns malformed when Problem Statement heading is missing", () => {
    const input = [
      "## EARS Requirements",
      "content",
      "## Non-Functional Requirements",
      "content",
    ].join("\n");

    const result = parseRequirementsSections(input);
    expect(result.malformed).toBe(true);
  });

  it("returns malformed when EARS Requirements heading is missing", () => {
    const input = [
      "## Problem Statement",
      "content",
      "## Non-Functional Requirements",
      "content",
    ].join("\n");

    const result = parseRequirementsSections(input);
    expect(result.malformed).toBe(true);
  });

  it("returns malformed when Non-Functional Requirements heading is missing", () => {
    const input = [
      "## Problem Statement",
      "content",
      "## EARS Requirements",
      "content",
    ].join("\n");

    const result = parseRequirementsSections(input);
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

    const result = parseRequirementsSections(input);
    expect(result.malformed).toBe(true);
  });

  it("returns malformed for empty string", () => {
    const result = parseRequirementsSections("");
    expect(result.malformed).toBe(true);
  });

  it("returns malformed for plain text without headings", () => {
    const result = parseRequirementsSections(
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

    const result = parseRequirementsSections(input);

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
      "- REQ-1: first",
      "- REQ-2: second",
      "## Non-Functional Requirements",
      "- NFR-1: perf",
    ].join("\n");

    const result = parseRequirementsSections(input);

    expect(result.malformed).toBe(false);
    expect(result.problemStatement).toBe("Line 1\nLine 2\nLine 3");
  });
});
