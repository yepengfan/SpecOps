import type { Project, PhaseType } from "@/lib/types";
import { PHASE_TYPES, PHASE_ORDER } from "@/lib/types";

const PHASE_NAMES: Record<PhaseType, string> = {
  spec: "Spec",
  plan: "Plan",
  tasks: "Tasks",
};

export function buildProjectContext(
  project: Project,
  phaseType: PhaseType,
): string {
  const maxOrder = PHASE_ORDER[phaseType];

  const blocks: string[] = [];

  for (const phase of PHASE_TYPES) {
    if (PHASE_ORDER[phase] > maxOrder) continue;

    const phaseName = PHASE_NAMES[phase];

    for (const section of project.phases[phase].sections) {
      if (!section.content) continue;

      blocks.push(`## ${phaseName} - ${section.title}\n\n${section.content}`);
    }
  }

  return blocks.join("\n\n");
}
