import React from "react";
import { useAuthPersistStore } from "@softsurgery/hooks/stores";
import { useCurrentUser } from "api-client/hooks";
import { FloatingMonitor, shouldShowMobileMonitor } from "@softsurgery/mobile-monitor";

/**
 * Renders the floating CPU / GPU / memory monitor overlay only in __DEV__ mode
 * or when the connected authenticated user holds an Admin role.
 */
export function AppMonitorOverlay() {
  const isAuthenticated = useAuthPersistStore((s) => s.isAuthenticated);
  const { currentUser } = useCurrentUser({
    enabled: !__DEV__ && isAuthenticated,
  });

  const isAdmin = [
    currentUser?.roleId,
    currentUser?.role?.id,
    currentUser?.role?.label,
  ].some(
    (value) =>
      typeof value === "string" && value.trim().toLowerCase() === "admin",
  );

  const visible = shouldShowMobileMonitor({
    isDev: __DEV__,
    isAuthenticated,
    isAdmin,
  });

  if (!visible) {
    return null;
  }

  return <FloatingMonitor enabled={visible} />;
}
