import { create } from "zustand";
import { PHASE_ORDER, PHASE_TYPES, type PhaseType, type Project } from "@/lib/types";
import { updateProject } from "@/lib/db/projects";
import { computePhaseHash } from "@/lib/eval/hash";
import { clearEvaluation } from "@/lib/db/evaluations";

export { getProjectDisplayStatus, getActivePhase } from "@/lib/utils/project";

function getNextPhase(phaseType: PhaseType): PhaseType | null {
  const order = PHASE_ORDER[phaseType];
  return PHASE_TYPES[order + 1] ?? null;
}

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
  approvePhase: (phaseType: PhaseType) => void;
  editReviewedPhase: (phaseType: PhaseType) => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => {
  let saveTimeoutId: ReturnType<typeof setTimeout> | null = null;

  function cancelPendingSave() {
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
      saveTimeoutId = null;
    }
  }

  async function immediateSave(project: Project) {
    cancelPendingSave();
    set({ isSaving: true, saveError: null });
    try {
      await updateProject(project);
    } catch (error: unknown) {
      set({ saveError: error instanceof Error ? error.message : "Failed to save" });
    } finally {
      set({ isSaving: false });
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
      if (phase.status === "reviewed") return;
      if (!phase.sections.some((s) => s.id === sectionId)) return;

      const updatedSections = phase.sections.map((s) =>
        s.id === sectionId ? { ...s, content } : s,
      );

      let updatedProject: Project = {
        ...currentProject,
        phases: {
          ...currentProject.phases,
          [phaseType]: {
            ...phase,
            sections: updatedSections,
          },
        },
      };

      // Invalidate evaluation if content hash changed
      const storedEval = updatedProject.evaluations?.[phaseType];
      if (storedEval) {
        const newHash = computePhaseHash(updatedSections);
        if (newHash !== storedEval.contentHash) {
          updatedProject = clearEvaluation(updatedProject, phaseType);
        }
      }

      set({ currentProject: updatedProject });
      debouncedSave(updatedProject);
    },

    approvePhase: (phaseType) => {
      const { currentProject } = get();
      if (!currentProject) return;

      const phase = currentProject.phases[phaseType];
      if (phase.status !== "draft") return;

      // Validate all sections have non-empty trimmed content
      const allFilled = phase.sections.every((s) => s.content.trim() !== "");
      if (!allFilled) return;

      const updatedPhases = { ...currentProject.phases };

      // Set current phase to reviewed
      updatedPhases[phaseType] = { ...phase, status: "reviewed" };

      // Unlock next phase if it's locked
      const next = getNextPhase(phaseType);
      if (next && updatedPhases[next].status === "locked") {
        updatedPhases[next] = { ...updatedPhases[next], status: "draft" };
      }

      const updatedProject: Project = {
        ...currentProject,
        phases: updatedPhases,
      };

      set({ currentProject: updatedProject });
      immediateSave(updatedProject);
    },

    editReviewedPhase: (phaseType) => {
      const { currentProject } = get();
      if (!currentProject) return;

      const phase = currentProject.phases[phaseType];
      if (phase.status !== "reviewed") return;

      const updatedPhases = { ...currentProject.phases };
      const currentOrder = PHASE_ORDER[phaseType];

      // Set current phase to draft
      updatedPhases[phaseType] = { ...phase, status: "draft" };

      // Reset all downstream phases to draft (preserve content)
      for (const pt of PHASE_TYPES) {
        if (PHASE_ORDER[pt] > currentOrder) {
          updatedPhases[pt] = { ...updatedPhases[pt], status: "draft" };
        }
      }

      const updatedProject: Project = {
        ...currentProject,
        phases: updatedPhases,
      };

      set({ currentProject: updatedProject });
      immediateSave(updatedProject);
    },
  };
});
