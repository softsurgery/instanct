export type {
  BackgroundActivity,
  BackgroundActivityResult,
  NativeBackgroundTaskDefinition,
  AppStateBackgroundRuntimeOptions,
  RegisterBackgroundUtilitiesOptions,
  UnregisterBackgroundUtilitiesOptions,
} from "@/lib/background/types";

export { runBackgroundActivities } from "@/lib/background/run-activities";

export {
  getTimestampWatermark,
  setTimestampWatermark,
  advanceTimestampWatermark,
  newestTimestamp,
} from "@/lib/background/watermark";

export {
  startAppStateBackgroundRuntime,
  stopAppStateBackgroundRuntime,
} from "@/lib/background/app-state-runtime";

export {
  defineNativeBackgroundTasks,
  registerNativeBackgroundTasks,
  unregisterNativeBackgroundTasks,
  getNativeBackgroundModules,
} from "@/lib/background/native-tasks";

export {
  registerBackgroundUtilities,
  unregisterBackgroundUtilities,
} from "@/lib/background/register";
