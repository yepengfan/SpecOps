"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProjectStore } from "@/lib/stores/project-store";
import type { PhaseType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SectionEditorProps {
  phaseType: PhaseType;
  sectionId: string;
  title: string;
  content: string;
  readOnly?: boolean;
  onRequestEdit?: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function SectionEditor({
  phaseType,
  sectionId,
  title,
  content,
  readOnly,
  onRequestEdit,
  onRegenerate,
  isRegenerating,
}: SectionEditorProps) {
  const updateSection = useProjectStore((s) => s.updateSection);
  const isSaving = useProjectStore((s) => s.isSaving);
  const phaseStatus = useProjectStore(
    (s) => s.currentProject?.phases[phaseType]?.status,
  );

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
    if (isReviewed && onRequestEdit) {
      onRequestEdit();
    }
  }, [isReviewed, onRequestEdit]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 id={headingId} className="text-lg font-semibold">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {isRegenerating && (
            <span className="text-sm text-muted-foreground" aria-live="polite">
              Regenerating…
            </span>
          )}
          {isSaving && (
            <span
              className="text-sm text-muted-foreground"
              aria-live="polite"
            >
              Saving…
            </span>
          )}
          {onRegenerate && !effectiveReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              Regenerate
            </Button>
          )}
        </div>
      </div>
      <Textarea
        aria-labelledby={headingId}
        value={content}
        onChange={handleChange}
        readOnly={effectiveReadOnly || isRegenerating}
        onClick={handleTextareaClick}
        className={cn(
          "min-h-32 font-mono",
          isReviewed && "opacity-75 cursor-pointer",
          isRegenerating && "opacity-50",
        )}
      />
    </div>
  );
}
