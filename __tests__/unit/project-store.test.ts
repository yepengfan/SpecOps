import { db } from "@/lib/db/database";
import { createProject } from "@/lib/db/projects";

const mockUpdateProject = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
jest.mock("@/lib/db/projects", () => ({
  ...jest.requireActual("@/lib/db/projects"),
  updateProject: (...args: unknown[]) => mockUpdateProject(...args),
}));

// Import store after mock is set up
import { useProjectStore } from "@/lib/stores/project-store";

beforeEach(async () => {
  await db.projects.clear();
  useProjectStore.getState().clearProject();
  mockUpdateProject.mockClear();
  mockUpdateProject.mockResolvedValue(undefined);
});

afterAll(async () => {
  db.close();
});

describe("updateSection", () => {
  it("is a no-op when sectionId does not exist", async () => {
    const project = await createProject("Test");
    useProjectStore.getState().setProject(project);

    useProjectStore.getState().updateSection("requirements", "nonexistent-section", "content");

    const current = useProjectStore.getState().currentProject;
    // Sections should be unchanged — all still have empty content
    for (const section of current!.phases.requirements.sections) {
      expect(section.content).toBe("");
    }
  });

  it("updates content for a valid sectionId", async () => {
    const project = await createProject("Test");
    useProjectStore.getState().setProject(project);

    useProjectStore.getState().updateSection("requirements", "problem-statement", "New content");

    const current = useProjectStore.getState().currentProject;
    const section = current!.phases.requirements.sections.find(
      (s) => s.id === "problem-statement",
    );
    expect(section!.content).toBe("New content");
  });

  it("is a no-op when no project is set", () => {
    // Should not throw
    useProjectStore.getState().updateSection("requirements", "problem-statement", "content");
    expect(useProjectStore.getState().currentProject).toBeNull();
  });
});

describe("debounced save", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    useProjectStore.getState().cancelPendingSave();
    jest.useRealTimers();
  });

  it("calls updateProject after debounce and clears isSaving", async () => {
    const project = await createProject("Test");
    useProjectStore.getState().setProject(project);

    useProjectStore.getState().updateSection("requirements", "problem-statement", "hello");
    expect(useProjectStore.getState().isSaving).toBe(false); // debounce not fired yet

    await jest.runAllTimersAsync();
    expect(mockUpdateProject).toHaveBeenCalledTimes(1);
    expect(mockUpdateProject.mock.calls[0][0].phases.requirements.sections[0].content).toBe("hello");
    expect(useProjectStore.getState().isSaving).toBe(false);
  });

  it("sets saveError on failed save", async () => {
    const project = await createProject("Test");
    useProjectStore.getState().setProject(project);
    mockUpdateProject.mockRejectedValueOnce(new Error("DB write failed"));

    useProjectStore.getState().updateSection("requirements", "problem-statement", "hello");
    await jest.runAllTimersAsync();

    expect(mockUpdateProject).toHaveBeenCalledTimes(1);
    expect(useProjectStore.getState().saveError).toBe("DB write failed");
    expect(useProjectStore.getState().isSaving).toBe(false);
  });

  it("debounces multiple rapid edits into a single save", async () => {
    const project = await createProject("Test");
    useProjectStore.getState().setProject(project);

    useProjectStore.getState().updateSection("requirements", "problem-statement", "a");
    useProjectStore.getState().updateSection("requirements", "problem-statement", "ab");
    useProjectStore.getState().updateSection("requirements", "problem-statement", "abc");

    await jest.runAllTimersAsync();
    expect(mockUpdateProject).toHaveBeenCalledTimes(1);
    expect(mockUpdateProject.mock.calls[0][0].phases.requirements.sections[0].content).toBe("abc");
  });

  it("cancelPendingSave prevents the debounced save from firing", async () => {
    const project = await createProject("Test");
    useProjectStore.getState().setProject(project);

    useProjectStore.getState().updateSection("requirements", "problem-statement", "hello");
    useProjectStore.getState().cancelPendingSave();

    await jest.runAllTimersAsync();
    expect(mockUpdateProject).not.toHaveBeenCalled();
  });
});
