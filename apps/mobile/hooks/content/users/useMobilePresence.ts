import React from "react";
import { AppState, type AppStateStatus } from "react-native";
import { disconnectSocket, type Socket } from "@softsurgery/lib";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import {
  registerBackgroundActivities,
  unregisterBackgroundActivities,
} from "@/lib/app-background";
import { connectMobilePresence } from "@/lib/mobile-presence";

export interface UseMobilePresenceOptions {
  enabled?: boolean;
}

/**
 * App-level hook that maintains the mobile user's presence connection.
 * Registers background activities so presence can refresh while suspended.
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
      void unregisterBackgroundActivities();
      return;
    }

    let isMounted = true;

    const establishPresence = async () => {
      try {
        const socket = await connectMobilePresence(accessToken);
        if (!isMounted) return;
        socketRef.current = socket;
      } catch (err) {
        console.warn("Failed to establish mobile presence:", err);
      }
    };

    void establishPresence();
    void registerBackgroundActivities();

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
