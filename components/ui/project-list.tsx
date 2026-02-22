"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { listProjects, StorageError } from "@/lib/db/projects";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ui/project-card";
import { NewProjectDialog } from "@/components/ui/new-project-dialog";

export function ProjectList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projects = useLiveQuery(async () => {
    try {
      return await listProjects();
    } catch (e) {
      if (e instanceof StorageError) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred");
      }
      return [];
    }
  });

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={async () => {
            await db.delete();
            window.location.reload();
          }}
        >
          Clear all data
        </Button>
      </div>
    );
  }

  if (projects === undefined) {
    return <p className="py-8 text-muted-foreground">Loading projects...</p>;
  }

  if (projects.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No projects yet</p>
        <Button className="mt-4" onClick={() => setDialogOpen(true)}>
          New Project
        </Button>
        <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setDialogOpen(true)}>New Project</Button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
