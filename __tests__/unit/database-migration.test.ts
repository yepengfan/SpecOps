import { db } from "@/lib/db/database";

describe("Database migration v5", () => {
  it("has version 5 as the highest version", () => {
    // Dexie verno is the highest declared version number
    expect(db.verno).toBe(5);
  });

  it("keeps projects table with same indexes (id, updatedAt)", () => {
    const projectsSchema = db.tables.find((t) => t.name === "projects");
    expect(projectsSchema).toBeDefined();
    // Primary key is 'id', indexed by 'updatedAt'
    expect(projectsSchema!.schema.primKey.name).toBe("id");
    const indexNames = projectsSchema!.schema.indexes.map((i) => i.name);
    expect(indexNames).toContain("updatedAt");
  });

  it("does not add an index for archivedAt", () => {
    const projectsSchema = db.tables.find((t) => t.name === "projects");
    const indexNames = projectsSchema!.schema.indexes.map((i) => i.name);
    expect(indexNames).not.toContain("archivedAt");
  });

  it("keeps chatMessages table unchanged", () => {
    const chatSchema = db.tables.find((t) => t.name === "chatMessages");
    expect(chatSchema).toBeDefined();
    expect(chatSchema!.schema.primKey.name).toBe("id");
  });
});
