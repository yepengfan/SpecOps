"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Lock, FileText, Layers, ListTodo, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectStore } from "@/lib/stores/project-store";
import { PHASE_TYPES, type PhaseType } from "@/lib/types";
import { cn } from "@/lib/utils";

const PHASE_META: Record<
  PhaseType,
  { label: string; icon: React.ElementType }
> = {
  spec: { label: "Specification", icon: FileText },
  plan: { label: "Plan", icon: Layers },
  tasks: { label: "Tasks", icon: ListTodo },
};

const STATUS_LABELS: Record<string, string> = {
  locked: "Locked",
  draft: "Draft",
  reviewed: "Reviewed",
};

export default function OverviewPage() {
  const project = useProjectStore((s) => s.currentProject);
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  if (!project) return null;

  // Compute traceability coverage
  const specContent = project.phases.spec.sections
    .map((s) => s.content)
    .join("\n");
  const requirementIds = new Set(
    [...specContent.matchAll(/\b(FR-\d{3}|NFR-\d{3})\b/g)].map((m) => m[1]),
  );
  const mappedRequirements = new Set(
    project.traceabilityMappings.map((m) => m.requirementId),
  );
  const coveredCount = [...requirementIds].filter((id) =>
    mappedRequirements.has(id),
  ).length;
  const totalRequirements = requirementIds.size;
  const coveragePercent =
    totalRequirements > 0
      ? Math.round((coveredCount / totalRequirements) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Phase progress cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PHASE_TYPES.map((phase) => {
          const phaseData = project.phases[phase];
          const meta = PHASE_META[phase];
          const Icon = meta.icon;
          const status = phaseData.status;
          const sectionsWithContent = phaseData.sections.filter(
            (s) => s.content.trim() !== "",
          ).length;
          const totalSections = phaseData.sections.length;
          const evaluation = project.evaluations?.[phase];

          return (
            <Card key={phase}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-4" />
                  {meta.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                      status === "reviewed" &&
                        "border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
                      status === "locked" &&
                        "border-muted bg-muted text-muted-foreground",
                      status === "draft" &&
                        "border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                    )}
                  >
                    {status === "reviewed" && <Check className="size-3" />}
                    {status === "locked" && <Lock className="size-3" />}
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {sectionsWithContent}/{totalSections} sections with content
                </p>
                {evaluation && (
                  <p className="text-sm text-muted-foreground">
                    Eval: {evaluation.ruleResults.filter((r) => r.passed).length}/
                    {evaluation.ruleResults.length} passing
                  </p>
                )}
                {status !== "locked" && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/project/${projectId}/${phase}`}>
                      Open
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Traceability coverage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="size-4" />
            Traceability Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {totalRequirements > 0 ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{coveragePercent}%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {coveredCount} of {totalRequirements} requirements mapped
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No requirements detected yet. Generate a spec to get started.
            </p>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/project/${projectId}/traceability`}>
              View Matrix
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
