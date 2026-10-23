import { supportsNativeBackgroundTasks } from "@/lib/expo-env";
import {
  startAppStateBackgroundRuntime,
  stopAppStateBackgroundRuntime,
} from "@/lib/background/app-state-runtime";
import {
  defineNativeBackgroundTasks,
  registerNativeBackgroundTasks,
  unregisterNativeBackgroundTasks,
} from "@/lib/background/native-tasks";
import type {
  RegisterBackgroundUtilitiesOptions,
  UnregisterBackgroundUtilitiesOptions,
} from "@/lib/background/types";

/**
 * Registers parameterized background utilities:
 * - AppState + interval runtime (Expo Go friendly)
 * - Optional native OS background tasks (dev client / production)
 */
export async function registerBackgroundUtilities(
  options: RegisterBackgroundUtilitiesOptions,
) {
  const supportsNative =
    options.supportsNative ?? supportsNativeBackgroundTasks();
  const tasks = options.tasks ?? [];
  const activities =
    options.activities ?? tasks.map((task) => task.activity);

  const appStateEnabled = options.appState?.enabled ?? true;
  if (appStateEnabled && activities.length) {
    startAppStateBackgroundRuntime({
      id: options.appState?.id,
      activities,
      backgroundPollMs: options.appState?.backgroundPollMs,
      foregroundPollMs: options.appState?.foregroundPollMs,
      onTickResult: options.appState?.onTickResult,
    });
  }

  if (!supportsNative || !tasks.length) return;

  defineNativeBackgroundTasks(tasks, { supportsNative });
  await registerNativeBackgroundTasks(tasks, { supportsNative });
}

/**
 * Tears down AppState runtime and/or native tasks previously registered.
 */
export async function unregisterBackgroundUtilities(
  options: UnregisterBackgroundUtilitiesOptions = {},
) {
  stopAppStateBackgroundRuntime(options.appStateId ?? "default");

  const supportsNative =
    options.supportsNative ?? supportsNativeBackgroundTasks();
  const taskNames = options.taskNames ?? [];
  if (!taskNames.length) return;

  await unregisterNativeBackgroundTasks(taskNames, { supportsNative });
}
