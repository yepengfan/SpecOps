import type {
  DeepAnalysisResult,
  DimensionScore,
  Suggestion,
  CrossPhaseFindings,
} from "@/lib/eval/types";
import type { PhaseType } from "@/lib/types";

const DIMENSIONS = [
  "completeness",
  "testability",
  "unambiguity",
  "consistency",
  "actionability",
] as const;

export function buildDeepAnalysisPrompt(
  phaseType: PhaseType,
  phaseContent: string,
  upstreamContent?: string
): { system: string; userMessage: string } {
  const system = `You are a quality analyst evaluating software design documents. Score the provided ${phaseType} phase content on these 5 dimensions, each from 1 (poor) to 5 (excellent):

1. **completeness** — Are all necessary aspects covered? No major gaps?
2. **testability** — Can each requirement/component be verified with a clear test?
3. **unambiguity** — Is the language precise? No vague terms or multiple interpretations?
4. **consistency** — Are terms, formats, and conventions used uniformly throughout?
5. **actionability** — Can a developer implement directly from this without guessing?

For each dimension, provide a brief rationale explaining the score.

Also provide specific improvement suggestions. Each suggestion must include:
- "quote": an exact excerpt from the content
- "issue": what is wrong or could be improved
- "fix": a specific suggested improvement

${upstreamContent ? `Additionally, perform cross-phase analysis: check whether the ${phaseType} phase adequately covers items from the upstream phase content provided. Report covered and uncovered items.` : ""}

Respond with ONLY a JSON object (no markdown fences, no extra text) in this exact format:
{
  "dimensions": [
    { "dimension": "completeness", "score": <1-5>, "rationale": "..." },
    { "dimension": "testability", "score": <1-5>, "rationale": "..." },
    { "dimension": "unambiguity", "score": <1-5>, "rationale": "..." },
    { "dimension": "consistency", "score": <1-5>, "rationale": "..." },
    { "dimension": "actionability", "score": <1-5>, "rationale": "..." }
  ],
  "suggestions": [
    { "quote": "...", "issue": "...", "fix": "..." }
  ],
  "crossPhaseFindings": ${upstreamContent ? '{ "summary": "...", "coveredItems": ["..."], "uncoveredItems": ["..."] }' : "null"}
}`;

  let userMessage = `Analyze this ${phaseType} phase content:\n\n${phaseContent}`;

  if (upstreamContent) {
    userMessage += `\n\nUpstream phase content for cross-phase analysis:\n\n${upstreamContent}`;
  }

  return { system, userMessage };
}

export function parseDeepAnalysisResponse(raw: string): Omit<DeepAnalysisResult, "analyzedAt"> {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse deep analysis response as JSON");
  }

  const obj = parsed as Record<string, unknown>;

  // Parse dimensions
  const rawDimensions = obj.dimensions;
  if (!Array.isArray(rawDimensions)) {
    throw new Error("Missing or invalid dimensions array");
  }

  const dimensions: DimensionScore[] = rawDimensions.map((d: Record<string, unknown>) => ({
    dimension: String(d.dimension) as DimensionScore["dimension"],
    score: Math.min(5, Math.max(1, Math.round(Number(d.score)))),
    rationale: String(d.rationale || ""),
  }));

  // Validate all 5 dimensions present
  for (const name of DIMENSIONS) {
    if (!dimensions.some((d) => d.dimension === name)) {
      dimensions.push({ dimension: name, score: 1, rationale: "Not evaluated" });
    }
  }

  // Parse suggestions
  const rawSuggestions = obj.suggestions;
  const suggestions: Suggestion[] = Array.isArray(rawSuggestions)
    ? rawSuggestions.map((s: Record<string, unknown>) => ({
        quote: String(s.quote || ""),
        issue: String(s.issue || ""),
        fix: String(s.fix || ""),
      }))
    : [];

  // Parse cross-phase findings
  let crossPhaseFindings: CrossPhaseFindings | null = null;
  const rawCross = obj.crossPhaseFindings;
  if (rawCross && typeof rawCross === "object") {
    const c = rawCross as Record<string, unknown>;
    crossPhaseFindings = {
      summary: String(c.summary || ""),
      coveredItems: Array.isArray(c.coveredItems)
        ? c.coveredItems.map(String)
        : [],
      uncoveredItems: Array.isArray(c.uncoveredItems)
        ? c.uncoveredItems.map(String)
        : [],
    };
  }

  return { dimensions, suggestions, crossPhaseFindings };
}
