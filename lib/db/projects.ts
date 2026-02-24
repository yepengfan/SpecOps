import Dexie from "dexie";
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
    if (error instanceof Dexie.QuotaExceededError) {
      throw new StorageError("Storage is full");
    }
    if (error instanceof Dexie.OpenFailedError) {
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
        spec: {
          type: "spec",
          status: "draft",
          sections: getSectionsForPhase("spec"),
        },
        plan: {
          type: "plan",
          status: "locked",
          sections: getSectionsForPhase("plan"),
        },
        tasks: {
          type: "tasks",
          status: "locked",
          sections: getSectionsForPhase("tasks"),
        },
      },
      traceabilityMappings: [],
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

export async function archiveProject(id: string): Promise<void> {
  return withErrorHandling(async () => {
    const project = await db.projects.get(id);
    if (!project) throw new Error(`Project not found: ${id}`);
    await db.projects.put({
      ...project,
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });
  });
}

export async function unarchiveProject(id: string): Promise<void> {
  return withErrorHandling(async () => {
    const project = await db.projects.get(id);
    if (!project) throw new Error(`Project not found: ${id}`);
    const { archivedAt: _, ...rest } = project;
    await db.projects.put({
      ...rest,
      archivedAt: undefined,
      updatedAt: Date.now(),
    });
  });
}

export async function deleteProject(id: string): Promise<void> {
  return withErrorHandling(async () => {
    await db.transaction("rw", db.projects, db.chatMessages, async () => {
      await db.chatMessages.where("projectId").equals(id).delete();
      await db.projects.delete(id);
    });
  });
}
