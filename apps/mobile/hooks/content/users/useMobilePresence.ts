import React from "react";
import { AppState, type AppStateStatus } from "react-native";
import { disconnectSocket, getSocket, type Socket } from "@softsurgery/lib";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { getClientDeviceInfo } from "@/lib/device-info";
import { getDeviceMacAddress } from "@/lib/device-mac";

export interface UseMobilePresenceOptions {
  enabled?: boolean;
}

/**
 * App-level hook that maintains the mobile user's presence connection.
 * Automatically detects device, OS, and macAddress, registers connection
 * history on the backend (with IP-based location), and handles app state changes.
 */
export function useMobilePresence({
  enabled = true,
}: UseMobilePresenceOptions = {}) {
  const { accessToken, isAuthenticated } = useAuthPersistStore();
  const socketRef = React.useRef<Socket | null>(null);

  React.useEffect(() => {
    if (!enabled || !isAuthenticated || !accessToken) {
      if (socketRef.current) {
        disconnectSocket("presence");
        socketRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const establishPresence = async () => {
      try {
        const deviceInfo = getClientDeviceInfo();
        let macAddress = "02:00:00:00:00:00";
        try {
          macAddress = await getDeviceMacAddress();
        } catch (e) {
          console.warn("Failed to get device MAC for presence:", e);
        }

        if (!isMounted) return;

        const socket = getSocket("presence", {
          token: accessToken,
          source: "mobile",
          device: deviceInfo.device,
          os: deviceInfo.os,
          macAddress,
        });

        socketRef.current = socket;
      } catch (err) {
        console.warn("Failed to establish mobile presence:", err);
      }
    };

    void establishPresence();

    // Re-check or reconnect on foregrounding
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        void establishPresence();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      isMounted = false;
      subscription.remove();
      disconnectSocket("presence");
      socketRef.current = null;
    };
  }, [enabled, isAuthenticated, accessToken]);
}
