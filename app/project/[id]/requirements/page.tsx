"use client";

import { useProjectStore } from "@/lib/stores/project-store";
import { SectionEditor } from "@/components/editor/section-editor";
import { ApproveButton } from "@/components/phase/approve-button";

export default function RequirementsPage() {
  const phase = useProjectStore((s) => s.currentProject?.phases.requirements);

  if (!phase) return null;

  return (
    <div className="space-y-6">
      {phase.sections.map((section) => (
        <SectionEditor
          key={section.id}
          phaseType="requirements"
          sectionId={section.id}
          title={section.title}
          content={section.content}
        />
      ))}
      <ApproveButton phaseType="requirements" />
    </div>
  );
}
