export type PhaseType = "spec" | "plan" | "tasks";
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

export interface TraceabilityMapping {
  id: string;
  requirementId: string;
  requirementLabel: string;
  targetType: "plan" | "task";
  targetId: string;
  targetLabel: string;
  origin: "ai" | "manual";
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  phases: {
    spec: Phase;
    plan: Phase;
    tasks: Phase;
  };
  traceabilityMappings: TraceabilityMapping[];
}

export const PHASE_TYPES: readonly PhaseType[] = [
  "spec",
  "plan",
  "tasks",
];

export const PHASE_ORDER: Record<PhaseType, number> = {
  spec: 0,
  plan: 1,
  tasks: 2,
};
