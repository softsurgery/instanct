import { create } from "zustand";
import { CreateFeedbackDto } from "@softsurgery/api-client";
import { setDeepValue } from "@/lib/object";

interface SendFeedbackData {
  createDto: CreateFeedbackDto;
  errors: Record<string, string[]>;
}

export interface SendFeedbackStore extends SendFeedbackData {
  set: <K extends keyof SendFeedbackData>(
    name: K,
    value: SendFeedbackData[K],
  ) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
}

const initialState: SendFeedbackData = {
  createDto: {
    category: undefined,
    message: "",
    rating: 0,
    deviceId: undefined,
  },
  errors: {},
};

export const useSendFeedbackStore = create<SendFeedbackStore>((set, get) => ({
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
        { ...state[rootKey as keyof SendFeedbackData] },
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
