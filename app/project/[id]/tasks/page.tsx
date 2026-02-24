"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GatedPhasePage } from "@/components/phase/gated-phase-page";
import { GenerationStatus } from "@/components/ui/generation-status";
import { useProjectStore } from "@/lib/stores/project-store";
import { streamGenerate, StreamError } from "@/lib/api/stream-client";
import { parseTaskSections } from "@/lib/prompts/tasks";
import { parseTraceabilityComment } from "@/lib/prompts/traceability";
import { clearAiMappings } from "@/lib/db/traceability";
import { updateProject } from "@/lib/db/projects";

export default function TasksPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(
    null,
  );
  const [sectionInstructions, setSectionInstructions] = useState<Record<string, string>>({});
  const [generationKey, setGenerationKey] = useState(0);

  const updateSection = useProjectStore((s) => s.updateSection);
  const editReviewedPhase = useProjectStore((s) => s.editReviewedPhase);
  const project = useProjectStore((s) => s.currentProject);

  const isBusy = isGenerating || regeneratingSection !== null;
  const planReviewed = project?.phases.plan.status === "reviewed";
  const canGenerate = planReviewed && !isBusy;

  const handleGenerate = useCallback(async () => {
    if (!project) return;

    setIsGenerating(true);


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

      // Extract traceability mappings before parsing sections
      const newMappings = parseTraceabilityComment(accumulated);
      const cleanContent = accumulated.replace(/<!--\s*TRACEABILITY:[\s\S]*?-->/g, "").trim();

      const parsed = parseTaskSections(cleanContent);

      // Transition back to draft if phase was reviewed, so updateSection writes aren't dropped
      if (project.phases.tasks.status === "reviewed") {
        editReviewedPhase("tasks");
      }

      if (parsed.malformed) {
        toast.warning(
          "AI response did not match expected format. Content placed in first section."
        );
        updateSection("tasks", "task-list", cleanContent);
      } else {
        updateSection("tasks", "task-list", parsed.taskList);
        updateSection("tasks", "dependencies", parsed.dependencies);
        updateSection("tasks", "file-mapping", parsed.fileMapping);
        updateSection("tasks", "test-expectations", parsed.testExpectations);
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
  }, [project, updateSection, editReviewedPhase]);

  const handleRegenerate = useCallback(
    async (sectionId: string, instruction?: string) => {
      if (!project || isGenerating) return;

      setRegeneratingSection(sectionId);
  

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
        toast.error(message);
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

      <GenerationStatus phase="tasks" isActive={isGenerating} />

      {project && !planReviewed && (
        <div
          className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground"
          role="status"
        >
          Plan must be reviewed before generating tasks.
        </div>
      )}

      <GatedPhasePage
        phaseType="tasks"
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
