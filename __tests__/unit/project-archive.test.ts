import { db } from "@/lib/db/database";
import {
  createProject,
  getProject,
  archiveProject,
  unarchiveProject,
} from "@/lib/db/projects";

beforeEach(async () => {
  await db.projects.clear();
});

afterAll(async () => {
  db.close();
});

describe("archiveProject", () => {
  it("sets archivedAt timestamp on the project", async () => {
    const project = await createProject("Test Archive");
    expect(project.archivedAt).toBeUndefined();

    await archiveProject(project.id);
    const updated = await getProject(project.id);
    expect(updated!.archivedAt).toBeDefined();
    expect(typeof updated!.archivedAt).toBe("number");
  });

  it("updates updatedAt when archiving", async () => {
    const project = await createProject("Test Archive");
    const originalUpdatedAt = project.updatedAt;

    // Small delay to ensure timestamp differs
    await new Promise((r) => setTimeout(r, 10));
    await archiveProject(project.id);
    const updated = await getProject(project.id);
    expect(updated!.updatedAt).toBeGreaterThan(originalUpdatedAt);
  });

  it("throws if project does not exist", async () => {
    await expect(archiveProject("nonexistent-id")).rejects.toThrow();
  });
});

describe("unarchiveProject", () => {
  it("clears archivedAt on the project", async () => {
    const project = await createProject("Test Unarchive");
    await archiveProject(project.id);

    const archived = await getProject(project.id);
    expect(archived!.archivedAt).toBeDefined();

    await unarchiveProject(project.id);
    const restored = await getProject(project.id);
    expect(restored!.archivedAt).toBeUndefined();
  });

  it("updates updatedAt when unarchiving", async () => {
    const project = await createProject("Test Unarchive");
    await archiveProject(project.id);
    const archived = await getProject(project.id);

    await new Promise((r) => setTimeout(r, 10));
    await unarchiveProject(project.id);
    const restored = await getProject(project.id);
    expect(restored!.updatedAt).toBeGreaterThan(archived!.updatedAt);
  });

  it("throws if project does not exist", async () => {
    await expect(unarchiveProject("nonexistent-id")).rejects.toThrow();
  });
});
