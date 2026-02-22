"use client";

import { useCallback } from "react";
import { Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/lib/stores/project-store";
import { generateMarkdown } from "@/lib/export/markdown";
import { downloadProjectZip, downloadFile } from "@/lib/export/zip";

export function ExportPanel() {
  const project = useProjectStore((s) => s.currentProject);

  const allReviewed =
    project?.phases.spec.status === "reviewed" &&
    project?.phases.plan.status === "reviewed" &&
    project?.phases.tasks.status === "reviewed";

  const handleExportZip = useCallback(async () => {
    if (!project) return;
    await downloadProjectZip(project);
  }, [project]);

  const handleExportFile = useCallback(
    (phase: "spec" | "plan" | "tasks") => {
      if (!project) return;
      const md = generateMarkdown(project);
      downloadFile(`${phase}.md`, md[phase]);
    },
    [project],
  );

  if (!project) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportZip}
        disabled={!allReviewed}
        title={allReviewed ? "Export all phases as zip" : "All phases must be reviewed before exporting"}
      >
        <Download className="mr-1.5 size-3.5" />
        Export Zip
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleExportFile("spec")}
        disabled={!allReviewed}
        title={allReviewed ? "Download spec.md" : "All phases must be reviewed before exporting"}
      >
        <FileDown className="mr-1.5 size-3.5" />
        Spec
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleExportFile("plan")}
        disabled={!allReviewed}
        title={allReviewed ? "Download plan.md" : "All phases must be reviewed before exporting"}
      >
        <FileDown className="mr-1.5 size-3.5" />
        Plan
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleExportFile("tasks")}
        disabled={!allReviewed}
        title={allReviewed ? "Download tasks.md" : "All phases must be reviewed before exporting"}
      >
        <FileDown className="mr-1.5 size-3.5" />
        Tasks
      </Button>
    </div>
  );
}
