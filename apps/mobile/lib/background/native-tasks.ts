import { supportsNativeBackgroundTasks } from "@/lib/expo-env";
import type {
  BackgroundActivityResult,
  NativeBackgroundTaskDefinition,
} from "@/lib/background/types";

type TaskManagerModule = typeof import("expo-task-manager");
type BackgroundTaskModule = typeof import("expo-background-task");

let TaskManager: TaskManagerModule | null = null;
let BackgroundTask: BackgroundTaskModule | null = null;
let modulesLoaded = false;

function loadNativeModules(force = false) {
  if (modulesLoaded && !force) {
    return { TaskManager, BackgroundTask };
  }
  modulesLoaded = true;

  try {
    if (supportsNativeBackgroundTasks()) {
      TaskManager = require("expo-task-manager");
      BackgroundTask = require("expo-background-task");
    }
  } catch {
    TaskManager = null;
    BackgroundTask = null;
  }

  return { TaskManager, BackgroundTask };
}

function toNativeResult(
  BackgroundTaskMod: BackgroundTaskModule,
  result: BackgroundActivityResult,
) {
  return result === "failed"
    ? BackgroundTaskMod.BackgroundTaskResult.Failed
    : BackgroundTaskMod.BackgroundTaskResult.Success;
}

/**
 * Soft-loads TaskManager / BackgroundTask and defines the given tasks.
 * No-ops in Expo Go or when native modules are unavailable.
 */
export function defineNativeBackgroundTasks(
  tasks: NativeBackgroundTaskDefinition[],
  options: { supportsNative?: boolean } = {},
) {
  const canUseNative = options.supportsNative ?? supportsNativeBackgroundTasks();
  if (!canUseNative || !tasks.length) return;

  const modules = loadNativeModules();
  if (!modules.TaskManager || !modules.BackgroundTask) return;

  const { TaskManager: TM, BackgroundTask: BT } = modules;

  for (const task of tasks) {
    if (TM.isTaskDefined(task.name)) continue;
    TM.defineTask(task.name, async () => {
      const result = await task.activity();
      return toNativeResult(BT, result);
    });
  }
}

/**
 * Registers previously defined native background tasks with the OS scheduler.
 */
export async function registerNativeBackgroundTasks(
  tasks: NativeBackgroundTaskDefinition[],
  options: { supportsNative?: boolean } = {},
) {
  const canUseNative = options.supportsNative ?? supportsNativeBackgroundTasks();
  if (!canUseNative || !tasks.length) return;

  const { TaskManager: TM, BackgroundTask: BT } = loadNativeModules();
  if (!TM || !BT) return;

  try {
    const status = await BT.getStatusAsync();
    if (status === BT.BackgroundTaskStatus.Restricted) {
      console.warn(
        "[bg] native background tasks restricted; AppState runtime still applies",
      );
      return;
    }

    for (const task of tasks) {
      const isRegistered = await TM.isTaskRegisteredAsync(task.name);
      if (isRegistered) continue;
      await BT.registerTaskAsync(task.name, {
        minimumInterval: task.minimumIntervalMinutes ?? 15,
      });
    }
  } catch (error) {
    console.warn("[bg] failed to register native background tasks:", error);
  }
}

/**
 * Unregisters native background tasks by name.
 */
export async function unregisterNativeBackgroundTasks(
  taskNames: string[],
  options: { supportsNative?: boolean } = {},
) {
  const canUseNative = options.supportsNative ?? supportsNativeBackgroundTasks();
  if (!canUseNative || !taskNames.length) return;

  const { TaskManager: TM, BackgroundTask: BT } = loadNativeModules();
  if (!TM || !BT) return;

  try {
    for (const taskName of taskNames) {
      const isRegistered = await TM.isTaskRegisteredAsync(taskName);
      if (isRegistered) {
        await BT.unregisterTaskAsync(taskName);
      }
    }
  } catch (error) {
    console.warn("[bg] failed to unregister native background tasks:", error);
  }
}

export function getNativeBackgroundModules() {
  return loadNativeModules();
}
