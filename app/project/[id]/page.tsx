"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProject } from "@/lib/db/projects";
import { getActivePhase } from "@/lib/utils/project";

export default function ProjectRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    getProject(id).then((project) => {
      if (!project) {
        router.replace("/");
        return;
      }
      router.replace(`/project/${id}/${getActivePhase(project)}`);
    });
  }, [id, router]);

  return <p className="py-8 text-muted-foreground">Loading project...</p>;
}
