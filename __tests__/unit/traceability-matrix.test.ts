import {
  parseTraceabilityComment,
  parseReanalyzeResponse,
} from "@/lib/prompts/traceability";

describe("parseTraceabilityComment", () => {
  it("extracts mappings from a TRACEABILITY HTML comment", () => {
    const raw = `## Architecture
Some content

<!-- TRACEABILITY: [{"sectionId":"architecture","requirementIds":["req-1","req-2"]},{"sectionId":"api-contracts","requirementIds":["req-3"]}] -->`;

    const mappings = parseTraceabilityComment(raw);

    expect(mappings).toHaveLength(3);
    expect(mappings[0].requirementId).toBe("req-1");
    expect(mappings[0].targetId).toBe("architecture");
    expect(mappings[0].targetType).toBe("plan");
    expect(mappings[0].origin).toBe("ai");

    expect(mappings[1].requirementId).toBe("req-2");
    expect(mappings[1].targetId).toBe("architecture");

    expect(mappings[2].requirementId).toBe("req-3");
    expect(mappings[2].targetId).toBe("api-contracts");
  });

  it("returns empty array when no comment found", () => {
    const raw = "## Architecture\nSome content without traceability";
    const mappings = parseTraceabilityComment(raw);
    expect(mappings).toHaveLength(0);
  });

  it("returns empty array for malformed JSON", () => {
    const raw = "<!-- TRACEABILITY: {not valid json} -->";
    const mappings = parseTraceabilityComment(raw);
    expect(mappings).toHaveLength(0);
  });

  it("handles task section type", () => {
    const raw = `<!-- TRACEABILITY: [{"sectionId":"task-list","sectionType":"task","requirementIds":["req-1"]}] -->`;
    const mappings = parseTraceabilityComment(raw);

    expect(mappings).toHaveLength(1);
    expect(mappings[0].targetType).toBe("task");
    expect(mappings[0].targetId).toBe("task-list");
  });

  it("skips entries without required fields", () => {
    const raw = `<!-- TRACEABILITY: [{"sectionId":"architecture"},{"requirementIds":["req-1"]},{"sectionId":"data-model","requirementIds":["req-2"]}] -->`;
    const mappings = parseTraceabilityComment(raw);

    expect(mappings).toHaveLength(1);
    expect(mappings[0].targetId).toBe("data-model");
  });
});

describe("parseReanalyzeResponse", () => {
  it("parses a JSON array response", () => {
    const raw = JSON.stringify([
      { sectionId: "architecture", sectionType: "plan", requirementIds: ["req-1"] },
      { sectionId: "task-list", sectionType: "task", requirementIds: ["req-2", "req-3"] },
    ]);

    const mappings = parseReanalyzeResponse(raw);

    expect(mappings).toHaveLength(3);
    expect(mappings[0].targetType).toBe("plan");
    expect(mappings[0].targetId).toBe("architecture");
    expect(mappings[0].requirementId).toBe("req-1");

    expect(mappings[1].targetType).toBe("task");
    expect(mappings[1].requirementId).toBe("req-2");

    expect(mappings[2].targetType).toBe("task");
    expect(mappings[2].requirementId).toBe("req-3");
  });

  it("returns empty array for invalid JSON", () => {
    const mappings = parseReanalyzeResponse("not json");
    expect(mappings).toHaveLength(0);
  });

  it("returns empty array for non-array JSON", () => {
    const mappings = parseReanalyzeResponse('{"key": "value"}');
    expect(mappings).toHaveLength(0);
  });

  it("all mappings have origin ai", () => {
    const raw = JSON.stringify([
      { sectionId: "architecture", sectionType: "plan", requirementIds: ["req-1"] },
    ]);

    const mappings = parseReanalyzeResponse(raw);
    expect(mappings.every((m) => m.origin === "ai")).toBe(true);
  });
});
