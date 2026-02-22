"use client";

import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/lib/stores/project-store";
import type { PhaseType } from "@/lib/types";

interface ApproveButtonProps {
  phaseType: PhaseType;
}

export function ApproveButton({ phaseType }: ApproveButtonProps) {
  const phase = useProjectStore((s) => s.currentProject?.phases[phaseType]);
  const approvePhase = useProjectStore((s) => s.approvePhase);

  if (!phase || phase.status !== "draft") return null;

  const allFilled = phase.sections.every((s) => s.content.trim() !== "");

  return (
    <Button
      onClick={() => approvePhase(phaseType)}
      disabled={!allFilled}
    >
      Approve &amp; Continue
    </Button>
  );
}
