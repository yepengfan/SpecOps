"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { GatedPhasePage } from "@/components/phase/gated-phase-page";
import { useProjectStore } from "@/lib/stores/project-store";
import { streamGenerate, StreamError } from "@/lib/api/stream-client";
import { parsePlanSections } from "@/lib/prompts/plan";

export default function PlanPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [malformedWarning, setMalformedWarning] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(
    null,
  );
  const [sectionInstructions, setSectionInstructions] = useState<Record<string, string>>({});
  const [generationKey, setGenerationKey] = useState(0);

  const updateSection = useProjectStore((s) => s.updateSection);
  const project = useProjectStore((s) => s.currentProject);

  const isBusy = isGenerating || regeneratingSection !== null;
  const specReviewed =
    project?.phases.spec.status === "reviewed";
  const canGenerate = specReviewed && !isBusy;

  const handleGenerate = useCallback(async () => {
    if (!project) return;

    setIsGenerating(true);
    setError(null);
    setMalformedWarning(false);

    const specContent = project.phases.spec.sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n");

    try {
      let accumulated = "";
      for await (const chunk of streamGenerate({
        action: "generate-plan",
        specContent,
      })) {
        accumulated += chunk;
      }

      const parsed = parsePlanSections(accumulated);

      if (parsed.malformed) {
        setMalformedWarning(true);
        // Fallback: put raw text in first section
        updateSection("plan", "architecture", accumulated);
      } else {
        updateSection("plan", "architecture", parsed.architecture);
        updateSection("plan", "api-contracts", parsed.apiContracts);
        updateSection("plan", "data-model", parsed.dataModel);
        updateSection("plan", "tech-decisions", parsed.techDecisions);
        updateSection(
          "plan",
          "security-edge-cases",
          parsed.securityEdgeCases,
        );
      }
      setGenerationKey((k) => k + 1);
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
    async (sectionId: string, instruction?: string) => {
      if (!project || isGenerating) return;

      setRegeneratingSection(sectionId);
      setError(null);

      const phase = project.phases.plan;
      const phaseContext = phase.sections
        .map((s) => `## ${s.title}\n${s.content}`)
        .join("\n\n");

      const section = phase.sections.find((s) => s.id === sectionId);
      const sectionName = section?.title || sectionId;

      try {
        let accumulated = "";
        for await (const chunk of streamGenerate({
          action: "regenerate-plan-section",
          sectionName,
          phaseContext,
          instruction,
        })) {
          accumulated += chunk;
        }

        updateSection("plan", sectionId, accumulated);
        // Clear instruction on successful regeneration
        setSectionInstructions((prev) => {
          const next = { ...prev };
          delete next[sectionId];
          return next;
        });
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

  const handleInstructionChange = useCallback(
    (sectionId: string, value: string) => {
      setSectionInstructions((prev) => ({ ...prev, [sectionId]: value }));
    },
    [],
  );

  return (
    <div className="space-y-6">
      <Button onClick={handleGenerate} disabled={!canGenerate}>
        {isGenerating ? "Generating…" : "Generate"}
      </Button>

      {project && !specReviewed && (
        <div
          className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          role="status"
        >
          Spec must be reviewed before generating a plan.
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
        phaseType="plan"
        onRegenerate={handleRegenerate}
        regeneratingSection={regeneratingSection}
        sectionInstructions={sectionInstructions}
        onInstructionChange={handleInstructionChange}
        defaultViewMode="preview"
        generationKey={generationKey}
      />
    </div>
  );
}
