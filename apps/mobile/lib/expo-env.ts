import Constants, { ExecutionEnvironment } from "expo-constants";

/** True when running inside the Expo Go client (not a custom native build). */
export function isExpoGo(): boolean {
  return (
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    Constants.appOwnership === "expo"
  );
}

/**
 * OS-scheduled background tasks (`expo-background-task`) are not available
 * in Expo Go — registration is skipped / status is Restricted there.
 */
export function supportsNativeBackgroundTasks(): boolean {
  return !isExpoGo();
}
