import type { PhaseType } from "@/lib/types";

export interface RuleCheckResult {
  id: string;
  name: string;
  passed: boolean;
  explanation: string;
}

export interface DimensionScore {
  dimension:
    | "completeness"
    | "testability"
    | "unambiguity"
    | "consistency"
    | "actionability";
  score: number;
  rationale: string;
}

export interface Suggestion {
  quote: string;
  issue: string;
  fix: string;
}

export interface CrossPhaseFindings {
  summary: string;
  coveredItems: string[];
  uncoveredItems: string[];
}

export interface DeepAnalysisResult {
  dimensions: DimensionScore[];
  suggestions: Suggestion[];
  crossPhaseFindings: CrossPhaseFindings | null;
  analyzedAt: number;
}

export interface PhaseEvaluation {
  contentHash: string;
  ruleResults: RuleCheckResult[];
  deepAnalysis: DeepAnalysisResult | null;
  evaluatedAt: number;
}

export type PhaseEvaluations = {
  [K in PhaseType]?: PhaseEvaluation;
};
