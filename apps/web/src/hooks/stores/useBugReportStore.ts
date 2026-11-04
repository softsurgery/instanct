import {
  CreateBugDto,
  ResponseBugDto,
  UpdateBugDto,
  BugVariant,
  BugStatus,
} from "@/types";
import { objectUtils } from "@softsurgery/lib";
import { create } from "zustand";

interface BugReportStoreData {
  bug?: ResponseBugDto;
  createDto: CreateBugDto;
  updateDto: UpdateBugDto;
  createDtoErrors: Record<string, string[]>;
  updateDtoErrors: Record<string, string[]>;
}

export interface BugReportStore extends BugReportStoreData {
  set: <T>(name: keyof BugReportStoreData, value: T) => void;
  setNested: <T>(path: string, value: T) => void;
  setForEdit: (bug: ResponseBugDto) => void;
  reset: () => void;
}

const initialState: BugReportStoreData = {
  createDto: {
    title: "",
    description: "",
    variant: BugVariant.UI_ISSUE,
    interestedUserIds: [],
    deviceId: null,
  },
  updateDto: {
    deviceId: null,
  },
  createDtoErrors: {},
  updateDtoErrors: {},
};

export const useBugReportStore = create<BugReportStore>((set) => ({
  ...initialState,

  set: (name, value) => {
    set((state) => ({
      ...state,
      [name]: value,
    }));
  },

  setNested: (path, value) => {
    set(
      (state) => objectUtils.setDeepValue(state, path, value) as BugReportStore,
    );
  },

  setForEdit: (bug) => {
    set({
      bug,
      updateDto: {
        title: bug.title,
        description: bug.description,
        variant: (bug.variant as BugVariant) || BugVariant.UI_ISSUE,
        status: (bug.status as BugStatus) || BugStatus.PENDING,
        deviceId: null,
        interestedUserIds:
          bug.interestedUsers
            ?.map((u) => u.userId || u.user?.id || String(u.id))
            .filter((id): id is string => Boolean(id)) || [],
      },
      updateDtoErrors: {},
    });
  },

  reset: () => {
    set({ ...initialState, bug: undefined });
  },
}));
