import type { Project, PhaseType } from "@/lib/types";
import type { PhaseEvaluation } from "@/lib/eval/types";

export function getEvaluation(
  project: Project,
  phaseType: PhaseType
): PhaseEvaluation | undefined {
  return project.evaluations?.[phaseType];
}

export function setEvaluation(
  project: Project,
  phaseType: PhaseType,
  evaluation: PhaseEvaluation
): Project {
  return {
    ...project,
    evaluations: {
      ...project.evaluations,
      [phaseType]: evaluation,
    },
  };
}

export function clearEvaluation(
  project: Project,
  phaseType: PhaseType
): Project {
  if (!project.evaluations?.[phaseType]) return project;
  const rest = Object.fromEntries(
    Object.entries(project.evaluations).filter(([key]) => key !== phaseType)
  );
  return {
    ...project,
    evaluations: Object.keys(rest).length > 0 ? rest : undefined,
  };
}

