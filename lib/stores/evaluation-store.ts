import { create } from "zustand";

interface EvaluationState {
  isEvaluating: boolean;
  isAnalyzing: boolean;
  analysisError: string | null;
  setEvaluating: (value: boolean) => void;
  setAnalyzing: (value: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  reset: () => void;
}

export const useEvaluationStore = create<EvaluationState>()((set) => ({
  isEvaluating: false,
  isAnalyzing: false,
  analysisError: null,
  setEvaluating: (value) => set({ isEvaluating: value }),
  setAnalyzing: (value) => set({ isAnalyzing: value }),
  setAnalysisError: (error) => set({ analysisError: error }),
  reset: () => set({ isEvaluating: false, isAnalyzing: false, analysisError: null }),
}));
