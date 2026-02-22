"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { GatedPhasePage } from "@/components/phase/gated-phase-page";
import { useProjectStore } from "@/lib/stores/project-store";
import { streamGenerate, StreamError } from "@/lib/api/stream-client";
import { parseTaskSections } from "@/lib/prompts/tasks";

export default function TasksPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [malformedWarning, setMalformedWarning] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(
    null,
  );
  const [sectionInstructions, setSectionInstructions] = useState<Record<string, string>>({});

  const updateSection = useProjectStore((s) => s.updateSection);
  const editReviewedPhase = useProjectStore((s) => s.editReviewedPhase);
  const project = useProjectStore((s) => s.currentProject);

  const isBusy = isGenerating || regeneratingSection !== null;
  const planReviewed = project?.phases.plan.status === "reviewed";
  const canGenerate = planReviewed && !isBusy;

  const handleGenerate = useCallback(async () => {
    if (!project) return;

    setIsGenerating(true);
    setError(null);
    setMalformedWarning(false);

    const specContent = project.phases.spec.sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n");

    const planContent = project.phases.plan.sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n");

    try {
      let accumulated = "";
      for await (const chunk of streamGenerate({
        action: "generate-tasks",
        specContent,
        planContent,
      })) {
        accumulated += chunk;
      }

      const parsed = parseTaskSections(accumulated);

      // Transition back to draft if phase was reviewed, so updateSection writes aren't dropped
      if (project.phases.tasks.status === "reviewed") {
        editReviewedPhase("tasks");
      }

      if (parsed.malformed) {
        setMalformedWarning(true);
        updateSection("tasks", "task-list", accumulated);
      } else {
        updateSection("tasks", "task-list", parsed.taskList);
        updateSection("tasks", "dependencies", parsed.dependencies);
        updateSection("tasks", "file-mapping", parsed.fileMapping);
        updateSection("tasks", "test-expectations", parsed.testExpectations);
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
  }, [project, updateSection, editReviewedPhase]);

  const handleRegenerate = useCallback(
    async (sectionId: string, instruction?: string) => {
      if (!project || isGenerating) return;

      setRegeneratingSection(sectionId);
      setError(null);
      setMalformedWarning(false);

      const phase = project.phases.tasks;
      const phaseContext = phase.sections
        .map((s) => `## ${s.title}\n${s.content}`)
        .join("\n\n");

      const section = phase.sections.find((s) => s.id === sectionId);
      const sectionName = section?.title || sectionId;

      try {
        let accumulated = "";
        for await (const chunk of streamGenerate({
          action: "regenerate-task-section",
          sectionName,
          phaseContext,
          instruction,
        })) {
          accumulated += chunk;
        }

        if (project.phases.tasks.status === "reviewed") {
          editReviewedPhase("tasks");
        }
        updateSection("tasks", sectionId, accumulated);
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
    [project, updateSection, editReviewedPhase, isGenerating],
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

      {project && !planReviewed && (
        <div
          className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          role="status"
        >
          Plan must be reviewed before generating tasks.
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
        phaseType="tasks"
        onRegenerate={handleRegenerate}
        regeneratingSection={regeneratingSection}
        sectionInstructions={sectionInstructions}
        onInstructionChange={handleInstructionChange}
      />
    </div>
  );
}
