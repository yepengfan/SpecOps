"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { GatedPhasePage } from "@/components/phase/gated-phase-page";
import { useProjectStore } from "@/lib/stores/project-store";
import { streamGenerate, StreamError } from "@/lib/api/stream-client";
import { parseDesignSections } from "@/lib/prompts/design";

export default function DesignPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [malformedWarning, setMalformedWarning] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(
    null,
  );

  const updateSection = useProjectStore((s) => s.updateSection);
  const project = useProjectStore((s) => s.currentProject);

  const isBusy = isGenerating || regeneratingSection !== null;
  const requirementsReviewed =
    project?.phases.requirements.status === "reviewed";
  const canGenerate = requirementsReviewed && !isBusy;

  const handleGenerate = useCallback(async () => {
    if (!project) return;

    setIsGenerating(true);
    setError(null);
    setMalformedWarning(false);

    const requirementsContent = project.phases.requirements.sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n");

    try {
      let accumulated = "";
      for await (const chunk of streamGenerate({
        action: "generate-design",
        requirementsContent,
      })) {
        accumulated += chunk;
      }

      const parsed = parseDesignSections(accumulated);

      if (parsed.malformed) {
        setMalformedWarning(true);
        // Fallback: put raw text in first section
        updateSection("design", "architecture", accumulated);
      } else {
        updateSection("design", "architecture", parsed.architecture);
        updateSection("design", "api-contracts", parsed.apiContracts);
        updateSection("design", "data-model", parsed.dataModel);
        updateSection("design", "tech-decisions", parsed.techDecisions);
        updateSection(
          "design",
          "security-edge-cases",
          parsed.securityEdgeCases,
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof StreamError
          ? err.message
          : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [project, updateSection]);

  const handleRegenerate = useCallback(
    async (sectionId: string) => {
      if (!project || isGenerating) return;

      setRegeneratingSection(sectionId);
      setError(null);

      const phase = project.phases.design;
      const phaseContext = phase.sections
        .map((s) => `## ${s.title}\n${s.content}`)
        .join("\n\n");

      const section = phase.sections.find((s) => s.id === sectionId);
      const sectionName = section?.title || sectionId;

      try {
        let accumulated = "";
        for await (const chunk of streamGenerate({
          action: "regenerate-section",
          sectionName,
          phaseContext,
        })) {
          accumulated += chunk;
        }

        updateSection("design", sectionId, accumulated);
      } catch (err: unknown) {
        const message =
          err instanceof StreamError
            ? err.message
            : "An unexpected error occurred";
        setError(message);
      } finally {
        setRegeneratingSection(null);
      }
    },
    [project, updateSection, isGenerating],
  );

  return (
    <div className="space-y-6">
      <Button onClick={handleGenerate} disabled={!canGenerate}>
        {isGenerating ? "Generating…" : "Generate"}
      </Button>

      {!requirementsReviewed && (
        <div
          className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          role="status"
        >
          Requirements must be reviewed before generating a design.
        </div>
      )}

      {error && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      {malformedWarning && (
        <div
          className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          role="status"
        >
          The AI response did not match the expected section format. The raw
          output has been placed in the first section. You can edit it manually
          or try generating again.
        </div>
      )}

      <GatedPhasePage
        phaseType="design"
        onRegenerate={handleRegenerate}
        regeneratingSection={regeneratingSection}
      />
    </div>
  );
}
