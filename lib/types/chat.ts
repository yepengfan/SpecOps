import type { PhaseType } from "@/lib/types";

export interface SuggestedEdit {
  sectionId: string;
  phaseType: PhaseType;
  proposedContent: string;
  status: "pending" | "applied" | "dismissed";
}

export interface ChatMessage {
  id?: number;
  projectId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  suggestedEdit?: SuggestedEdit | null;
}
