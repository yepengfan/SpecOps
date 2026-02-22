export type PhaseType = "requirements" | "design" | "tasks";
export type PhaseStatus = "locked" | "draft" | "reviewed";

export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface Phase {
  type: PhaseType;
  status: PhaseStatus;
  sections: Section[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  phases: {
    requirements: Phase;
    design: Phase;
    tasks: Phase;
  };
}

export const PHASE_TYPES: readonly PhaseType[] = [
  "requirements",
  "design",
  "tasks",
];

export const PHASE_ORDER: Record<PhaseType, number> = {
  requirements: 0,
  design: 1,
  tasks: 2,
};
