"use client";

import { use, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { getProject } from "@/lib/db/projects";
import { useProjectStore } from "@/lib/stores/project-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { PhaseNav } from "@/components/phase/phase-nav";
import { ExportPanel } from "@/components/phase/export-panel";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableProjectName } from "@/components/ui/editable-project-name";
import type { PhaseType } from "@/lib/types";

const SEGMENT_TO_PHASE: Record<string, PhaseType> = {
  requirements: "spec",
  plan: "plan",
  tasks: "tasks",
  traceability: "tasks",
};

function usePhaseType(): PhaseType {
  const pathname = usePathname();
  // pathname like /project/<id>/requirements or /project/<id>/plan
  const segment = pathname.split("/").pop() || "";
  return SEGMENT_TO_PHASE[segment] ?? "spec";
}

export default function ProjectLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const phaseType = usePhaseType();
  const project = useProjectStore((s) => s.currentProject);
  const { isOpen, togglePanel, loadHistory } = useChatStore();

  useEffect(() => {
    let cancelled = false;

    getProject(id)
      .then((p) => {
        if (cancelled) return;
        if (!p) {
          router.replace("/");
          return;
        }
        useProjectStore.getState().setProject(p);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) router.replace("/");
      });

    return () => {
      cancelled = true;
      useProjectStore.getState().clearProject();
    };
  }, [id, router]);

  // Load chat history when panel opens
  useEffect(() => {
    if (isOpen) {
      loadHistory(id);
    }
  }, [isOpen, id, loadHistory]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-9 w-72" />
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <EditableProjectName />
        <div className="flex items-center gap-2">
          <button
            onClick={togglePanel}
            aria-label="Toggle chat"
            className="rounded-md border p-2 hover:bg-muted"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <ExportPanel />
        </div>
      </div>
      <PhaseNav projectId={id} />
      <div role="tabpanel">{children}</div>
      {project && (
        <ChatPanel
          projectId={id}
          project={project}
          phaseType={phaseType}
        />
      )}
    </div>
  );
}
