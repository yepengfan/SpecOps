"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GatedPhasePage } from "@/components/phase/gated-phase-page";
import { GenerationStatus } from "@/components/ui/generation-status";
import { WorkflowIndicator } from "@/components/phase/workflow-indicator";
import { useProjectStore } from "@/lib/stores/project-store";
import { streamGenerate, StreamError } from "@/lib/api/stream-client";
import { parseSpecSections } from "@/lib/prompts/spec";

export default function SpecPage() {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(
    null,
  );
  const [sectionInstructions, setSectionInstructions] = useState<Record<string, string>>({});
  const [generationKey, setGenerationKey] = useState(0);

  const updateSection = useProjectStore((s) => s.updateSection);
  const project = useProjectStore((s) => s.currentProject);

  const isBusy = isGenerating || regeneratingSection !== null;
  const canGenerate = description.trim().length >= 10 && !isBusy;
  const isEmpty = project?.phases.spec.sections.every(
    (s) => s.content.trim() === "",
  ) ?? true;

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);

    try {
      let accumulated = "";
      for await (const chunk of streamGenerate({
        action: "generate-spec",
        projectDescription: description,
      })) {
        accumulated += chunk;
      }

      const parsed = parseSpecSections(accumulated);

      if (parsed.malformed) {
        toast.warning(
          "AI response did not match expected format. Content placed in first section."
        );
        // Fallback: put raw text in first section
        updateSection("spec", "problem-statement", accumulated);
      } else {
        updateSection(
          "spec",
          "problem-statement",
          parsed.problemStatement,
        );
        updateSection(
          "spec",
          "ears-requirements",
          parsed.earsRequirements,
        );
        updateSection(
          "spec",
          "non-functional-requirements",
          parsed.nonFunctionalRequirements,
        );
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
  }, [description, updateSection]);

  const handleRegenerate = useCallback(
    async (sectionId: string, instruction?: string) => {
      if (!project || isGenerating) return;

      setRegeneratingSection(sectionId);

      const phase = project.phases.spec;
      const phaseContext = phase.sections
        .map((s) => `## ${s.title}\n${s.content}`)
        .join("\n\n");

      const section = phase.sections.find((s) => s.id === sectionId);
      const sectionName = section?.title || sectionId;

      try {
        let accumulated = "";
        for await (const chunk of streamGenerate({
          action: "regenerate-spec-section",
          sectionName,
          phaseContext,
          instruction,
        })) {
          accumulated += chunk;
        }

        updateSection("spec", sectionId, accumulated);
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
      <div className="space-y-2">
        <label htmlFor="project-description" className="text-sm font-medium">
          Project Description
        </label>
        <Textarea
          id="project-description"
          placeholder="Describe your project (minimum 10 characters)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24 font-mono"
          disabled={isBusy}
        />
      </div>

      <Button onClick={handleGenerate} disabled={!canGenerate}>
        {isGenerating ? "Generating…" : "Generate"}
      </Button>

      <GenerationStatus phase="spec" isActive={isGenerating} />

      {isEmpty && !isGenerating && (
        <div className="space-y-3">
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Start by describing your project above, then click Generate to create
            a specification.
          </div>
          <WorkflowIndicator />
        </div>
      )}

      <GatedPhasePage
        phaseType="spec"
        onRegenerate={handleRegenerate}
        regeneratingSection={regeneratingSection}
        sectionInstructions={sectionInstructions}
        onInstructionChange={handleInstructionChange}
        generationKey={generationKey}
      />
    </div>
  );
}
