"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { motion, useReducedMotion } from "framer-motion";
import { Search, Archive } from "lucide-react";
import { db } from "@/lib/db/database";
import { listProjects, StorageError } from "@/lib/db/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectCard } from "@/components/ui/project-card";
import { NewProjectDialog } from "@/components/ui/new-project-dialog";
import {
  filterProjects,
  sortProjects,
  type SortOption,
} from "@/components/ui/project-list-utils";
import {
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/motion";

export function ProjectList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("updated-desc");
  const [showArchived, setShowArchived] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const reducedMotion = useReducedMotion();

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

  const PAGE_SIZE = 4;

  const filtered = useMemo(
    () => sortProjects(filterProjects(projects ?? [], search, showArchived), sort),
    [projects, search, sort, showArchived],
  );

  const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE);
  const hasMore = filtered.length > PAGE_SIZE;

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
    return (
      <div className="py-8">
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (projects !== undefined && projects.length === 0) {
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
      {/* Search, sort, and archive filter controls */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated-desc">Last updated</SelectItem>
            <SelectItem value="name-asc">Name A–Z</SelectItem>
            <SelectItem value="name-desc">Name Z–A</SelectItem>
            <SelectItem value="created-desc">Newest first</SelectItem>
            <SelectItem value="created-asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showArchived ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          aria-pressed={showArchived}
        >
          <Archive className="mr-1.5 h-4 w-4" />
          {showArchived ? "Showing archived" : "Show archived"}
        </Button>
      </div>
      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No projects match your search.
        </p>
      ) : (
        <>
          <motion.div
            className="mt-6 grid gap-4 sm:grid-cols-2"
            variants={staggerContainerVariants}
            initial={reducedMotion ? false : "initial"}
            animate="animate"
          >
            {visible.map((project) => (
              <motion.div key={project.id} variants={staggerItemVariants}>
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
          {!showAll && hasMore && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => setShowAll(true)}>
                View all ({filtered.length} projects)
              </Button>
            </div>
          )}
        </>
      )}
      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
