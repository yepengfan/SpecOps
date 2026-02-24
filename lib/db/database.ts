import Dexie, { type Table } from "dexie";
import type { Project } from "@/lib/types";
import type { ChatMessage } from "@/lib/types/chat";

export class SpecOpsDatabase extends Dexie {
  projects!: Table<Project, string>;
  chatMessages!: Table<ChatMessage, number>;

  constructor() {
    super("spec-ops");
    this.version(1).stores({ projects: "id, updatedAt" });
    this.version(2).stores({ projects: "id, updatedAt" }).upgrade((tx) => {
      return tx.table("projects").toCollection().modify((project: Record<string, unknown>) => {
        const phases = project.phases as Record<string, unknown> | undefined;
        if (!phases) return;
        if (phases.requirements && !phases.spec) {
          phases.spec = phases.requirements;
          const spec = phases.spec as Record<string, unknown>;
          spec.type = "spec";
          delete phases.requirements;
        }
        if (phases.design && !phases.plan) {
          phases.plan = phases.design;
          const plan = phases.plan as Record<string, unknown>;
          plan.type = "plan";
          delete phases.design;
        }
      });
    });
    this.version(3).stores({ projects: "id, updatedAt" }).upgrade((tx) => {
      return tx.table("projects").toCollection().modify((project: Record<string, unknown>) => {
        if (!project.traceabilityMappings) {
          project.traceabilityMappings = [];
        }
      });
    });
    this.version(4).stores({
      projects: "id, updatedAt",
      chatMessages: "++id, projectId, timestamp",
    });
    this.version(5).stores({
      projects: "id, updatedAt",
      chatMessages: "++id, projectId, timestamp",
    });
  }
}

export const db = new SpecOpsDatabase();
