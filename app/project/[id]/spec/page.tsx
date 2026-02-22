"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GatedPhasePage } from "@/components/phase/gated-phase-page";
import { useProjectStore } from "@/lib/stores/project-store";
import { streamGenerate, StreamError } from "@/lib/api/stream-client";
import { parseSpecSections } from "@/lib/prompts/spec";

export default function SpecPage() {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [malformedWarning, setMalformedWarning] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(
    null,
  );
  const [sectionInstructions, setSectionInstructions] = useState<Record<string, string>>({});

  const updateSection = useProjectStore((s) => s.updateSection);
  const project = useProjectStore((s) => s.currentProject);

  const isBusy = isGenerating || regeneratingSection !== null;
  const canGenerate = description.trim().length >= 10 && !isBusy;

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setMalformedWarning(false);

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
        setMalformedWarning(true);
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
    } catch (err: unknown) {
      const message =
        err instanceof StreamError
          ? err.message
          : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [description, updateSection]);

  const handleRegenerate = useCallback(
    async (sectionId: string, instruction?: string) => {
      if (!project || isGenerating) return;

      setRegeneratingSection(sectionId);
      setError(null);

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
        phaseType="spec"
        onRegenerate={handleRegenerate}
        regeneratingSection={regeneratingSection}
        sectionInstructions={sectionInstructions}
        onInstructionChange={handleInstructionChange}
      />
    </div>
  );
}
