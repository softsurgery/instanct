import { create } from "zustand";

interface UserRefParamsStore {
  objectives: number[];
  industries: number[];

  setObjectives: (objectives: number[]) => void;
  setIndustries: (industries: number[]) => void;

  resetObjectives: () => void;
  resetIndustries: () => void;
}

export const useUserRefParamsStore = create<UserRefParamsStore>((set) => ({
  objectives: [],
  industries: [],

  setObjectives: (objectives) => set({ objectives }),
  setIndustries: (industries) => set({ industries }),

  resetObjectives: () => set({ objectives: [] }),
  resetIndustries: () => set({ industries: [] }),
}));
