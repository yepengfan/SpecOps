"use client";

import { User, Bot } from "lucide-react";
import type { Project, TraceabilityMapping } from "@/lib/types";
import { parseRequirementIds, getCoverageStats } from "@/lib/db/traceability";
import { PLAN_SECTIONS } from "@/lib/types/sections";
import { TASKS_SECTIONS } from "@/lib/types/sections";
import { cn } from "@/lib/utils";

interface MatrixTableProps {
  project: Project;
  onCellClick?: (requirementId: string, targetType: "plan" | "task", targetId: string) => void;
}

export function MatrixTable({ project, onCellClick }: MatrixTableProps) {
  const requirements = parseRequirementIds(project);
  const stats = getCoverageStats(project);
  const mappings = project.traceabilityMappings;

  const planColumns = PLAN_SECTIONS.map((s) => ({
    id: s.id,
    title: s.title,
    type: "plan" as const,
  }));

  const taskColumns = TASKS_SECTIONS.map((s) => ({
    id: s.id,
    title: s.title,
    type: "task" as const,
  }));

  const allColumns = [...planColumns, ...taskColumns];

  function findMapping(
    reqId: string,
    targetType: "plan" | "task",
    targetId: string,
  ): TraceabilityMapping | undefined {
    return mappings.find(
      (m) =>
        m.requirementId === reqId &&
        m.targetType === targetType &&
        m.targetId === targetId,
    );
  }

  function isRowCovered(reqId: string): boolean {
    return mappings.some((m) => m.requirementId === reqId);
  }

  if (requirements.length === 0) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800" role="status">
        No requirements found. Requirements should use the format &quot;**FR-NNN**: description&quot; in the EARS Requirements section of the spec.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-6 text-sm text-muted-foreground">
        <span>
          Plan coverage: {stats.planCoverage.covered} of {stats.planCoverage.total} requirements
        </span>
        <span>
          Task coverage: {stats.taskCoverage.covered} of {stats.taskCoverage.total} requirements
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="sticky left-0 z-10 bg-muted/50 px-3 py-2 text-left font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">Requirement</th>
              {planColumns.map((col) => (
                <th
                  key={`plan-${col.id}`}
                  className="border-l px-2 py-2 text-center font-medium"
                  title={col.title}
                >
                  <span className="block text-xs text-muted-foreground">Plan</span>
                  <span className="block truncate max-w-[80px]">{col.title}</span>
                </th>
              ))}
              {taskColumns.map((col) => (
                <th
                  key={`task-${col.id}`}
                  className="border-l px-2 py-2 text-center font-medium"
                  title={col.title}
                >
                  <span className="block text-xs text-muted-foreground">Task</span>
                  <span className="block truncate max-w-[80px]">{col.title}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requirements.map((req) => {
              const covered = isRowCovered(req.id);
              return (
                <tr
                  key={req.id}
                  className={cn(
                    "border-b",
                    !covered && "bg-amber-50",
                  )}
                >
                  <td className="sticky left-0 z-10 bg-background px-3 py-2 font-medium whitespace-nowrap shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    {req.label}
                  </td>
                  {allColumns.map((col) => {
                    const mapping = findMapping(req.id, col.type, col.id);
                    return (
                      <td
                        key={`${col.type}-${col.id}`}
                        className="border-l px-2 py-2 text-center cursor-pointer hover:bg-muted/50"
                        onClick={() => onCellClick?.(req.id, col.type, col.id)}
                        role="button"
                        aria-label={`${req.label} - ${col.title}: ${mapping ? "linked" : "not linked"}`}
                      >
                        {mapping ? (
                          <span className="inline-flex items-center justify-center" title={`Origin: ${mapping.origin}`}>
                            {mapping.origin === "ai" ? (
                              <Bot className="size-4 text-blue-500" />
                            ) : (
                              <User className="size-4 text-green-600" />
                            )}
                          </span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Bot className="size-3 text-blue-500" /> AI mapping
        </span>
        <span className="inline-flex items-center gap-1">
          <User className="size-3 text-green-600" /> Manual mapping
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-3 rounded bg-amber-50 border border-amber-200" /> Gap (no mappings)
        </span>
      </div>
    </div>
  );
}
