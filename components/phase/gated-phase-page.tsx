"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import type { PhaseType } from "@/lib/types";

interface GatedPhasePageProps {
  phaseType: PhaseType;
  onRegenerate?: (sectionId: string) => void;
  regeneratingSection?: string | null;
}

export function GatedPhasePage({
  phaseType,
  onRegenerate,
  regeneratingSection,
}: GatedPhasePageProps) {
  const project = useProjectStore((s) => s.currentProject);
  const editReviewedPhase = useProjectStore((s) => s.editReviewedPhase);
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  if (!project || !phase || isLocked) return null;

  return (
    <div className="space-y-6">
      {phase.sections.map((section) => (
        <SectionEditor
          key={section.id}
          phaseType={phaseType}
          sectionId={section.id}
          title={section.title}
          content={section.content}
          onRequestEdit={handleRequestEdit}
          onRegenerate={
            onRegenerate ? () => onRegenerate(section.id) : undefined
          }
          isRegenerating={regeneratingSection === section.id}
        />
      ))}
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
