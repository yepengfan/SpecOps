import {
  buildDeepAnalysisPrompt,
  parseDeepAnalysisResponse,
} from "@/lib/prompts/deep-analysis";

describe("buildDeepAnalysisPrompt", () => {
  it("includes phase type and content in the prompt", () => {
    const { system, userMessage } = buildDeepAnalysisPrompt(
      "spec",
      "Some spec content"
    );
    expect(system).toContain("completeness");
    expect(system).toContain("testability");
    expect(system).toContain("unambiguity");
    expect(system).toContain("consistency");
    expect(system).toContain("actionability");
    expect(userMessage).toContain("spec");
    expect(userMessage).toContain("Some spec content");
  });

  it("includes rubric with scoring criteria", () => {
    const { system } = buildDeepAnalysisPrompt("plan", "Plan content");
    expect(system).toContain("1");
    expect(system).toContain("5");
  });

  it("includes upstream content when provided", () => {
    const { userMessage } = buildDeepAnalysisPrompt(
      "plan",
      "Plan content",
      "Spec content as upstream"
    );
    expect(userMessage).toContain("Spec content as upstream");
  });

  it("omits upstream section when not provided", () => {
    const { userMessage } = buildDeepAnalysisPrompt("spec", "Spec content");
    expect(userMessage).not.toContain("Upstream");
  });
});

describe("parseDeepAnalysisResponse", () => {
  it("extracts 5 dimensions with scores", () => {
    const raw = JSON.stringify({
      dimensions: [
        { dimension: "completeness", score: 4, rationale: "Good" },
        { dimension: "testability", score: 3, rationale: "Ok" },
        { dimension: "unambiguity", score: 5, rationale: "Great" },
        { dimension: "consistency", score: 4, rationale: "Good" },
        { dimension: "actionability", score: 3, rationale: "Ok" },
      ],
      suggestions: [
        { quote: "some text", issue: "vague", fix: "be specific" },
      ],
      crossPhaseFindings: null,
    });

    const result = parseDeepAnalysisResponse(raw);
    expect(result.dimensions).toHaveLength(5);
    expect(result.dimensions[0].score).toBe(4);
    expect(result.suggestions).toHaveLength(1);
    expect(result.crossPhaseFindings).toBeNull();
  });

  it("extracts cross-phase findings when present", () => {
    const raw = JSON.stringify({
      dimensions: [
        { dimension: "completeness", score: 4, rationale: "Good" },
        { dimension: "testability", score: 3, rationale: "Ok" },
        { dimension: "unambiguity", score: 5, rationale: "Great" },
        { dimension: "consistency", score: 4, rationale: "Good" },
        { dimension: "actionability", score: 3, rationale: "Ok" },
      ],
      suggestions: [],
      crossPhaseFindings: {
        summary: "Good coverage",
        coveredItems: ["REQ-1", "REQ-2"],
        uncoveredItems: ["REQ-3"],
      },
    });

    const result = parseDeepAnalysisResponse(raw);
    expect(result.crossPhaseFindings).not.toBeNull();
    expect(result.crossPhaseFindings!.coveredItems).toHaveLength(2);
    expect(result.crossPhaseFindings!.uncoveredItems).toHaveLength(1);
  });

  it("handles malformed JSON gracefully", () => {
    expect(() => parseDeepAnalysisResponse("not json")).toThrow();
  });

  it("handles JSON wrapped in markdown code fences", () => {
    const json = JSON.stringify({
      dimensions: [
        { dimension: "completeness", score: 4, rationale: "Good" },
        { dimension: "testability", score: 3, rationale: "Ok" },
        { dimension: "unambiguity", score: 5, rationale: "Great" },
        { dimension: "consistency", score: 4, rationale: "Good" },
        { dimension: "actionability", score: 3, rationale: "Ok" },
      ],
      suggestions: [],
      crossPhaseFindings: null,
    });
    const raw = "```json\n" + json + "\n```";

    const result = parseDeepAnalysisResponse(raw);
    expect(result.dimensions).toHaveLength(5);
  });

  it("clamps scores to 1-5 range", () => {
    const raw = JSON.stringify({
      dimensions: [
        { dimension: "completeness", score: 0, rationale: "Bad" },
        { dimension: "testability", score: 6, rationale: "Max" },
        { dimension: "unambiguity", score: 3, rationale: "Ok" },
        { dimension: "consistency", score: 3, rationale: "Ok" },
        { dimension: "actionability", score: 3, rationale: "Ok" },
      ],
      suggestions: [],
      crossPhaseFindings: null,
    });

    const result = parseDeepAnalysisResponse(raw);
    expect(result.dimensions[0].score).toBe(1);
    expect(result.dimensions[1].score).toBe(5);
  });
});
