import Dexie from "dexie";
import { db } from "@/lib/db/database";
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  StorageError,
} from "@/lib/db/projects";

beforeEach(async () => {
  await db.projects.clear();
});

afterAll(async () => {
  db.close();
});

describe("createProject", () => {
  it("generates a UUID v4 id", async () => {
    const project = await createProject("My Project");
    expect(project.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("trims the project name", async () => {
    const project = await createProject("  My Project  ");
    expect(project.name).toBe("My Project");
  });

  it("rejects empty project name", async () => {
    await expect(createProject("")).rejects.toThrow("Project name cannot be empty");
  });

  it("rejects whitespace-only project name", async () => {
    await expect(createProject("   ")).rejects.toThrow("Project name cannot be empty");
  });

  it("initializes requirements phase as draft", async () => {
    const project = await createProject("Test");
    expect(project.phases.requirements.status).toBe("draft");
    expect(project.phases.requirements.type).toBe("requirements");
  });

  it("initializes design and tasks phases as locked", async () => {
    const project = await createProject("Test");
    expect(project.phases.design.status).toBe("locked");
    expect(project.phases.tasks.status).toBe("locked");
  });

  it("sets createdAt and updatedAt timestamps", async () => {
    const before = Date.now();
    const project = await createProject("Test");
    const after = Date.now();
    expect(project.createdAt).toBeGreaterThanOrEqual(before);
    expect(project.createdAt).toBeLessThanOrEqual(after);
    expect(project.updatedAt).toBe(project.createdAt);
  });

  it("persists to the database", async () => {
    const project = await createProject("Test");
    const fromDb = await db.projects.get(project.id);
    expect(fromDb).toBeDefined();
    expect(fromDb!.name).toBe("Test");
  });

  it("initializes phases with non-empty template sections with empty content", async () => {
    const project = await createProject("Test");
    expect(project.phases.requirements.sections.length).toBeGreaterThan(0);
    expect(project.phases.design.sections.length).toBeGreaterThan(0);
    expect(project.phases.tasks.sections.length).toBeGreaterThan(0);
    for (const phase of Object.values(project.phases)) {
      for (const section of phase.sections) {
        expect(section.content).toBe("");
      }
    }
  });
});

describe("listProjects", () => {
  it("returns empty array when no projects exist", async () => {
    const projects = await listProjects();
    expect(projects).toEqual([]);
  });

  it("sorts by updatedAt descending", async () => {
    const p1 = await createProject("First");
    // Ensure different timestamps
    await new Promise((r) => setTimeout(r, 10));
    const p2 = await createProject("Second");
    const projects = await listProjects();
    expect(projects[0].id).toBe(p2.id);
    expect(projects[1].id).toBe(p1.id);
  });
});

describe("getProject", () => {
  it("returns a project by id", async () => {
    const created = await createProject("Test");
    const project = await getProject(created.id);
    expect(project).toBeDefined();
    expect(project!.name).toBe("Test");
  });

  it("returns undefined for nonexistent id", async () => {
    const project = await getProject("nonexistent-id");
    expect(project).toBeUndefined();
  });
});

describe("updateProject", () => {
  it("persists changes", async () => {
    const project = await createProject("Test");
    project.name = "Updated";
    await updateProject(project);
    const updated = await getProject(project.id);
    expect(updated!.name).toBe("Updated");
  });

  it("auto-stamps updatedAt", async () => {
    const project = await createProject("Test");
    const originalUpdatedAt = project.updatedAt;
    await new Promise((r) => setTimeout(r, 10));
    await updateProject(project);
    const updated = await getProject(project.id);
    expect(updated!.updatedAt).toBeGreaterThan(originalUpdatedAt);
  });
});

describe("deleteProject", () => {
  it("removes the project", async () => {
    const project = await createProject("Test");
    await deleteProject(project.id);
    const result = await getProject(project.id);
    expect(result).toBeUndefined();
  });

  it("is a no-op on nonexistent id", async () => {
    await expect(deleteProject("nonexistent")).resolves.not.toThrow();
  });
});

describe("withErrorHandling", () => {
  it("wraps QuotaExceededError into StorageError", async () => {
    const spy = jest
      .spyOn(db.projects, "add")
      .mockRejectedValueOnce(new Dexie.QuotaExceededError());
    const error = await createProject("Test").catch((e) => e);
    expect(error).toBeInstanceOf(StorageError);
    expect(error.message).toBe("Storage is full");
    spy.mockRestore();
  });

  it("wraps OpenFailedError into StorageError", async () => {
    const spy = jest
      .spyOn(db.projects, "orderBy")
      .mockImplementationOnce(() => {
        throw new Dexie.OpenFailedError("test");
      });
    const error = await listProjects().catch((e) => e);
    expect(error).toBeInstanceOf(StorageError);
    expect(error.message).toBe("Unable to load");
    spy.mockRestore();
  });

  it("re-throws unknown errors without wrapping", async () => {
    const spy = jest
      .spyOn(db.projects, "add")
      .mockRejectedValueOnce(new Error("unexpected"));
    const error = await createProject("Test").catch((e) => e);
    expect(error).not.toBeInstanceOf(StorageError);
    expect(error.message).toBe("unexpected");
    spy.mockRestore();
  });
});
