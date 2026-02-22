import { useProjectStore } from "@/lib/stores/project-store";
import { createProject } from "@/lib/db/projects";
import { db } from "@/lib/db/database";

beforeEach(async () => {
  await db.projects.clear();
  useProjectStore.getState().clearProject();
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
