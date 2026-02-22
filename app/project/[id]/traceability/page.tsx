"use client";

import { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/lib/stores/project-store";
import { streamGenerate, StreamError } from "@/lib/api/stream-client";
import { parseReanalyzeResponse } from "@/lib/prompts/traceability";
import { clearAiMappings } from "@/lib/db/traceability";
import { updateProject } from "@/lib/db/projects";
import { MatrixTable } from "@/components/traceability/matrix-table";
import { CellDetailDialog } from "@/components/traceability/cell-detail";

export default function TraceabilityPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{
    requirementId: string;
    targetType: "plan" | "task";
    targetId: string;
  } | null>(null);

  const project = useProjectStore((s) => s.currentProject);
  const setProject = useProjectStore((s) => s.setProject);

  const handleReanalyze = useCallback(async () => {
    if (!project) return;

    setIsAnalyzing(true);
    setError(null);

    const specContent = project.phases.spec.sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n");

    const planContent = project.phases.plan.sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n");

    const tasksContent = project.phases.tasks.sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n");

    try {
      let accumulated = "";
      for await (const chunk of streamGenerate({
        action: "reanalyze-mappings",
        specContent,
        planContent,
        tasksContent,
      })) {
        accumulated += chunk;
      }

      const newMappings = parseReanalyzeResponse(accumulated);

      // Clear AI mappings, preserve manual, add new AI mappings
      const cleared = clearAiMappings(project);
      const updatedProject = {
        ...cleared,
        traceabilityMappings: [
          ...cleared.traceabilityMappings,
          ...newMappings,
        ],
      };

      await updateProject(updatedProject);
      setProject(updatedProject);
    } catch (err: unknown) {
      const message =
        err instanceof StreamError
          ? err.message
          : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [project, setProject]);

  const handleCellClick = useCallback(
    (requirementId: string, targetType: "plan" | "task", targetId: string) => {
      setSelectedCell({ requirementId, targetType, targetId });
    },
    [],
  );

  if (!project) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Traceability Matrix</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReanalyze}
          disabled={isAnalyzing}
        >
          <RefreshCw className={`mr-1.5 size-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
          {isAnalyzing ? "Analyzing…" : "Re-analyze Mappings"}
        </Button>
      </div>

      {error && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <MatrixTable project={project} onCellClick={handleCellClick} />

      <CellDetailDialog
        project={project}
        cell={selectedCell}
        onClose={() => setSelectedCell(null)}
        onUpdate={async (updatedProject) => {
          await updateProject(updatedProject);
          setProject(updatedProject);
        }}
      />
    </div>
  );
}
