import { create } from "zustand";
import {
  CreateContentPageDto,
  ResponseContentPageDto,
  UpdateContentPageDto,
} from "@/types";
import { setDeepValue } from "@/lib/object";

interface ContentPageStoreData {
  response?: ResponseContentPageDto;
  createDto: CreateContentPageDto;
  updateDto: UpdateContentPageDto;
  createDtoErrors: Record<string, string[]>;
  updateDtoErrors: Record<string, string[]>;
}

const initialState: ContentPageStoreData = {
  response: undefined,
  createDto: {
    slug: "",
    title: "",
    subtitle: "",
    body: "",
    locale: undefined,
  },
  updateDto: {
    title: "",
    subtitle: "",
    body: "",
    locale: undefined,
  },
  createDtoErrors: {},
  updateDtoErrors: {},
};

export interface ContentPageStore extends ContentPageStoreData {
  set: <T>(name: keyof ContentPageStoreData, value: T) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
}

export const useContentPageStore = create<ContentPageStore>((set) => ({
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
        { ...(state[rootKey as keyof ContentPageStoreData] as object) },
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
