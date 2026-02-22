import { create } from "zustand";
import type { PhaseType, Project } from "@/lib/types";
import { updateProject } from "@/lib/db/projects";

export { getProjectDisplayStatus, getActivePhase } from "@/lib/utils/project";

interface ProjectState {
  currentProject: Project | null;
  isSaving: boolean;
  saveError: string | null;
  setProject: (project: Project) => void;
  clearProject: () => void;
  cancelPendingSave: () => void;
  updateSection: (
    phaseType: PhaseType,
    sectionId: string,
    content: string,
  ) => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => {
  let saveTimeoutId: ReturnType<typeof setTimeout> | null = null;

  function cancelPendingSave() {
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
      saveTimeoutId = null;
    }
  }

  function debouncedSave(project: Project) {
    cancelPendingSave();
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

  return {
    currentProject: null,
    isSaving: false,
    saveError: null,

    setProject: (project) => {
      set({ currentProject: project, saveError: null });
    },

    clearProject: () => {
      cancelPendingSave();
      set({ currentProject: null, isSaving: false, saveError: null });
    },

    cancelPendingSave,

    updateSection: (phaseType, sectionId, content) => {
      const { currentProject } = get();
      if (!currentProject) return;

      const phase = currentProject.phases[phaseType];
      if (!phase.sections.some((s) => s.id === sectionId)) return;

      const updatedSections = phase.sections.map((s) =>
        s.id === sectionId ? { ...s, content } : s,
      );

      const updatedProject: Project = {
        ...currentProject,
        phases: {
          ...currentProject.phases,
          [phaseType]: {
            ...phase,
            sections: updatedSections,
          },
        },
      };

      set({ currentProject: updatedProject });
      debouncedSave(updatedProject);
    },
  };
});
