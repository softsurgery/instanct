import { create } from "zustand";
import {
  CreateTemplateDto,
  ResponseTemplateDto,
  UpdateTemplateDto,
} from "../types";

export interface TemplateStoreData {
  template?: ResponseTemplateDto;
  templateCreateDto: CreateTemplateDto;
  templateUpdateDto: UpdateTemplateDto;
  templateCreateDtoErrors: Record<string, string[]>;
  templateUpdateDtoErrors: Record<string, string[]>;
}

export interface TemplateStore extends TemplateStoreData {
  set: <T>(name: keyof TemplateStoreData, value: T) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
}

const initialState: TemplateStoreData = {
  templateCreateDto: {
    name: "",
    content: "",
  },
  templateUpdateDto: {},
  templateCreateDtoErrors: {},
  templateUpdateDtoErrors: {},
};

export const useTemplateStore = create<TemplateStore>((set) => ({
  ...initialState,

  set: (name, value) => {
    set((state) => ({
      ...state,
      [name]: value,
    }));
  },

  setNested: (path, value) => {
    set((state) => {
      const keys = path.split(".");
      const newState = { ...state };
      let current: any = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        } else {
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newState;
    });
  },

  reset: () => {
    set({
      template: undefined,
      templateCreateDto: { name: "", content: "" },
      templateUpdateDto: {},
      templateCreateDtoErrors: {},
      templateUpdateDtoErrors: {},
    });
  },
}));
