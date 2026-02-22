"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProjectStore } from "@/lib/stores/project-store";
import { MarkdownRenderer } from "@/components/editor/markdown-renderer";
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
  instruction?: string;
  onInstructionChange?: (value: string) => void;
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
  instruction,
  onInstructionChange,
}: SectionEditorProps) {
  const updateSection = useProjectStore((s) => s.updateSection);
  const isSaving = useProjectStore((s) => s.isSaving);
  const phaseStatus = useProjectStore(
    (s) => s.currentProject?.phases[phaseType]?.status,
  );

  const isReviewed = phaseStatus === "reviewed";
  const effectiveReadOnly = readOnly || isReviewed;

  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

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

  const showMarkdown = effectiveReadOnly || viewMode === "preview";
  const hasContent = content.trim() !== "";

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
          {!effectiveReadOnly && hasContent && (
            <>
              <Button
                variant={viewMode === "edit" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("edit")}
              >
                Edit
              </Button>
              <Button
                variant={viewMode === "preview" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("preview")}
              >
                Preview
              </Button>
            </>
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
      {onInstructionChange && !effectiveReadOnly && (
        <Input
          placeholder="Instructions for AI regeneration..."
          value={instruction ?? ""}
          onChange={(e) => onInstructionChange(e.target.value)}
          className="text-sm"
        />
      )}
      {showMarkdown && hasContent && !isRegenerating ? (
        <div
          role={isReviewed ? "button" : undefined}
          tabIndex={isReviewed ? 0 : undefined}
          onClick={isReviewed ? handleTextareaClick : undefined}
          onKeyDown={isReviewed ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleTextareaClick();
            }
          } : undefined}
          className={cn(
            "rounded-md border p-4",
            isReviewed && "opacity-75 cursor-pointer",
          )}
        >
          <MarkdownRenderer content={content} />
        </div>
      ) : (
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
      )}
    </div>
  );
}
