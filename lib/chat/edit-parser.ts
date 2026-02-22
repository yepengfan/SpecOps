import type { SuggestedEdit } from "@/lib/types/chat";

const VALID_PHASE_TYPES = new Set(["spec", "plan", "tasks"]);

const EDIT_REGEX = /\[EDIT\s+([^\]\n]+)\]([\s\S]*?)\[\/EDIT\]/;

export function parseEditSuggestion(text: string): SuggestedEdit | null {
  const match = EDIT_REGEX.exec(text);
  if (!match) return null;

  const header = match[1].trim();
  const tokens = header.split(/\s+/);

  if (tokens.length < 2) return null;

  const sectionId = tokens[0];
  const phaseType = tokens[1];

  if (!VALID_PHASE_TYPES.has(phaseType)) return null;

  const proposedContent = match[2].trim();

  return {
    sectionId,
    phaseType: phaseType as SuggestedEdit["phaseType"],
    proposedContent,
    status: "pending",
  };
}
