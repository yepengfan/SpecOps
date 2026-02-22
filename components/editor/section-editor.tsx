"use client";

import { useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProjectStore } from "@/lib/stores/project-store";
import type { PhaseType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SectionEditorProps {
  phaseType: PhaseType;
  sectionId: string;
  title: string;
  content: string;
  readOnly?: boolean;
}

export function SectionEditor({
  phaseType,
  sectionId,
  title,
  content,
  readOnly,
}: SectionEditorProps) {
  const updateSection = useProjectStore((s) => s.updateSection);
  const isSaving = useProjectStore((s) => s.isSaving);
  const phaseStatus = useProjectStore(
    (s) => s.currentProject?.phases[phaseType]?.status,
  );
  const editReviewedPhase = useProjectStore((s) => s.editReviewedPhase);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const isReviewed = phaseStatus === "reviewed";
  const effectiveReadOnly = readOnly || isReviewed;

  const headingId = `section-heading-${sectionId}`;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateSection(phaseType, sectionId, e.target.value);
    },
    [updateSection, phaseType, sectionId],
  );

  const handleTextareaClick = useCallback(() => {
    if (isReviewed) {
      setConfirmOpen(true);
    }
  }, [isReviewed]);

  const handleConfirmEdit = useCallback(() => {
    editReviewedPhase(phaseType);
    setConfirmOpen(false);
  }, [editReviewedPhase, phaseType]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 id={headingId} className="text-lg font-semibold">
          {title}
        </h3>
        {isSaving && (
          <span
            className="text-sm text-muted-foreground"
            aria-live="polite"
          >
            Saving…
          </span>
        )}
      </div>
      <Textarea
        aria-labelledby={headingId}
        value={content}
        onChange={handleChange}
        readOnly={effectiveReadOnly}
        onClick={handleTextareaClick}
        className={cn(
          "min-h-32 font-mono",
          isReviewed && "opacity-75 cursor-pointer",
        )}
      />

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
