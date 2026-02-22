import { db } from "@/lib/db/database";
import type { Project } from "@/lib/types";
import { getSectionsForPhase } from "@/lib/types/sections";

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}

async function withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.name === "QuotaExceededError"
    ) {
      throw new StorageError("Storage is full");
    }
    if (
      error instanceof Error &&
      error.name === "OpenFailedError"
    ) {
      throw new StorageError("Unable to load");
    }
    throw error;
  }
}

export async function createProject(name: string): Promise<Project> {
  return withErrorHandling(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("Project name cannot be empty");
    }
    const now = Date.now();
    const project: Project = {
      id: crypto.randomUUID(),
      name: trimmed,
      description: "",
      createdAt: now,
      updatedAt: now,
      phases: {
        requirements: {
          type: "requirements",
          status: "draft",
          sections: getSectionsForPhase("requirements"),
        },
        design: {
          type: "design",
          status: "locked",
          sections: getSectionsForPhase("design"),
        },
        tasks: {
          type: "tasks",
          status: "locked",
          sections: getSectionsForPhase("tasks"),
        },
      },
    };
    await db.projects.add(project);
    return project;
  });
}

export async function listProjects(): Promise<Project[]> {
  return withErrorHandling(async () => {
    return db.projects.orderBy("updatedAt").reverse().toArray();
  });
}

export async function getProject(id: string): Promise<Project | undefined> {
  return withErrorHandling(async () => {
    return db.projects.get(id);
  });
}

export async function updateProject(project: Project): Promise<void> {
  return withErrorHandling(async () => {
    await db.projects.put({ ...project, updatedAt: Date.now() });
  });
}

export async function deleteProject(id: string): Promise<void> {
  return withErrorHandling(async () => {
    await db.projects.delete(id);
  });
}
