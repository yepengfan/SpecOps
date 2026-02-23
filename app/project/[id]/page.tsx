"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProject } from "@/lib/db/projects";

export default function ProjectRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    getProject(id)
      .then((project) => {
        if (!project) {
          router.replace("/");
          return;
        }
        router.replace(`/project/${id}/overview`);
      })
      .catch(() => {
        router.replace("/");
      });
  }, [id, router]);

  return <p className="py-8 text-muted-foreground">Loading project...</p>;
}
