import type { Section, PhaseType } from "@/lib/types";

export const REQUIREMENTS_SECTIONS: readonly Section[] = [
  { id: "problem-statement", title: "Problem Statement", content: "" },
  { id: "ears-requirements", title: "EARS Requirements", content: "" },
  {
    id: "non-functional-requirements",
    title: "Non-Functional Requirements",
    content: "",
  },
];

export const DESIGN_SECTIONS: readonly Section[] = [
  { id: "architecture", title: "Architecture", content: "" },
  { id: "api-contracts", title: "API Contracts", content: "" },
  { id: "data-model", title: "Data Model", content: "" },
  { id: "tech-decisions", title: "Tech Decisions", content: "" },
  { id: "security-edge-cases", title: "Security & Edge Cases", content: "" },
];

export const TASKS_SECTIONS: readonly Section[] = [
  { id: "task-list", title: "Task List", content: "" },
  { id: "dependencies", title: "Dependencies", content: "" },
  { id: "file-mapping", title: "File Mapping", content: "" },
  { id: "test-expectations", title: "Test Expectations", content: "" },
];

const SECTIONS_BY_PHASE: Record<PhaseType, readonly Section[]> = {
  requirements: REQUIREMENTS_SECTIONS,
  design: DESIGN_SECTIONS,
  tasks: TASKS_SECTIONS,
};

export function getSectionsForPhase(phaseType: PhaseType): Section[] {
  return SECTIONS_BY_PHASE[phaseType].map((s) => ({ ...s }));
}
