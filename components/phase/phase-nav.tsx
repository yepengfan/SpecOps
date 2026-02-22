"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { useProjectStore } from "@/lib/stores/project-store";
import { PHASE_TYPES, type PhaseType } from "@/lib/types";
import { cn } from "@/lib/utils";

const PHASE_LABELS: Record<PhaseType, string> = {
  spec: "Spec",
  plan: "Plan",
  tasks: "Tasks",
};

interface PhaseNavProps {
  projectId: string;
}

export function PhaseNav({ projectId }: PhaseNavProps) {
  const project = useProjectStore((s) => s.currentProject);
  const pathname = usePathname();

  if (!project) return null;

  return (
    <nav aria-label="Phase navigation">
      <div role="tablist" className="inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-1">
        {PHASE_TYPES.map((phase) => {
          const status = project.phases[phase].status;
          const href = `/project/${projectId}/${phase}`;
          const isActive = pathname === href;

          if (status === "locked") {
            return (
              <span
                key={phase}
                role="tab"
                aria-disabled="true"
                aria-selected={false}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm text-muted-foreground opacity-50"
              >
                <Lock className="size-3.5" />
                {PHASE_LABELS[phase]}
              </span>
            );
          }

          return (
            <Link
              key={phase}
              href={href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {status === "reviewed" && <Check className="size-3.5" />}
              {PHASE_LABELS[phase]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
