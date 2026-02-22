"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "@/lib/types";
import { addMapping, removeMapping } from "@/lib/db/traceability";
import { PLAN_SECTIONS, TASKS_SECTIONS } from "@/lib/types/sections";

interface CellDetailDialogProps {
  project: Project;
  cell: {
    requirementId: string;
    targetType: "plan" | "task";
    targetId: string;
  } | null;
  onClose: () => void;
  onUpdate: (project: Project) => Promise<void>;
}

export function CellDetailDialog({
  project,
  cell,
  onClose,
  onUpdate,
}: CellDetailDialogProps) {
  const isOpen = cell !== null;

  const existingMapping = cell
    ? project.traceabilityMappings.find(
        (m) =>
          m.requirementId === cell.requirementId &&
          m.targetType === cell.targetType &&
          m.targetId === cell.targetId,
      )
    : null;

  const targetSections =
    cell?.targetType === "plan" ? PLAN_SECTIONS : TASKS_SECTIONS;
  const targetSection = targetSections.find((s) => s.id === cell?.targetId);
  const targetContent = cell
    ? project.phases[cell.targetType === "plan" ? "plan" : "tasks"].sections.find(
        (s) => s.id === cell.targetId,
      )?.content
    : null;

  const reqContent = (() => {
    if (!cell) return null;
    const specContent = project.phases.spec.sections
      .map((s) => s.content)
      .join("\n");
    const reqNum = cell.requirementId.replace("req-", "");
    // Match **REQ-N**: description format (primary) or ## Req N: format (fallback)
    const boldRegex = new RegExp(
      `\\*\\*REQ-${reqNum}\\*\\*:\\s*(.+)`,
    );
    const boldMatch = specContent.match(boldRegex);
    if (boldMatch) return boldMatch[0].trim();
    const headingRegex = new RegExp(
      `## Req ${reqNum}:[^]*?(?=## Req \\d|$)`,
    );
    const headingMatch = specContent.match(headingRegex);
    return headingMatch ? headingMatch[0].trim() : null;
  })();

  const handleToggle = useCallback(async () => {
    if (!cell) return;

    let updatedProject: Project;
    if (existingMapping) {
      updatedProject = removeMapping(project, existingMapping.id);
    } else {
      const newMapping = {
        id: `manual-${cell.targetType}-${cell.targetId}-${cell.requirementId}-${Date.now()}`,
        requirementId: cell.requirementId,
        requirementLabel: cell.requirementId,
        targetType: cell.targetType,
        targetId: cell.targetId,
        targetLabel: targetSection?.title || cell.targetId,
        origin: "manual" as const,
        createdAt: Date.now(),
      };
      updatedProject = addMapping(project, newMapping);
    }

    await onUpdate(updatedProject);
  }, [cell, existingMapping, project, onUpdate, targetSection]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {cell?.requirementId} &rarr; {targetSection?.title || cell?.targetId}
          </DialogTitle>
          <DialogDescription>
            {existingMapping
              ? `Linked (${existingMapping.origin} mapping)`
              : "Not linked"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
          <div>
            <h4 className="mb-2 text-sm font-medium">Requirement</h4>
            <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
              {reqContent || "Requirement content not found"}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium">
              {cell?.targetType === "plan" ? "Plan" : "Task"}: {targetSection?.title}
            </h4>
            <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap max-h-[40vh] overflow-y-auto">
              {targetContent || "Section content not found"}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant={existingMapping ? "destructive" : "default"}
            onClick={handleToggle}
          >
            {existingMapping ? "Remove Mapping" : "Add Manual Mapping"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
