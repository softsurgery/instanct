import { create } from "zustand";

interface UserRefParamsStore {
  objectives: number[];
  industries: number[];

  setObjectives: (objectives: number[]) => void;
  setIndustries: (industries: number[]) => void;

  resetObjectives: () => void;
  resetIndustries: () => void;
  resetAll: () => void;
}

const initialState = {
  objectives: [],
  industries: [],
};

export const useUserRefParamsStore = create<UserRefParamsStore>((set) => ({
  ...initialState,

  setObjectives: (objectives) => set({ objectives }),
  setIndustries: (industries) => set({ industries }),

  resetObjectives: () => set({ objectives: [] }),
  resetIndustries: () => set({ industries: [] }),
  resetAll: () => set(initialState),
}));
