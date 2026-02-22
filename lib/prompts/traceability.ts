import type { TraceabilityMapping } from "@/lib/types";

export function getReanalyzeMappingsPrompt(): string {
  return `You are a traceability analyst. Given a software spec, plan, and task breakdown, analyze which requirements are addressed by each plan section and task section.

Output ONLY a JSON array in this exact format (no markdown fencing, no explanation):
[
  {"sectionId":"architecture","sectionType":"plan","requirementIds":["req-1","req-3"]},
  {"sectionId":"api-contracts","sectionType":"plan","requirementIds":["req-2"]},
  {"sectionId":"task-list","sectionType":"task","requirementIds":["req-1","req-2","req-3"]},
  ...
]

Rules:
- Use requirement IDs in the format "req-N" where N matches the number from "**REQ-N**:" in the spec (e.g., **REQ-1** becomes "req-1")
- sectionType must be "plan" or "task"
- sectionId must match the section slug (e.g., "architecture", "api-contracts", "data-model", "tech-decisions", "security-edge-cases", "task-list", "dependencies", "file-mapping", "test-expectations")
- Map every requirement to at least one section if possible
- Only map requirements that are genuinely addressed by a section`;
}

interface RawTraceabilityEntry {
  sectionId: string;
  requirementIds?: string[];
  sectionType?: "plan" | "task";
}

export function parseTraceabilityComment(raw: string): TraceabilityMapping[] {
  const match = raw.match(/<!--\s*TRACEABILITY:\s*(\[[\s\S]*?\])\s*-->/);
  if (!match) return [];

  let entries: RawTraceabilityEntry[];
  try {
    entries = JSON.parse(match[1]);
  } catch {
    return [];
  }

  if (!Array.isArray(entries)) return [];

  const mappings: TraceabilityMapping[] = [];
  const now = Date.now();

  for (const entry of entries) {
    if (!entry.sectionId || !Array.isArray(entry.requirementIds)) continue;

    const targetType = entry.sectionType === "task" ? "task" : "plan";

    for (const reqId of entry.requirementIds) {
      mappings.push({
        id: `${targetType}-${entry.sectionId}-${reqId}-${now}`,
        requirementId: reqId,
        requirementLabel: reqId,
        targetType,
        targetId: entry.sectionId,
        targetLabel: entry.sectionId,
        origin: "ai",
        createdAt: now,
      });
    }
  }

  return mappings;
}

export function parseReanalyzeResponse(raw: string): TraceabilityMapping[] {
  let entries: RawTraceabilityEntry[];
  try {
    entries = JSON.parse(raw.trim());
  } catch {
    return [];
  }

  if (!Array.isArray(entries)) return [];

  const mappings: TraceabilityMapping[] = [];
  const now = Date.now();

  for (const entry of entries) {
    if (!entry.sectionId || !Array.isArray(entry.requirementIds)) continue;

    const targetType =
      entry.sectionType === "task" ? "task" : "plan";

    for (const reqId of entry.requirementIds) {
      mappings.push({
        id: `${targetType}-${entry.sectionId}-${reqId}-${now}`,
        requirementId: reqId,
        requirementLabel: reqId,
        targetType,
        targetId: entry.sectionId,
        targetLabel: entry.sectionId,
        origin: "ai",
        createdAt: now,
      });
    }
  }

  return mappings;
}
