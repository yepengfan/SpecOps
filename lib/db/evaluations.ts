import type { Project, PhaseType } from "@/lib/types";
import type { PhaseEvaluation } from "@/lib/eval/types";
import { updateProject } from "@/lib/db/projects";

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

export async function persistEvaluation(
  project: Project,
  phaseType: PhaseType,
  evaluation: PhaseEvaluation
): Promise<Project> {
  const updated = setEvaluation(project, phaseType, evaluation);
  await updateProject(updated);
  return updated;
}

export async function persistClearEvaluation(
  project: Project,
  phaseType: PhaseType
): Promise<Project> {
  const updated = clearEvaluation(project, phaseType);
  await updateProject(updated);
  return updated;
}
