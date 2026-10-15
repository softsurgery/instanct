import React from "react";
import { getSocket } from "@softsurgery/lib";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";

export interface UserPresenceData {
  userId: string;
  isConnected: boolean;
  /** All active connection sources (e.g. ['web', 'mobile']). */
  sources: string[];
  lastSeen?: string | Date | null;
}

export interface UseUserPresenceProps {
  userId?: string;
}

export interface UseUserPresenceReturn {
  isConnected: boolean;
  lastSeen: Date | null;
  /** All active connection sources (e.g. ['web', 'mobile']). */
  sources: string[];
}

/**
 * Universal mobile presence hook subscribing to the global 'presence' WebSocket gateway with source 'mobile'.
 * Tracks real-time connection state, active device sources (web/mobile), and last-seen timestamps.
 */
export const useUserPresence = ({
  userId,
}: UseUserPresenceProps): UseUserPresenceReturn => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [sources, setSources] = React.useState<string[]>([]);
  const [lastSeen, setLastSeen] = React.useState<Date | null>(null);
  const authPersistStore = useAuthPersistStore();

  React.useEffect(() => {
    if (!userId) return;

    // Connect to the unified global presence gateway with source: 'mobile'
    const s = getSocket("presence", {
      token: authPersistStore.accessToken,
      source: "mobile",
    });

    /**
     * Updates local state when a status event for the target user is received.
     */
    const handleStatusUpdate = (status: any) => {
      if (status?.userId === userId) {
        const active = !!status.isConnected || !!status.isOnline;
        setIsConnected(active);
        const resolvedSources: string[] = Array.isArray(status.sources)
          ? status.sources
          : status.source
            ? [status.source]
            : [];
        setSources(resolvedSources);
        setLastSeen(status.lastSeen ? new Date(status.lastSeen) : null);
      }
    };

    /**
     * Handles bulk user status responses.
     */
    const handleUsersStatus = (statuses: any) => {
      if (!Array.isArray(statuses)) return;
      const found = statuses.find((item) => item?.userId === userId);
      if (found) {
        handleStatusUpdate(found);
      }
    };

    /**
     * Emits get-status request upon socket connection or reconnection.
     */
    const onConnect = () => {
      s.emit("get-status", { ids: [userId] }, (statuses?: any) => {
        if (Array.isArray(statuses)) {
          handleUsersStatus(statuses);
        } else if (statuses?.userId === userId) {
          handleStatusUpdate(statuses);
        }
      });
    };

    s.on("user-status", handleStatusUpdate);
    s.on("user-presence", handleStatusUpdate);
    s.on("users-status", handleUsersStatus);
    s.on("connect", onConnect);

    if (s.connected) {
      onConnect();
    }

    return () => {
      s.off("user-status", handleStatusUpdate);
      s.off("user-presence", handleStatusUpdate);
      s.off("users-status", handleUsersStatus);
      s.off("connect", onConnect);
    };
  }, [userId, authPersistStore.accessToken]);

  return { isConnected, lastSeen, sources };
};
