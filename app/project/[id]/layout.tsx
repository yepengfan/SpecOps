"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProject } from "@/lib/db/projects";
import { useProjectStore } from "@/lib/stores/project-store";
import { PhaseNav } from "@/components/phase/phase-nav";

export default function ProjectLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = use(params);
  const router = useRouter();
  const setProject = useProjectStore((s) => s.setProject);
  const clearProject = useProjectStore((s) => s.clearProject);
  const project = useProjectStore((s) => s.currentProject);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getProject(id)
      .then((p) => {
        if (cancelled) return;
        if (!p) {
          router.replace("/");
          return;
        }
        setProject(p);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) router.replace("/");
      });

    return () => {
      cancelled = true;
      clearProject();
    };
  }, [id, router, setProject, clearProject]);

  if (loading) {
    return <p className="py-8 text-muted-foreground">Loading project…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project?.name}</h1>
      </div>
      <PhaseNav projectId={id} />
      <div role="tabpanel">{children}</div>
    </div>
  );
}
