"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import type { Project } from "@/lib/types";
import { archiveProject, deleteProject, unarchiveProject } from "@/lib/db/projects";
import {
  getProjectDisplayStatus,
  formatRelativeTime,
  computeHealthScore,
} from "@/lib/utils/project";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProjectCard({ project }: { project: Project }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isArchived = !!project.archivedAt;
  const status = getProjectDisplayStatus(project);
  const health = computeHealthScore(project);

  async function handleArchiveToggle() {
    if (isArchived) {
      await unarchiveProject(project.id);
      toast.success("Project restored");
    } else {
      await archiveProject(project.id);
      toast.success("Project archived");
    }
  }

  async function handleDelete() {
    try {
      await deleteProject(project.id);
      setDeleteOpen(false);
    } catch {
      setDeleteError("Failed to delete project");
    }
  }

  return (
    <>
      <article className={`relative rounded-lg border p-4 transition-colors hover:bg-accent${isArchived ? " opacity-75" : ""}`}>
        <Link
          href={`/project/${project.id}/overview`}
          className="absolute inset-0 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
        >
          <span className="sr-only">{project.name}</span>
        </Link>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{project.name}</h3>
              {isArchived && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Archived
                </span>
              )}
            </div>
            {project.description ? (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                {project.description}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground italic">
                No description
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">{status}</p>
            {health && (
              <p className="mt-1 text-xs text-muted-foreground">
                {health.passed}/{health.total} checks passing
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {formatRelativeTime(project.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              className="relative z-10"
              aria-label={isArchived ? `Unarchive ${project.name}` : `Archive ${project.name}`}
              onClick={handleArchiveToggle}
            >
              {isArchived ? <ArchiveRestore /> : <Archive />}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="relative z-10"
              aria-label={`Delete ${project.name}`}
              onClick={() => {
                setDeleteError(null);
                setDeleteOpen(true);
              }}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </article>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{project.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
