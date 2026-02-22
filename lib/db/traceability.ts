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
  const regex = /^##\s+Req\s+(\d+):\s*(.+)$/gm;
  let match;

  while ((match = regex.exec(allContent)) !== null) {
    requirements.push({
      id: `req-${match[1]}`,
      label: `Req ${match[1]}: ${match[2].trim()}`,
    });
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
