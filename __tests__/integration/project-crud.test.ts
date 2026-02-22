import { db } from "@/lib/db/database";
import {
  createProject,
  listProjects,
  getProject,
  deleteProject,
} from "@/lib/db/projects";
import { useProjectStore } from "@/lib/stores/project-store";

beforeEach(async () => {
  await db.projects.clear();
  useProjectStore.getState().clearProject();
});

afterAll(() => {
  db.close();
});

describe("Project CRUD integration", () => {
  it("full lifecycle: create → list → update → persist → delete", async () => {
    jest.useFakeTimers();

    // Create
    const project = await createProject("Integration Test");
    expect(project.name).toBe("Integration Test");

    // List shows 1 project
    const listed = await listProjects();
    expect(listed).toHaveLength(1);
    expect(listed[0].id).toBe(project.id);

    // Set in store and update a section
    useProjectStore.getState().setProject(project);
    useProjectStore
      .getState()
      .updateSection("spec", "problem-statement", "Updated content");

    // Flush debounce timer
    await jest.runAllTimersAsync();

    // Verify content persisted in DB
    const persisted = await getProject(project.id);
    expect(persisted).toBeDefined();
    const section = persisted!.phases.spec.sections.find(
      (s) => s.id === "problem-statement",
    );
    expect(section!.content).toBe("Updated content");

    // Delete
    await deleteProject(project.id);
    const afterDelete = await listProjects();
    expect(afterDelete).toHaveLength(0);

    jest.useRealTimers();
  });

  it("multiple projects maintain independent state", async () => {
    jest.useFakeTimers();

    const projectA = await createProject("Project A");
    const projectB = await createProject("Project B");

    // Update section in project A
    useProjectStore.getState().setProject(projectA);
    useProjectStore
      .getState()
      .updateSection("spec", "problem-statement", "Content A");
    await jest.runAllTimersAsync();

    // Update section in project B
    useProjectStore.getState().setProject(projectB);
    useProjectStore
      .getState()
      .updateSection("spec", "problem-statement", "Content B");
    await jest.runAllTimersAsync();

    // Verify independence
    const fetchedA = await getProject(projectA.id);
    const fetchedB = await getProject(projectB.id);

    expect(
      fetchedA!.phases.spec.sections.find((s) => s.id === "problem-statement")!
        .content,
    ).toBe("Content A");
    expect(
      fetchedB!.phases.spec.sections.find((s) => s.id === "problem-statement")!
        .content,
    ).toBe("Content B");

    jest.useRealTimers();
  });

  it("renameProject persists new name to database", async () => {
    const project = await createProject("Before Rename");
    useProjectStore.getState().setProject(project);

    useProjectStore.getState().renameProject("After Rename");

    // Wait for immediateSave to complete
    await new Promise((r) => setTimeout(r, 50));

    const persisted = await getProject(project.id);
    expect(persisted).toBeDefined();
    expect(persisted!.name).toBe("After Rename");
  });

  it("updatedAt advances on rename", async () => {
    const project = await createProject("Rename Timestamp");
    const originalUpdatedAt = project.updatedAt;

    // Small delay so Date.now() differs
    await new Promise((r) => setTimeout(r, 10));

    useProjectStore.getState().setProject(project);
    useProjectStore.getState().renameProject("Renamed");

    await new Promise((r) => setTimeout(r, 50));

    const persisted = await getProject(project.id);
    expect(persisted!.updatedAt).toBeGreaterThan(originalUpdatedAt);
  });

  it("updatedAt advances on save", async () => {
    jest.useFakeTimers();

    const project = await createProject("Timestamp Test");
    const originalUpdatedAt = project.updatedAt;

    // Advance time so updatedAt will differ
    jest.advanceTimersByTime(1000);

    useProjectStore.getState().setProject(project);
    useProjectStore
      .getState()
      .updateSection("spec", "problem-statement", "New content");
    await jest.runAllTimersAsync();

    const updated = await getProject(project.id);
    expect(updated!.updatedAt).toBeGreaterThan(originalUpdatedAt);

    jest.useRealTimers();
  });
});
