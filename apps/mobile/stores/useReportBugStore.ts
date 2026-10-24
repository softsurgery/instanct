import { setDeepValue } from "@/lib/object";
import { create } from "zustand";
import { CreateBugDto } from "@softsurgery/api-client";

interface ReportBugData {
  createDto: CreateBugDto;
  errors: Record<string, string[]>;
}

export interface ReportBugStore extends ReportBugData {
  set: <K extends keyof ReportBugData>(
    name: K,
    value: ReportBugData[K],
  ) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
}

const initialState: ReportBugData = {
  createDto: {
    title: "",
    description: "",
    variant: undefined,
    deviceId: undefined,
  },
  errors: {},
};

export const useReportBugStore = create<ReportBugStore>((set, get) => ({
  ...initialState,
  set: (name, value) => {
    set((state) => ({
      ...state,
      [name]: value,
    }));
  },
  setNested: (path, value) => {
    const [rootKey, ...restPath] = path.split(".");
    const nestedPath = restPath.join(".");
    set((state) => {
      const updatedRoot = setDeepValue(
        { ...state[rootKey as keyof ReportBugData] },
        nestedPath,
        value,
      );
      return {
        ...state,
        [rootKey]: updatedRoot,
      };
    });
  },
  reset: () => {
    set({ ...initialState });
  },
}));
