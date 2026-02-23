"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProjectStore, getActivePhase } from "@/lib/stores/project-store";
import { SectionEditor } from "@/components/editor/section-editor";
import { ApproveButton } from "@/components/phase/approve-button";
import { EvaluationPanel } from "@/components/eval/evaluation-panel";
import { cn } from "@/lib/utils";
import type { PhaseType } from "@/lib/types";

interface GatedPhasePageProps {
  phaseType: PhaseType;
  onRegenerate?: (sectionId: string, instruction?: string) => void;
  regeneratingSection?: string | null;
  sectionInstructions?: Record<string, string>;
  onInstructionChange?: (sectionId: string, value: string) => void;
  defaultViewMode?: "edit" | "preview";
  generationKey?: number;
}

export function GatedPhasePage({
  phaseType,
  onRegenerate,
  regeneratingSection,
  sectionInstructions,
  onInstructionChange,
  defaultViewMode,
  generationKey,
}: GatedPhasePageProps) {
  const project = useProjectStore((s) => s.currentProject);
  const editReviewedPhase = useProjectStore((s) => s.editReviewedPhase);
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  // null means "all sections open" (default before user interacts)
  const [openSections, setOpenSections] = useState<Set<string> | null>(null);
  // Reset collapsible state when content is regenerated
  const [prevGenerationKey, setPrevGenerationKey] = useState(generationKey);
  if (generationKey !== prevGenerationKey) {
    setPrevGenerationKey(generationKey);
    if (openSections !== null) setOpenSections(null);
  }

  const phase = project?.phases[phaseType];
  const isLocked = phase?.status === "locked";

  useEffect(() => {
    if (project && isLocked) {
      const active = getActivePhase(project);
      router.replace(`/project/${project.id}/${active}`);
    }
  }, [project, isLocked, router]);

  const handleRequestEdit = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleConfirmEdit = useCallback(() => {
    editReviewedPhase(phaseType);
    setConfirmOpen(false);
  }, [editReviewedPhase, phaseType]);

  const isSectionOpen = useCallback(
    (id: string) => openSections === null || openSections.has(id),
    [openSections],
  );

  const toggleSection = useCallback(
    (id: string, open: boolean) => {
      setOpenSections((prev) => {
        // Materialize the full set on first interaction
        const current =
          prev ?? new Set(phase?.sections.map((s) => s.id) ?? []);
        const next = new Set(current);
        if (open) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    },
    [phase],
  );

  const allExpanded = phase
    ? openSections === null || phase.sections.every((s) => openSections.has(s.id))
    : false;

  const toggleAll = useCallback(() => {
    if (!phase) return;
    if (allExpanded) {
      setOpenSections(new Set());
    } else {
      setOpenSections(null);
    }
  }, [phase, allExpanded]);

  if (!project || !phase || isLocked) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={toggleAll}>
          {allExpanded ? "Collapse All" : "Expand All"}
        </Button>
      </div>
      {phase.sections.map((section) => (
        <Collapsible
          key={`${section.id}-${generationKey ?? 0}`}
          open={isSectionOpen(section.id)}
          onOpenChange={(open) => toggleSection(section.id, open)}
        >
          <CollapsibleTrigger className="flex w-full items-center gap-2 text-lg font-semibold hover:bg-accent/50 rounded-md px-2 py-1 -ml-2 transition-colors">
            <ChevronRight
              className={cn(
                "size-4 transition-transform",
                isSectionOpen(section.id) && "rotate-90",
              )}
            />
            {section.title}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SectionEditor
              phaseType={phaseType}
              sectionId={section.id}
              title=""
              content={section.content}
              onRequestEdit={handleRequestEdit}
              onRegenerate={
                onRegenerate
                  ? () => onRegenerate(section.id, sectionInstructions?.[section.id])
                  : undefined
              }
              isRegenerating={regeneratingSection === section.id}
              instruction={sectionInstructions?.[section.id]}
              onInstructionChange={
                onInstructionChange
                  ? (value) => onInstructionChange(section.id, value)
                  : undefined
              }
              defaultViewMode={defaultViewMode}
            />
          </CollapsibleContent>
        </Collapsible>
      ))}
      <EvaluationPanel phaseType={phaseType} />
      <ApproveButton phaseType={phaseType} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit reviewed phase?</DialogTitle>
            <DialogDescription>
              Editing this phase will require re-review of all downstream
              phases. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEdit}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
