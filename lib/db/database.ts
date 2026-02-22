import Dexie, { type Table } from "dexie";
import type { Project } from "@/lib/types";

export class SddCockpitDatabase extends Dexie {
  projects!: Table<Project, string>;

  constructor() {
    super("sdd-cockpit");
    this.version(1).stores({ projects: "id, updatedAt" });
  }
}

export const db = new SddCockpitDatabase();
