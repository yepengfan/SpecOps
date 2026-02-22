"use client";

import { useCallback, useState } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RuleChecklist } from "@/components/eval/rule-checklist";
import { DeepAnalysisResults } from "@/components/eval/deep-analysis-results";
import { useProjectStore } from "@/lib/stores/project-store";
import { useEvaluationStore } from "@/lib/stores/evaluation-store";
import { evaluateSpec, evaluatePlan, evaluateTasks } from "@/lib/eval/rules";
import { computePhaseHash } from "@/lib/eval/hash";
import { setEvaluation } from "@/lib/db/evaluations";
import { updateProject } from "@/lib/db/projects";
import { streamGenerate, StreamError } from "@/lib/api/stream-client";
import { parseDeepAnalysisResponse } from "@/lib/prompts/deep-analysis";
import type { PhaseType } from "@/lib/types";
import type { RuleCheckResult, PhaseEvaluation } from "@/lib/eval/types";

interface EvaluationPanelProps {
  phaseType: PhaseType;
}

const evaluators: Record<PhaseType, (content: string) => RuleCheckResult[]> = {
  spec: evaluateSpec,
  plan: evaluatePlan,
  tasks: evaluateTasks,
};

const UPSTREAM_PHASE: Record<PhaseType, PhaseType | null> = {
  spec: null,
  plan: "spec",
  tasks: "plan",
};

export function EvaluationPanel({ phaseType }: EvaluationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const project = useProjectStore((s) => s.currentProject);
  const setProject = useProjectStore((s) => s.setProject);
  const isEvaluating = useEvaluationStore((s) => s.isEvaluating);
  const setEvaluating = useEvaluationStore((s) => s.setEvaluating);
  const isAnalyzing = useEvaluationStore((s) => s.isAnalyzing);
  const setAnalyzing = useEvaluationStore((s) => s.setAnalyzing);
  const analysisError = useEvaluationStore((s) => s.analysisError);
  const setAnalysisError = useEvaluationStore((s) => s.setAnalysisError);

  const phase = project?.phases[phaseType];
  const evaluation = project?.evaluations?.[phaseType];
  const hasContent = phase?.sections.some((s) => s.content.trim() !== "") ?? false;

  const handleEvaluate = useCallback(async () => {
    if (!project || !phase) return;

    setEvaluating(true);
    try {
      const content = phase.sections
        .map((s) => `## ${s.title}\n${s.content}`)
        .join("\n\n");

      const ruleResults = evaluators[phaseType](content);
      const contentHash = computePhaseHash(phase.sections);

      const phaseEvaluation: PhaseEvaluation = {
        contentHash,
        ruleResults,
        deepAnalysis: evaluation?.deepAnalysis ?? null,
        evaluatedAt: Date.now(),
      };

      const updated = setEvaluation(project, phaseType, phaseEvaluation);
      await updateProject(updated);
      setProject(updated);
      setIsOpen(true);
    } finally {
      setEvaluating(false);
    }
  }, [project, phase, phaseType, evaluation, setEvaluating, setProject]);

  const handleDeepAnalysis = useCallback(async () => {
    if (!project || !phase || !evaluation) return;

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const phaseContent = phase.sections
        .map((s) => `## ${s.title}\n${s.content}`)
        .join("\n\n");

      // Gather upstream content for cross-phase analysis (T022)
      const upstreamPhaseType = UPSTREAM_PHASE[phaseType];
      let upstreamContent: string | undefined;
      if (upstreamPhaseType) {
        const upstreamPhase = project.phases[upstreamPhaseType];
        const hasUpstreamContent = upstreamPhase.sections.some(
          (s) => s.content.trim() !== ""
        );
        if (hasUpstreamContent) {
          upstreamContent = upstreamPhase.sections
            .map((s) => `## ${s.title}\n${s.content}`)
            .join("\n\n");
        }
      }

      let accumulated = "";
      for await (const chunk of streamGenerate({
        action: "deep-analysis",
        phaseType,
        phaseContent,
        upstreamContent,
      })) {
        accumulated += chunk;
      }

      const parsed = parseDeepAnalysisResponse(accumulated);
      const deepAnalysis = {
        ...parsed,
        analyzedAt: Date.now(),
      };

      const phaseEvaluation: PhaseEvaluation = {
        ...evaluation,
        deepAnalysis,
      };

      const updated = setEvaluation(project, phaseType, phaseEvaluation);
      await updateProject(updated);
      setProject(updated);
    } catch (err: unknown) {
      const message =
        err instanceof StreamError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Deep analysis failed";
      setAnalysisError(message);
    } finally {
      setAnalyzing(false);
    }
  }, [project, phase, phaseType, evaluation, setAnalyzing, setAnalysisError, setProject]);

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        className="flex w-full items-center justify-between p-3 text-sm font-medium hover:bg-accent/50 rounded-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
          Evaluation
          {evaluation && (
            <span className="text-xs text-muted-foreground font-normal">
              ({evaluation.ruleResults.filter((r) => r.passed).length}/
              {evaluation.ruleResults.length} passing)
            </span>
          )}
        </span>
        <span className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!hasContent || isEvaluating}
            onClick={(e) => {
              e.stopPropagation();
              handleEvaluate();
            }}
          >
            {isEvaluating ? "Evaluating…" : "Evaluate"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!evaluation || isAnalyzing}
            onClick={(e) => {
              e.stopPropagation();
              handleDeepAnalysis();
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Analyzing…
              </>
            ) : (
              "Deep Analysis"
            )}
          </Button>
        </span>
      </button>

      {isOpen && (
        <div className="border-t px-3 pb-3 pt-2 space-y-4">
          {!hasContent ? (
            <p className="text-sm text-muted-foreground">
              Nothing to evaluate — add content to the phase first.
            </p>
          ) : evaluation ? (
            <>
              <RuleChecklist results={evaluation.ruleResults} />
              {analysisError && (
                <div
                  className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                  role="alert"
                >
                  {analysisError}
                  <Button
                    size="xs"
                    variant="outline"
                    className="ml-2"
                    onClick={handleDeepAnalysis}
                    disabled={isAnalyzing}
                  >
                    Retry
                  </Button>
                </div>
              )}
              {evaluation.deepAnalysis && (
                <DeepAnalysisResults result={evaluation.deepAnalysis} />
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click &quot;Evaluate&quot; to run quality checks.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
