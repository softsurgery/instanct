import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AppVersionPolicyDto } from "@softsurgery/api-client";
import { isVersionOutdated } from "../lib/semver";

export interface VersionPersistData {
  /**
   * Whether a mandatory update was confirmed and is actively enforced on cold launch.
   */
  hasConfirmedMandatoryUpdate: boolean;
  confirmedMinVersion: string | null;
  confirmedStoreUrl: string | null;

  /**
   * Staged mandatory update discovered during an active session.
   * Per requirements, newly discovered policies must NOT interrupt an active session,
   * but MUST be promoted to confirmed on the subsequent cold launch.
   */
  hasPendingMandatoryUpdate: boolean;
  pendingMinVersion: string | null;
  pendingStoreUrl: string | null;

  /**
   * Cached latest policy response for offline metadata or retry display.
   */
  cachedPolicy: AppVersionPolicyDto | null;
}

export interface VersionPersistStore extends VersionPersistData {
  isReady: boolean;

  /**
   * Called during cold launch bootstrap to evaluate local state against the newly launched installed version:
   * 1. If an update was installed that satisfies the confirmed minimum, unlock immediately (even offline).
   * 2. If a pending update was staged during a previous session, promote it to active enforcement.
   * 3. If an outdated version was previously confirmed, keep it enforced (even offline).
   */
  bootstrapColdLaunch: (installedVersion: string) => void;

  /**
   * Confirms a mandatory update immediately (used during cold launch check).
   */
  confirmMandatoryUpdate: (minVersion: string, storeUrl: string) => void;

  /**
   * Stages a mandatory update discovered during an active session without interrupting the user.
   */
  stageMandatoryUpdateForNextLaunch: (
    minVersion: string,
    storeUrl: string,
  ) => void;

  /**
   * Clears mandatory update enforcement (e.g. after successful update install or supported version check).
   */
  clearMandatoryUpdate: () => void;

  /**
   * Updates cached policy from a successful API response.
   */
  setCachedPolicy: (policy: AppVersionPolicyDto) => void;
}

const defaultData: VersionPersistData = {
  hasConfirmedMandatoryUpdate: false,
  confirmedMinVersion: null,
  confirmedStoreUrl: null,
  hasPendingMandatoryUpdate: false,
  pendingMinVersion: null,
  pendingStoreUrl: null,
  cachedPolicy: null,
};

let _set: (fn: Partial<VersionPersistStore>) => void;

const memoryMap = new Map<string, string>();
const memoryStorage = {
  getItem: (key: string) => memoryMap.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memoryMap.set(key, value);
  },
  removeItem: (key: string) => {
    memoryMap.delete(key);
  },
};

const getStorage = () => {
  try {
    const asyncStorage = require("@react-native-async-storage/async-storage");
    return asyncStorage.default || asyncStorage;
  } catch {
    return memoryStorage;
  }
};

export const useVersionPersistStore = create<VersionPersistStore>()(
  persist(
    (set) => {
      _set = set;

      return {
        ...defaultData,
        isReady: false,

        bootstrapColdLaunch: (installedVersion: string) =>
          set((state) => {
            // First promote pending update if present
            let confirmed = state.hasConfirmedMandatoryUpdate;
            let confirmedMin = state.confirmedMinVersion;
            let confirmedStore = state.confirmedStoreUrl;

            if (state.hasPendingMandatoryUpdate && state.pendingMinVersion) {
              if (
                isVersionOutdated(installedVersion, state.pendingMinVersion)
              ) {
                confirmed = true;
                confirmedMin = state.pendingMinVersion;
                confirmedStore = state.pendingStoreUrl;
              }
            }

            // Next verify if installed version satisfies confirmed minimum version.
            // If the user updated through the store and relaunched (even offline), recover immediately.
            if (confirmed && confirmedMin) {
              if (!isVersionOutdated(installedVersion, confirmedMin)) {
                confirmed = false;
                confirmedMin = null;
                confirmedStore = null;
              }
            }

            return {
              hasConfirmedMandatoryUpdate: confirmed,
              confirmedMinVersion: confirmedMin,
              confirmedStoreUrl: confirmedStore,
              hasPendingMandatoryUpdate: false,
              pendingMinVersion: null,
              pendingStoreUrl: null,
            };
          }),

        confirmMandatoryUpdate: (minVersion, storeUrl) =>
          set({
            hasConfirmedMandatoryUpdate: true,
            confirmedMinVersion: minVersion,
            confirmedStoreUrl: storeUrl,
            hasPendingMandatoryUpdate: false,
            pendingMinVersion: null,
            pendingStoreUrl: null,
          }),

        stageMandatoryUpdateForNextLaunch: (minVersion, storeUrl) =>
          set({
            hasPendingMandatoryUpdate: true,
            pendingMinVersion: minVersion,
            pendingStoreUrl: storeUrl,
          }),

        clearMandatoryUpdate: () =>
          set({
            hasConfirmedMandatoryUpdate: false,
            confirmedMinVersion: null,
            confirmedStoreUrl: null,
            hasPendingMandatoryUpdate: false,
            pendingMinVersion: null,
            pendingStoreUrl: null,
          }),

        setCachedPolicy: (policy) =>
          set({
            cachedPolicy: policy,
          }),
      };
    },
    {
      name: "instanct-version-policy-storage",
      storage: createJSONStorage(() => getStorage()),
      onRehydrateStorage: () => {
        return () => {
          _set({ isReady: true });
        };
      },
    },
  ),
);
