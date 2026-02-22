import type { RuleCheckResult } from "@/lib/eval/types";

const EARS_KEYWORDS = /\b(WHEN|THEN|SHALL|WHERE|IF)\b/;

const SPEC_REQUIRED_SECTIONS = [
  "Priority",
  "Rationale",
  "Main Flow",
  "Validation Rules",
  "Error Handling",
];

const PLAN_REQUIRED_SECTIONS = [
  "Architecture",
  "API Contracts",
  "Data Model",
  "Tech Decisions",
  "Security & Edge Cases",
];

function hasSection(content: string, sectionName: string): boolean {
  const pattern = new RegExp(
    `^##\\s+.*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    "im"
  );
  return pattern.test(content);
}

function getSectionContent(content: string, sectionName: string): string {
  const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `^##\\s+.*${escaped}[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|$)`,
    "im"
  );
  const match = content.match(pattern);
  return match ? match[1].trim() : "";
}

export function evaluateSpec(content: string): RuleCheckResult[] {
  const results: RuleCheckResult[] = [];

  // Check EARS keywords in requirements
  const reqLines = content
    .split("\n")
    .filter((line) => /^\s*-\s+\*\*FR-\d+\*\*:/.test(line));

  if (reqLines.length === 0) {
    results.push({
      id: "spec-ears-keywords",
      name: "EARS Keywords Present",
      passed: false,
      explanation: "No requirements found (expected lines starting with FR-XXX)",
    });
  } else {
    const missing = reqLines.filter((line) => !EARS_KEYWORDS.test(line));
    if (missing.length === 0) {
      results.push({
        id: "spec-ears-keywords",
        name: "EARS Keywords Present",
        passed: true,
        explanation: "",
      });
    } else {
      results.push({
        id: "spec-ears-keywords",
        name: "EARS Keywords Present",
        passed: false,
        explanation: `${missing.length} requirement(s) missing EARS keywords (WHEN, THEN, SHALL, WHERE, IF): ${missing.map((l) => l.match(/FR-\d+/)?.[0] ?? "unknown").join(", ")}`,
      });
    }
  }

  // Check required sections
  const missingSections = SPEC_REQUIRED_SECTIONS.filter(
    (s) => !hasSection(content, s)
  );
  results.push({
    id: "spec-required-sections",
    name: "Required Sections Present",
    passed: missingSections.length === 0,
    explanation:
      missingSections.length === 0
        ? ""
        : `Missing sections: ${missingSections.join(", ")}`,
  });

  // Check performance target
  const hasPerf =
    hasSection(content, "Performance") ||
    /\b(performance|latency|response time|throughput|load time)\b/i.test(
      content
    );
  results.push({
    id: "spec-performance-target",
    name: "Performance Target Exists",
    passed: hasPerf,
    explanation: hasPerf
      ? ""
      : "No performance target found (expected a Performance section or performance-related keywords)",
  });

  return results;
}

export function evaluatePlan(content: string): RuleCheckResult[] {
  const results: RuleCheckResult[] = [];

  // Check required sections exist
  const missingSections = PLAN_REQUIRED_SECTIONS.filter(
    (s) => !hasSection(content, s)
  );
  results.push({
    id: "plan-required-sections",
    name: "Required Sections Present",
    passed: missingSections.length === 0,
    explanation:
      missingSections.length === 0
        ? ""
        : `Missing sections: ${missingSections.join(", ")}`,
  });

  // Check sections have non-empty content
  const emptySections = PLAN_REQUIRED_SECTIONS.filter(
    (s) => hasSection(content, s) && !getSectionContent(content, s)
  );
  results.push({
    id: "plan-sections-non-empty",
    name: "Sections Have Content",
    passed: emptySections.length === 0,
    explanation:
      emptySections.length === 0
        ? ""
        : `Empty sections: ${emptySections.join(", ")}`,
  });

  return results;
}

export function evaluateTasks(content: string): RuleCheckResult[] {
  const results: RuleCheckResult[] = [];

  // Parse tasks: find lines like "- [ ] T001 ..." or "- [X] T001 ..."
  const taskPattern = /^-\s+\[[ xX]\]\s+(T\d+)/gm;
  const taskIds: string[] = [];
  let match;
  while ((match = taskPattern.exec(content)) !== null) {
    taskIds.push(match[1]);
  }

  if (taskIds.length === 0) {
    results.push({
      id: "tasks-structure",
      name: "Task Structure Valid",
      passed: false,
      explanation: "No tasks found (expected lines like '- [ ] T001 ...')",
    });
    results.push({
      id: "tasks-dependency-valid",
      name: "Task Dependencies Valid",
      passed: false,
      explanation: "No tasks found to validate dependencies",
    });
    return results;
  }

  // Check task structure — each task should have dependencies, files, tests references
  // We check for lines following each task that contain these keywords
  const taskBlocks = content.split(/(?=^-\s+\[[ xX]\]\s+T\d+)/m).filter(Boolean);
  const missingInfo: string[] = [];

  for (const block of taskBlocks) {
    const idMatch = block.match(/^-\s+\[[ xX]\]\s+(T\d+)/);
    if (!idMatch) continue;
    const id = idMatch[1];
    const hasDepRef =
      /dependencies|depends|dep/i.test(block) ||
      /\bT\d+\b/.test(block.slice(block.indexOf(id) + id.length));
    const hasFileRef = /files?[:\s]|\.tsx?|\.js|\.ts|\.py/i.test(block);
    const hasTestRef = /tests?[:\s]|test|spec/i.test(block);

    if (!hasDepRef && !hasFileRef && !hasTestRef) {
      missingInfo.push(id);
    }
  }

  results.push({
    id: "tasks-structure",
    name: "Task Structure Valid",
    passed: missingInfo.length === 0,
    explanation:
      missingInfo.length === 0
        ? ""
        : `Tasks missing dependency/file/test info: ${missingInfo.join(", ")}`,
  });

  // Check dependency references point to existing tasks
  const depPattern = /Dependencies:\s*([^\n]+)/gi;
  const invalidDeps: string[] = [];
  let depMatch;
  while ((depMatch = depPattern.exec(content)) !== null) {
    const depLine = depMatch[1];
    const refs = depLine.match(/T\d+/g);
    if (refs) {
      for (const ref of refs) {
        if (!taskIds.includes(ref)) {
          invalidDeps.push(ref);
        }
      }
    }
  }

  results.push({
    id: "tasks-dependency-valid",
    name: "Task Dependencies Valid",
    passed: invalidDeps.length === 0,
    explanation:
      invalidDeps.length === 0
        ? ""
        : `Invalid dependency references: ${[...new Set(invalidDeps)].join(", ")}`,
  });

  return results;
}
