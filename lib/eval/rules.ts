import type { RuleCheckResult } from "@/lib/eval/types";

const EARS_KEYWORDS = /\b(WHEN|THEN|SHALL|WHERE|IF)\b/;

// Must match SPEC_SECTIONS in lib/types/sections.ts
const SPEC_REQUIRED_SECTIONS = [
  "Problem Statement",
  "EARS Requirements",
  "Non-Functional Requirements",
];

// Must match PLAN_SECTIONS in lib/types/sections.ts
const PLAN_REQUIRED_SECTIONS = [
  "Architecture",
  "API Contracts",
  "Data Model",
  "Tech Decisions",
  "Security & Edge Cases",
];

// Must match TASKS_SECTIONS in lib/types/sections.ts
const TASKS_REQUIRED_SECTIONS = [
  "Task List",
  "Dependencies",
  "File Mapping",
  "Test Expectations",
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
  // The spec prompt generates FR-<number> and NFR-<number> format (zero-padded three-digit)
  const reqLines = content
    .split("\n")
    .filter((line) => /^\s*-\s+\*\*(FR|NFR)-\d+\*\*:/.test(line));

  if (reqLines.length === 0) {
    results.push({
      id: "spec-ears-keywords",
      name: "EARS Keywords Present",
      passed: false,
      explanation: "No requirements found (expected lines starting with FR-NNN or NFR-NNN)",
    });
  } else {
    // Only check EARS keywords on FR lines (NFR lines don't require EARS format)
    const frOnlyLines = reqLines.filter((line) => /\*\*FR-/.test(line));
    const missing = frOnlyLines.filter((line) => !EARS_KEYWORDS.test(line));
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

  // Check required sections exist and have content
  const missingSections = SPEC_REQUIRED_SECTIONS.filter(
    (s) => !hasSection(content, s)
  );
  const emptySections = SPEC_REQUIRED_SECTIONS.filter(
    (s) => hasSection(content, s) && !getSectionContent(content, s)
  );
  const problemSections = [...missingSections, ...emptySections];

  results.push({
    id: "spec-required-sections",
    name: "Required Sections Present",
    passed: problemSections.length === 0,
    explanation:
      problemSections.length === 0
        ? ""
        : missingSections.length > 0 && emptySections.length > 0
          ? `Missing sections: ${missingSections.join(", ")}; Empty sections: ${emptySections.join(", ")}`
          : missingSections.length > 0
            ? `Missing sections: ${missingSections.join(", ")}`
            : `Empty sections: ${emptySections.join(", ")}`,
  });

  // Check performance target exists (in NFR section or as keyword anywhere)
  const hasPerf =
    /\b(performance|latency|response time|throughput|load time)\b/i.test(
      content
    );
  results.push({
    id: "spec-performance-target",
    name: "Performance Target Exists",
    passed: hasPerf,
    explanation: hasPerf
      ? ""
      : "No performance target found (expected performance-related keywords in Non-Functional Requirements)",
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

  // Check required sections exist and have content
  const missingSections = TASKS_REQUIRED_SECTIONS.filter(
    (s) => !hasSection(content, s)
  );
  results.push({
    id: "tasks-required-sections",
    name: "Required Sections Present",
    passed: missingSections.length === 0,
    explanation:
      missingSections.length === 0
        ? ""
        : `Missing sections: ${missingSections.join(", ")}`,
  });

  // Check tasks exist in Task List section (format: **T<number>**: description)
  const taskPattern = /\*\*T(\d+)\*\*:/g;
  const taskIds: string[] = [];
  let match;
  while ((match = taskPattern.exec(content)) !== null) {
    taskIds.push(`T${match[1]}`);
  }

  results.push({
    id: "tasks-structure",
    name: "Task Structure Valid",
    passed: taskIds.length > 0,
    explanation:
      taskIds.length > 0
        ? ""
        : "No tasks found (expected lines like '**T1**: description')",
  });

  // Check dependency references point to existing tasks
  const depRefPattern = /\bT(\d+)\s*→\s*T(\d+)/g;
  const invalidDeps: string[] = [];
  let depMatch;
  while ((depMatch = depRefPattern.exec(content)) !== null) {
    const from = `T${depMatch[1]}`;
    const to = `T${depMatch[2]}`;
    if (!taskIds.includes(from)) invalidDeps.push(from);
    if (!taskIds.includes(to)) invalidDeps.push(to);
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
