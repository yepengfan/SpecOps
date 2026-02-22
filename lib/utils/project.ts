import { PHASE_TYPES, type PhaseType, type Project } from "@/lib/types";

const PHASE_LABELS: Record<PhaseType, string> = {
  spec: "Spec",
  plan: "Plan",
  tasks: "Tasks",
};

export function getProjectDisplayStatus(project: Project): string {
  for (const phase of PHASE_TYPES) {
    if (project.phases[phase].status !== "reviewed") {
      return PHASE_LABELS[phase];
    }
  }
  return "Complete";
}

export function getActivePhase(project: Project): PhaseType {
  for (const phase of PHASE_TYPES) {
    if (project.phases[phase].status !== "reviewed") {
      return phase;
    }
  }
  return "tasks";
}

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 0) {
    return "just now";
  }

  if (diffSec < MINUTE) {
    return rtf.format(-diffSec, "second");
  }
  if (diffSec < HOUR) {
    return rtf.format(-Math.round(diffSec / MINUTE), "minute");
  }
  if (diffSec < DAY) {
    return rtf.format(-Math.round(diffSec / HOUR), "hour");
  }
  if (diffSec < DAY * 30) {
    return rtf.format(-Math.round(diffSec / DAY), "day");
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}
