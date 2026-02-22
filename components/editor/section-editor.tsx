"use client";

import { useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useProjectStore } from "@/lib/stores/project-store";
import type { PhaseType } from "@/lib/types";

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

  const headingId = `section-heading-${sectionId}`;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateSection(phaseType, sectionId, e.target.value);
    },
    [updateSection, phaseType, sectionId],
  );

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
        readOnly={readOnly}
        className="min-h-32 font-mono"
      />
    </div>
  );
}
