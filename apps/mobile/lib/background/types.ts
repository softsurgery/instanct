export type BackgroundActivityResult = "success" | "no-data" | "failed";

/** A unit of work that can run in AppState polling or as a native OS task. */
export type BackgroundActivity = () => Promise<BackgroundActivityResult>;

export type NativeBackgroundTaskDefinition = {
  /** Unique task name passed to TaskManager / BackgroundTask. */
  name: string;
  activity: BackgroundActivity;
  /** Minimum interval in minutes for OS scheduling (default 15). */
  minimumIntervalMinutes?: number;
};

export type AppStateBackgroundRuntimeOptions = {
  /** Activities to run on each tick. */
  activities: BackgroundActivity[];
  /** Poll interval while AppState is background/inactive. */
  backgroundPollMs?: number;
  /** Poll interval while AppState is active. */
  foregroundPollMs?: number;
  /**
   * Optional runtime id so multiple independent AppState runtimes can coexist.
   * Defaults to `"default"`.
   */
  id?: string;
  /** Called when a tick finishes (optional diagnostics). */
  onTickResult?: (result: BackgroundActivityResult) => void;
};

export type RegisterBackgroundUtilitiesOptions = {
  /**
   * Activities for the AppState + interval fallback (Expo Go / restricted).
   * Defaults to the `activity` of each entry in `tasks` when omitted.
   */
  activities?: BackgroundActivity[];
  /** Native OS background task definitions (skipped in Expo Go). */
  tasks?: NativeBackgroundTaskDefinition[];
  /** AppState runtime tuning. Set `enabled: false` to skip it. */
  appState?: {
    enabled?: boolean;
    backgroundPollMs?: number;
    foregroundPollMs?: number;
    id?: string;
    onTickResult?: (result: BackgroundActivityResult) => void;
  };
  /**
   * Override native-task availability. Defaults to `supportsNativeBackgroundTasks()`.
   */
  supportsNative?: boolean;
};

export type UnregisterBackgroundUtilitiesOptions = {
  taskNames?: string[];
  appStateId?: string;
  supportsNative?: boolean;
};
