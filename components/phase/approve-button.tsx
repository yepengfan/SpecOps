"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LiveRegion } from "@/components/ui/live-region";
import { useProjectStore } from "@/lib/stores/project-store";
import type { PhaseType } from "@/lib/types";

interface ApproveButtonProps {
  phaseType: PhaseType;
}

export function ApproveButton({ phaseType }: ApproveButtonProps) {
  const phase = useProjectStore((s) => s.currentProject?.phases[phaseType]);
  const approvePhase = useProjectStore((s) => s.approvePhase);
  const [justApproved, setJustApproved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleApprove = useCallback(() => {
    approvePhase(phaseType);
    setJustApproved(true);
    timerRef.current = setTimeout(() => setJustApproved(false), 3000);
  }, [approvePhase, phaseType]);

  if (!phase || phase.status !== "draft") return null;

  const allFilled = phase.sections.every((s) => s.content.trim() !== "");

  return (
    <>
      <Button onClick={handleApprove} disabled={!allFilled}>
        Approve &amp; Continue
      </Button>
      <LiveRegion message={justApproved ? "Phase approved" : ""} />
    </>
  );
}
