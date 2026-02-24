"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  projectId: string;
  projectName: string;
  currentPhase?: "overview" | "spec" | "plan" | "tasks" | "traceability";
}

const PHASE_LABELS: Record<string, string> = {
  spec: "Spec",
  plan: "Plan",
  tasks: "Tasks",
  traceability: "Traceability",
};

export function Breadcrumb({ projectId, projectName, currentPhase }: BreadcrumbProps) {
  const isOverview = !currentPhase || currentPhase === "overview";

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {/* Projects segment */}
        <li>
          <Link href="/" className="hover:text-foreground transition-colors">
            Projects
          </Link>
        </li>

        <li aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </li>

        {/* Project name segment */}
        <li>
          {isOverview ? (
            <span
              aria-current="page"
              className="truncate max-w-[200px] inline-block align-bottom font-medium text-foreground"
            >
              {projectName}
            </span>
          ) : (
            <Link
              href={`/project/${projectId}/overview`}
              className="truncate max-w-[200px] inline-block align-bottom hover:text-foreground transition-colors"
            >
              {projectName}
            </Link>
          )}
        </li>

        {/* Phase segment (only when not on overview) */}
        {!isOverview && currentPhase && (
          <>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li>
              <span aria-current="page" className="font-medium text-foreground">
                {PHASE_LABELS[currentPhase] ?? currentPhase}
              </span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
