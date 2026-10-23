import * as Application from "expo-application";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import { version as packageJsonVersion } from "../package.json";

export interface AppVersionInfo {
  installedVersion: string;
  buildVersion: string;
  platform: "ios" | "android" | "other";
  isExpoGo: boolean;
}

/**
 * Retrieves the currently installed application version and platform.
 * In standalone native builds (production .ipa/.apk/.aab or custom dev client),
 * it prefers the native binary version reported by the OS runtime (expo-application).
 * In Expo Go, where nativeApplicationVersion belongs to the Expo Go shell app,
 * it uses the project's configured version (Constants.expoConfig?.version or package.json).
 */
export function getAppVersionInfo(): AppVersionInfo {
  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    Constants.appOwnership === "expo";

  const nativeAppVersion = Application.nativeApplicationVersion;
  const nativeBuild = Application.nativeBuildVersion;
  const expoConfigVersion = Constants.expoConfig?.version;

  let installedVersion: string;
  if (isExpoGo) {
    installedVersion =
      (expoConfigVersion && expoConfigVersion.trim().length > 0
        ? expoConfigVersion.trim()
        : packageJsonVersion) || "1.0.0";
  } else {
    installedVersion =
      (nativeAppVersion && nativeAppVersion.trim().length > 0
        ? nativeAppVersion.trim()
        : expoConfigVersion && expoConfigVersion.trim().length > 0
          ? expoConfigVersion.trim()
          : packageJsonVersion) || "1.0.0";
  }

  const buildVersion = nativeBuild || "1";

  const platform =
    Platform.OS === "ios"
      ? "ios"
      : Platform.OS === "android"
        ? "android"
        : "other";

  return {
    installedVersion,
    buildVersion,
    platform,
    isExpoGo,
  };
}
