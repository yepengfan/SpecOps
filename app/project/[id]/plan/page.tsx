"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GatedPhasePage } from "@/components/phase/gated-phase-page";
import { useProjectStore } from "@/lib/stores/project-store";
import { streamGenerate, StreamError } from "@/lib/api/stream-client";
import { parsePlanSections } from "@/lib/prompts/plan";
import { parseTraceabilityComment } from "@/lib/prompts/traceability";
import { clearAiMappings } from "@/lib/db/traceability";
import { updateProject } from "@/lib/db/projects";

export default function PlanPage() {
  const [isGenerating, setIsGenerating] = useState(false);
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

      // Extract traceability mappings before parsing sections
      const newMappings = parseTraceabilityComment(accumulated);
      // Strip traceability comment from content
      const cleanContent = accumulated.replace(/<!--\s*TRACEABILITY:[\s\S]*?-->/g, "").trim();

      const parsed = parsePlanSections(cleanContent);

      if (parsed.malformed) {
        toast.warning(
          "AI response did not match expected format. Content placed in first section."
        );
        // Fallback: put raw text in first section
        updateSection("plan", "architecture", cleanContent);
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

      // Persist traceability mappings using latest store state
      if (newMappings.length > 0) {
        const latestProject = useProjectStore.getState().currentProject;
        if (latestProject) {
          const cleared = clearAiMappings(latestProject);
          const withMappings = {
            ...cleared,
            traceabilityMappings: [
              ...cleared.traceabilityMappings,
              ...newMappings,
            ],
          };
          await updateProject(withMappings);
          useProjectStore.getState().setProject(withMappings);
        }
      }
      setGenerationKey((k) => k + 1);
    } catch (err: unknown) {
      const message =
        err instanceof StreamError
          ? err.message
          : "An unexpected error occurred";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  }, [project, updateSection]);

  const handleRegenerate = useCallback(
    async (sectionId: string, instruction?: string) => {
      if (!project || isGenerating) return;

      setRegeneratingSection(sectionId);

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
        toast.error(message);
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
