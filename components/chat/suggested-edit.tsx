"use client";

import { useProjectStore } from "@/lib/stores/project-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { updateChatMessage } from "@/lib/db/chat-messages";
import { SPEC_SECTIONS, PLAN_SECTIONS, TASKS_SECTIONS } from "@/lib/types/sections";
import type { ChatMessage } from "@/lib/types/chat";
import type { PhaseType } from "@/lib/types";

const ALL_SECTIONS = [...SPEC_SECTIONS, ...PLAN_SECTIONS, ...TASKS_SECTIONS];

function getSectionTitle(sectionId: string): string {
  const section = ALL_SECTIONS.find((s) => s.id === sectionId);
  return section?.title ?? sectionId;
}

interface SuggestedEditProps {
  message: ChatMessage;
  projectId: string;
}

export function SuggestedEdit({ message }: SuggestedEditProps) {
  const currentProject = useProjectStore((s) => s.currentProject);
  const edit = message.suggestedEdit;

  if (!edit) return null;

  const title = getSectionTitle(edit.sectionId);
  const isPending = edit.status === "pending";
  const phaseStatus = currentProject?.phases[edit.phaseType as PhaseType]?.status;
  const isLocked = phaseStatus === "reviewed" || phaseStatus === "locked";

  const handleApply = async () => {
    if (isLocked) return;

    useProjectStore
      .getState()
      .updateSection(
        edit.phaseType as PhaseType,
        edit.sectionId,
        edit.proposedContent,
      );

    const updatedEdit = { ...edit, status: "applied" as const };

    if (message.id != null) {
      await updateChatMessage(message.id, {
        suggestedEdit: updatedEdit,
      });
      useChatStore.getState().updateMessage(message.id, {
        suggestedEdit: updatedEdit,
      });
    }
  };

  const handleDismiss = async () => {
    const updatedEdit = { ...edit, status: "dismissed" as const };

    if (message.id != null) {
      await updateChatMessage(message.id, {
        suggestedEdit: updatedEdit,
      });
      useChatStore.getState().updateMessage(message.id, {
        suggestedEdit: updatedEdit,
      });
    }
  };

  return (
    <div className="mt-2 rounded-md border bg-card p-3 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">Edit: {title}</span>
        {!isPending && (
          <span
            className={
              edit.status === "applied"
                ? "text-xs text-green-600"
                : "text-xs text-muted-foreground"
            }
          >
            {edit.status === "applied" ? "Applied" : "Dismissed"}
          </span>
        )}
      </div>
      <pre className="mb-2 max-h-24 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs">
        {edit.proposedContent}
      </pre>
      {isPending && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleApply}
            disabled={isLocked}
            className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Apply
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-md border px-3 py-1 text-xs hover:bg-muted"
          >
            Dismiss
          </button>
          {isLocked && (
            <span className="text-xs text-muted-foreground">
              Phase is locked
            </span>
          )}
        </div>
      )}
    </div>
  );
}
