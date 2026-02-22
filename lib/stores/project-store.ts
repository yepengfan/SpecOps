import { create } from "zustand";
import type { PhaseType, Project } from "@/lib/types";
import { updateProject } from "@/lib/db/projects";

interface ProjectState {
  currentProject: Project | null;
  isSaving: boolean;
  saveError: string | null;
  setProject: (project: Project) => void;
  clearProject: () => void;
  updateSection: (
    phaseType: PhaseType,
    sectionId: string,
    content: string,
  ) => void;
}

// Module-level timeout ID: safe in production (singleton store) but shared
// across store instances in tests. Tests that exercise updateSection should
// call clearProject() in afterEach to cancel any pending debounced save.
let saveTimeoutId: ReturnType<typeof setTimeout> | null = null;

function debouncedSave(project: Project, set: (partial: Partial<ProjectState>) => void) {
  if (saveTimeoutId) {
    clearTimeout(saveTimeoutId);
  }
  saveTimeoutId = setTimeout(async () => {
    set({ isSaving: true, saveError: null });
    try {
      await updateProject(project);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save";
      set({ saveError: message });
    } finally {
      set({ isSaving: false });
    }
  }, 1000);
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  currentProject: null,
  isSaving: false,
  saveError: null,

  setProject: (project) => {
    set({ currentProject: project, saveError: null });
  },

  clearProject: () => {
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
      saveTimeoutId = null;
    }
    set({ currentProject: null, isSaving: false, saveError: null });
  },

  updateSection: (phaseType, sectionId, content) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const phase = currentProject.phases[phaseType];
    const updatedSections = phase.sections.map((s) =>
      s.id === sectionId ? { ...s, content } : s,
    );

    const updatedProject: Project = {
      ...currentProject,
      updatedAt: Date.now(),
      phases: {
        ...currentProject.phases,
        [phaseType]: {
          ...phase,
          sections: updatedSections,
        },
      },
    };

    set({ currentProject: updatedProject });
    debouncedSave(updatedProject, set);
  },
}));
