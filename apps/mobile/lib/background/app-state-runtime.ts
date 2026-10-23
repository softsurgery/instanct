import {
  AppState,
  type AppStateStatus,
  type NativeEventSubscription,
} from "react-native";
import { runBackgroundActivities } from "@/lib/background/run-activities";
import type {
  AppStateBackgroundRuntimeOptions,
  BackgroundActivityResult,
} from "@/lib/background/types";

const DEFAULT_BACKGROUND_POLL_MS = 30_000;
const DEFAULT_FOREGROUND_POLL_MS = 5 * 60_000;

type RuntimeState = {
  options: Required<
    Pick<
      AppStateBackgroundRuntimeOptions,
      "activities" | "backgroundPollMs" | "foregroundPollMs"
    >
  > &
    Pick<AppStateBackgroundRuntimeOptions, "onTickResult">;
  appStateSub: NativeEventSubscription | null;
  pollTimer: ReturnType<typeof setInterval> | null;
  running: boolean;
};

const runtimes = new Map<string, RuntimeState>();

async function tick(id: string) {
  const runtime = runtimes.get(id);
  if (!runtime || runtime.running) return;

  runtime.running = true;
  try {
    const result: BackgroundActivityResult = await runBackgroundActivities(
      runtime.options.activities,
    );
    runtime.options.onTickResult?.(result);
  } finally {
    runtime.running = false;
  }
}

function clearPoll(runtime: RuntimeState) {
  if (runtime.pollTimer) {
    clearInterval(runtime.pollTimer);
    runtime.pollTimer = null;
  }
}

function startPoll(id: string, intervalMs: number) {
  const runtime = runtimes.get(id);
  if (!runtime) return;

  clearPoll(runtime);
  runtime.pollTimer = setInterval(() => {
    void tick(id);
  }, intervalMs);
}

function handleAppStateChange(id: string, nextState: AppStateStatus) {
  const runtime = runtimes.get(id);
  if (!runtime) return;

  if (nextState === "active") {
    void tick(id);
    startPoll(id, runtime.options.foregroundPollMs);
    return;
  }

  void tick(id);
  startPoll(id, runtime.options.backgroundPollMs);
}

/**
 * Starts an AppState + interval background runtime.
 * Idempotent per `id` — calling again with the same id updates activities/intervals.
 */
export function startAppStateBackgroundRuntime(
  options: AppStateBackgroundRuntimeOptions,
) {
  const id = options.id ?? "default";
  const nextOptions = {
    activities: options.activities,
    backgroundPollMs: options.backgroundPollMs ?? DEFAULT_BACKGROUND_POLL_MS,
    foregroundPollMs: options.foregroundPollMs ?? DEFAULT_FOREGROUND_POLL_MS,
    onTickResult: options.onTickResult,
  };

  const existing = runtimes.get(id);
  if (existing) {
    existing.options = nextOptions;
    const current = (AppState.currentState ?? "active") as AppStateStatus;
    handleAppStateChange(id, current);
    return;
  }

  const runtime: RuntimeState = {
    options: nextOptions,
    appStateSub: null,
    pollTimer: null,
    running: false,
  };
  runtimes.set(id, runtime);

  const current = (AppState.currentState ?? "active") as AppStateStatus;
  handleAppStateChange(id, current);
  runtime.appStateSub = AppState.addEventListener("change", (state) =>
    handleAppStateChange(id, state),
  );
}

/**
 * Stops an AppState background runtime previously started with `id`.
 */
export function stopAppStateBackgroundRuntime(id = "default") {
  const runtime = runtimes.get(id);
  if (!runtime) return;

  runtime.appStateSub?.remove();
  clearPoll(runtime);
  runtimes.delete(id);
}
