"use client";

import { Check, Lock } from "lucide-react";
import { useProjectStore } from "@/lib/stores/project-store";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "spec", label: "Spec" },
  { key: "plan", label: "Plan" },
  { key: "tasks", label: "Tasks" },
] as const;

export function WorkflowIndicator() {
  const project = useProjectStore((s) => s.currentProject);

  if (!project) return null;

  return (
    <div className="flex items-center gap-1" aria-label="Workflow progress">
      {STEPS.map((step, i) => {
        const status = project.phases[step.key].status;
        const isReviewed = status === "reviewed";
        const isLocked = status === "locked";

        return (
          <div key={step.key} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={cn(
                  "h-px w-6",
                  isLocked ? "bg-muted-foreground/30" : "bg-foreground/40",
                )}
              />
            )}
            <div
              className={cn(
                "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                isReviewed && "border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
                isLocked && "border-muted bg-muted text-muted-foreground opacity-60",
                !isReviewed && !isLocked && "border-foreground/20 bg-background text-foreground",
              )}
            >
              {isReviewed && <Check className="size-3" />}
              {isLocked && <Lock className="size-3" />}
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
