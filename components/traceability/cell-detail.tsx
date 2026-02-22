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
import { addMapping, removeMapping, parseRequirementIds } from "@/lib/db/traceability";
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
    // Extract number from requirement ID (supports fr-NNN, nfr-NNN, and legacy req-N)
    const isNfr = cell.requirementId.startsWith("nfr-");
    const reqNum = cell.requirementId.replace(/^(?:fr|nfr|req)-0*/, "");
    if (isNfr) {
      // Match **NFR-NNN**: format first for NFR requirements
      const nfrRegex = new RegExp(
        `\\*\\*NFR-0*${reqNum}\\*\\*:\\s*(.+)`,
      );
      const nfrMatch = specContent.match(nfrRegex);
      if (nfrMatch) return nfrMatch[0].trim();
    }
    // Match **FR-NNN**: or **REQ-N**: description format
    const boldRegex = new RegExp(
      `\\*\\*(?:FR|REQ)-0*${reqNum}\\*\\*:\\s*(.+)`,
    );
    const boldMatch = specContent.match(boldRegex);
    if (boldMatch) return boldMatch[0].trim();
    if (!isNfr) {
      // Match **NFR-NNN**: format as fallback for non-NFR IDs
      const nfrRegex = new RegExp(
        `\\*\\*NFR-0*${reqNum}\\*\\*:\\s*(.+)`,
      );
      const nfrMatch = specContent.match(nfrRegex);
      if (nfrMatch) return nfrMatch[0].trim();
    }
    // Fallback: ## FR-NNN: or ## Req N: heading format
    const headingRegex = new RegExp(
      `## (?:FR-0*${reqNum}|Req ${reqNum}):[^]*?(?=## (?:FR-|Req )\\d|$)`,
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
        requirementLabel: parseRequirementIds(project).find((r) => r.id === cell.requirementId)?.label || cell.requirementId,
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
