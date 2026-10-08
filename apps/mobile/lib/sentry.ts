import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import { name, version } from "../package.json";

type SentrySdk = {
  init: (options: Record<string, unknown>) => void;
  wrap: <T>(component: T) => T;
  captureException: (error: unknown) => string | undefined;
};

const fallback: SentrySdk = {
  init: () => {},
  wrap: (component) => component,
  captureException: (error) => {
    console.error("Sentry is not available. Error:", error);
    return undefined;
  },
};

let Sentry: SentrySdk = fallback;

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isNativeAvailable = Platform.OS !== "web" && !isExpoGo;

const dsn =
  process.env.EXPO_PUBLIC_SENTRY_DSN ||
  (Constants.expoConfig?.extra?.sentryDsn as string | undefined);

// Never statically import @sentry/react-native. Evaluating that module
// throws "undefined is not a constructor" in Expo Go, web, and any
// binary where the native client is not linked.
if (isNativeAvailable) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loaded = require("@sentry/react-native") as SentrySdk & {
      default?: SentrySdk;
    };
    Sentry =
      typeof loaded?.init === "function" ? loaded : loaded.default ?? fallback;

    Sentry.init({
      dsn,
      enabled: Boolean(dsn),
      environment: process.env.EXPO_PUBLIC_MODE || "development",
      release: `${name}@${version}`,
      dist: Constants.nativeBuildVersion ?? undefined,
      tracesSampleRate:
        process.env.EXPO_PUBLIC_MODE === "production" ? 0.2 : 1.0,
      enableNative: true,
      enableNativeCrashHandling: true,
      enableNativeFramesTracking: true,
      enableAutoPerformanceTracing: true,
    });
  } catch (error) {
    console.warn(
      "Could not initialize @sentry/react-native. Rebuild the native app so the Sentry module is linked.",
      error,
    );
    Sentry = fallback;
  }
}

export default Sentry;
