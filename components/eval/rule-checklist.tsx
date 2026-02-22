"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { RuleCheckResult } from "@/lib/eval/types";

interface RuleChecklistProps {
  results: RuleCheckResult[];
}

export function RuleChecklist({ results }: RuleChecklistProps) {
  if (results.length === 0) return null;

  return (
    <ul className="space-y-2">
      {results.map((result) => (
        <li key={result.id} className="flex items-start gap-2 text-sm">
          {result.passed ? (
            <CheckCircle2
              className="size-4 shrink-0 mt-0.5 text-green-600 dark:text-green-400"
              aria-label="Passing"
            />
          ) : (
            <XCircle
              className="size-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400"
              aria-label="Failing"
            />
          )}
          <div>
            <span className={result.passed ? "text-muted-foreground" : "font-medium"}>
              {result.name}
            </span>
            {!result.passed && result.explanation && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {result.explanation}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
