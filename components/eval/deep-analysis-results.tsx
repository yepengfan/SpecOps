"use client";

import { Progress } from "@/components/ui/progress";
import type { DeepAnalysisResult, CrossPhaseFindings } from "@/lib/eval/types";

interface DeepAnalysisResultsProps {
  result: DeepAnalysisResult;
}

const DIMENSION_LABELS: Record<string, string> = {
  completeness: "Completeness",
  testability: "Testability",
  unambiguity: "Unambiguity",
  consistency: "Consistency",
  actionability: "Actionability",
};

export function DeepAnalysisResults({ result }: DeepAnalysisResultsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Quality Dimensions</h4>
        {result.dimensions.map((dim) => (
          <div key={dim.dimension} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>{DIMENSION_LABELS[dim.dimension] ?? dim.dimension}</span>
              <span className="text-muted-foreground">{dim.score}/5</span>
            </div>
            <Progress value={dim.score} max={5} />
            <p className="text-xs text-muted-foreground">{dim.rationale}</p>
          </div>
        ))}
      </div>

      {result.suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Suggestions</h4>
          <ul className="space-y-3">
            {result.suggestions.map((s, i) => (
              <li key={i} className="text-sm space-y-1">
                <blockquote className="border-l-2 border-muted-foreground/30 pl-2 text-xs text-muted-foreground italic">
                  {s.quote}
                </blockquote>
                <p className="text-xs">
                  <span className="font-medium">Issue:</span> {s.issue}
                </p>
                <p className="text-xs">
                  <span className="font-medium">Fix:</span> {s.fix}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.crossPhaseFindings && (
        <CrossPhaseFindingsSection findings={result.crossPhaseFindings} />
      )}
    </div>
  );
}

function CrossPhaseFindingsSection({
  findings,
}: {
  findings: CrossPhaseFindings;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Cross-Phase Coverage</h4>
      <p className="text-xs text-muted-foreground">{findings.summary}</p>
      {findings.coveredItems.length > 0 && (
        <div>
          <p className="text-xs font-medium text-green-600 dark:text-green-400">
            Covered ({findings.coveredItems.length})
          </p>
          <ul className="text-xs text-muted-foreground list-disc list-inside">
            {findings.coveredItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {findings.uncoveredItems.length > 0 && (
        <div>
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            Uncovered ({findings.uncoveredItems.length})
          </p>
          <ul className="text-xs text-muted-foreground list-disc list-inside">
            {findings.uncoveredItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
