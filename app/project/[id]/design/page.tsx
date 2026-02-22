"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore, getActivePhase } from "@/lib/stores/project-store";
import { SectionEditor } from "@/components/editor/section-editor";
import { ApproveButton } from "@/components/phase/approve-button";

export default function DesignPage() {
  const project = useProjectStore((s) => s.currentProject);
  const router = useRouter();

  const isLocked = project?.phases.design.status === "locked";

  useEffect(() => {
    if (project && isLocked) {
      const active = getActivePhase(project);
      router.replace(`/project/${project.id}/${active}`);
    }
  }, [project, isLocked, router]);

  if (!project || isLocked) return null;

  const phase = project.phases.design;

  return (
    <div className="space-y-6">
      {phase.sections.map((section) => (
        <SectionEditor
          key={section.id}
          phaseType="design"
          sectionId={section.id}
          title={section.title}
          content={section.content}
        />
      ))}
      <ApproveButton phaseType="design" />
    </div>
  );
}
