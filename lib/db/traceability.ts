import type { Project, TraceabilityMapping } from "@/lib/types";

export function addMapping(
  project: Project,
  mapping: TraceabilityMapping,
): Project {
  return {
    ...project,
    traceabilityMappings: [...project.traceabilityMappings, mapping],
  };
}

export function removeMapping(
  project: Project,
  mappingId: string,
): Project {
  return {
    ...project,
    traceabilityMappings: project.traceabilityMappings.filter(
      (m) => m.id !== mappingId,
    ),
  };
}

export function clearAiMappings(project: Project): Project {
  return {
    ...project,
    traceabilityMappings: project.traceabilityMappings.filter(
      (m) => m.origin !== "ai",
    ),
  };
}

export function parseRequirementIds(
  project: Project,
): Array<{ id: string; label: string }> {
  const specSections = project.phases.spec.sections;
  const allContent = specSections.map((s) => s.content).join("\n");

  const requirements: Array<{ id: string; label: string }> = [];

  // Match FR-NNN format (primary) and REQ-N format (backward compat)
  const frBoldRegex = /\*\*(FR|REQ)-(\d+)\*\*:\s*(.+)/g;
  // Match NFR-NNN format
  const nfrBoldRegex = /\*\*NFR-(\d+)\*\*:\s*(.+)/g;
  // Heading fallback: ## FR-NNN: Title or ## Req N: Title
  const headingRegex = /^##\s+(?:FR-(\d+)|Req\s+(\d+)):\s*(.+)$/gm;

  const pad = (n: string) => n.padStart(3, "0");

  let match;
  while ((match = frBoldRegex.exec(allContent)) !== null) {
    const num = pad(match[2]);
    requirements.push({
      id: `fr-${num}`,
      label: `FR-${num}: ${match[3].trim()}`,
    });
  }

  while ((match = nfrBoldRegex.exec(allContent)) !== null) {
    const num = pad(match[1]);
    requirements.push({
      id: `nfr-${num}`,
      label: `NFR-${num}: ${match[2].trim()}`,
    });
  }

  // Fallback: also check for heading format
  while ((match = headingRegex.exec(allContent)) !== null) {
    const rawNum = match[1] ?? match[2];
    const num = pad(rawNum);
    const id = `fr-${num}`;
    if (!requirements.some((r) => r.id === id)) {
      requirements.push({
        id,
        label: `FR-${num}: ${match[3].trim()}`,
      });
    }
  }

  return requirements;
}

export interface CoverageStats {
  planCoverage: { covered: number; total: number };
  taskCoverage: { covered: number; total: number };
}

export function getCoverageStats(project: Project): CoverageStats {
  const requirements = parseRequirementIds(project);
  const total = requirements.length;

  const planReqIds = new Set(
    project.traceabilityMappings
      .filter((m) => m.targetType === "plan")
      .map((m) => m.requirementId),
  );

  const taskReqIds = new Set(
    project.traceabilityMappings
      .filter((m) => m.targetType === "task")
      .map((m) => m.requirementId),
  );

  return {
    planCoverage: { covered: planReqIds.size, total },
    taskCoverage: { covered: taskReqIds.size, total },
  };
}
