import {
  getDesignSystemPrompt,
  getRegenerateDesignSectionPrompt,
  parseDesignSections,
} from "@/lib/prompts/design";

describe("getDesignSystemPrompt", () => {
  const prompt = getDesignSystemPrompt();

  it("includes all 5 section headings", () => {
    expect(prompt).toContain("## Architecture");
    expect(prompt).toContain("## API Contracts");
    expect(prompt).toContain("## Data Model");
    expect(prompt).toContain("## Tech Decisions");
    expect(prompt).toContain("## Security & Edge Cases");
  });

  it("references requirements input", () => {
    expect(prompt).toMatch(/requirements/i);
  });
});

describe("getRegenerateDesignSectionPrompt", () => {
  it("includes the section name", () => {
    const prompt = getRegenerateDesignSectionPrompt("Architecture");
    expect(prompt).toContain("Architecture");
  });
});

describe("parseDesignSections", () => {
  const validInput = [
    "## Architecture",
    "Microservices with API gateway.",
    "",
    "## API Contracts",
    "REST endpoints for CRUD.",
    "",
    "## Data Model",
    "PostgreSQL with users and orders tables.",
    "",
    "## Tech Decisions",
    "Use TypeScript and Next.js.",
    "",
    "## Security & Edge Cases",
    "JWT auth, rate limiting.",
  ].join("\n");

  it("parses valid input into five sections", () => {
    const result = parseDesignSections(validInput);

    expect(result.malformed).toBe(false);
    expect(result.architecture).toBe("Microservices with API gateway.");
    expect(result.apiContracts).toBe("REST endpoints for CRUD.");
    expect(result.dataModel).toBe(
      "PostgreSQL with users and orders tables.",
    );
    expect(result.techDecisions).toBe("Use TypeScript and Next.js.");
    expect(result.securityEdgeCases).toBe("JWT auth, rate limiting.");
  });

  it("returns malformed when Architecture heading is missing", () => {
    const input = [
      "## API Contracts",
      "content",
      "## Data Model",
      "content",
      "## Tech Decisions",
      "content",
      "## Security & Edge Cases",
      "content",
    ].join("\n");

    const result = parseDesignSections(input);
    expect(result.malformed).toBe(true);
  });

  it("returns malformed when any heading is missing", () => {
    const input = [
      "## Architecture",
      "content",
      "## API Contracts",
      "content",
      "## Tech Decisions",
      "content",
      "## Security & Edge Cases",
      "content",
    ].join("\n");

    const result = parseDesignSections(input);
    expect(result.malformed).toBe(true);
  });

  it("returns malformed when headings are out of order", () => {
    const input = [
      "## Data Model",
      "content",
      "## Architecture",
      "content",
      "## API Contracts",
      "content",
      "## Tech Decisions",
      "content",
      "## Security & Edge Cases",
      "content",
    ].join("\n");

    const result = parseDesignSections(input);
    expect(result.malformed).toBe(true);
  });

  it("returns malformed for empty string", () => {
    const result = parseDesignSections("");
    expect(result.malformed).toBe(true);
  });

  it("trims whitespace from extracted content", () => {
    const input = [
      "## Architecture",
      "",
      "  Trimmed arch  ",
      "",
      "## API Contracts",
      "",
      "  Trimmed api  ",
      "",
      "## Data Model",
      "",
      "  Trimmed data  ",
      "",
      "## Tech Decisions",
      "",
      "  Trimmed tech  ",
      "",
      "## Security & Edge Cases",
      "",
      "  Trimmed security  ",
      "",
    ].join("\n");

    const result = parseDesignSections(input);

    expect(result.malformed).toBe(false);
    expect(result.architecture).toBe("Trimmed arch");
    expect(result.apiContracts).toBe("Trimmed api");
    expect(result.dataModel).toBe("Trimmed data");
    expect(result.techDecisions).toBe("Trimmed tech");
    expect(result.securityEdgeCases).toBe("Trimmed security");
  });

  it("handles multiline content within sections", () => {
    const input = [
      "## Architecture",
      "Line 1",
      "Line 2",
      "Line 3",
      "## API Contracts",
      "- Endpoint 1",
      "- Endpoint 2",
      "## Data Model",
      "Tables listed here",
      "## Tech Decisions",
      "Decision 1",
      "## Security & Edge Cases",
      "Edge case 1",
    ].join("\n");

    const result = parseDesignSections(input);

    expect(result.malformed).toBe(false);
    expect(result.architecture).toBe("Line 1\nLine 2\nLine 3");
  });
});
