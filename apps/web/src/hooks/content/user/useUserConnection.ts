import React from "react";
import { useAuthPersistStore } from "@softsurgery/hooks/stores";
import { useSession } from "next-auth/react";
import { getSocket } from "@softsurgery/lib";

export interface UserConnectionStatus {
  userId: string;
  isConnected: boolean;
  sources: string[];
  lastSeen?: string | Date | null;
}

export interface UseUserConnectionOptions {
  ids?: string[];
  enabled?: boolean;
}

export type UseUserConnectionInput =
  | string
  | string[]
  | UseUserConnectionOptions
  | undefined;

/**
 * Normalizes incoming user status payloads.
 */
function normalizeStatus(raw: any): UserConnectionStatus {
  return {
    userId: raw?.userId || "",
    isConnected: !!raw?.isConnected,
    sources: Array.isArray(raw?.sources) ? raw.sources : [],
    lastSeen: raw?.lastSeen ?? null,
  };
}

/**
 * Resolves current authentication token across store and NextAuth session.
 */
export function usePresenceToken(): string {
  const authPersistStore = useAuthPersistStore();
  const { data: session } = useSession();
  return (
    authPersistStore.accessToken ||
    (session?.user as { access_token?: string })?.access_token ||
    ""
  );
}

/**
 * Core presence subscription hook that maintains real-time statuses for a list of user IDs.
 */
export function usePresenceSubscription(
  ids: string[] = [],
  enabled: boolean = true,
) {
  const token = usePresenceToken();
  const [statuses, setStatuses] = React.useState<
    Record<string, UserConnectionStatus>
  >({});

  const idsKey = React.useMemo(() => ids.slice().sort().join(","), [ids]);

  React.useEffect(() => {
    if (!token || !enabled || ids.length === 0) return;

    const socket = getSocket("presence", { token, source: "web" });

    const queryStatuses = () => {
      socket.emit("get-status", { ids });
    };

    const onPresence = (data: any) => {
      if (!data?.userId) return;
      setStatuses((prev) => ({
        ...prev,
        [data.userId]: normalizeStatus(data),
      }));
    };

    const onBulkStatuses = (list: any[]) => {
      if (!Array.isArray(list)) return;
      setStatuses((prev) => {
        const next = { ...prev };
        for (const item of list) {
          if (item?.userId) next[item.userId] = normalizeStatus(item);
        }
        return next;
      });
    };

    socket.on("connect", queryStatuses);
    socket.on("user-presence", onPresence);
    socket.on("user-status", onPresence);
    socket.on("users-status", onBulkStatuses);

    if (socket.connected) {
      queryStatuses();
    }

    return () => {
      socket.off("connect", queryStatuses);
      socket.off("user-presence", onPresence);
      socket.off("user-status", onPresence);
      socket.off("users-status", onBulkStatuses);
    };
  }, [token, enabled, idsKey]);

  const isUserConnected = React.useCallback(
    (userId: string): boolean => {
      if (!userId) return false;
      return !!statuses[userId]?.isConnected;
    },
    [statuses],
  );

  return { statuses, isUserConnected };
}

/**
 * Universal hook for checking connection/presence of a single user.
 */
export function useUserPresence(userId?: string) {
  const ids = React.useMemo(() => (userId ? [userId] : []), [userId]);
  const { statuses, isUserConnected } = usePresenceSubscription(ids, !!userId);
  const status = userId ? statuses[userId] : null;

  return {
    isConnected: userId ? isUserConnected(userId) : false,
    sources: status?.sources ?? [],
    lastSeen: status?.lastSeen ? new Date(status.lastSeen) : null,
    status,
  };
}

/**
 * Hook to track connection status for multiple users (e.g. data tables).
 */
export function useUserConnection(input?: UseUserConnectionInput) {
  const { targetIds, enabled } = React.useMemo(() => {
    if (!input) return { targetIds: [], enabled: true };
    if (typeof input === "string") {
      const clean = input.trim();
      return { targetIds: clean ? [clean] : [], enabled: true };
    }
    if (Array.isArray(input)) {
      return {
        targetIds: Array.from(
          new Set(
            input.filter(
              (id): id is string => typeof id === "string" && !!id.trim(),
            ),
          ),
        ),
        enabled: true,
      };
    }
    const rawIds = input.ids ?? [];
    return {
      targetIds: Array.from(
        new Set(
          rawIds.filter(
            (id): id is string => typeof id === "string" && !!id.trim(),
          ),
        ),
      ),
      enabled: input.enabled !== false,
    };
  }, [input]);

  const { statuses, isUserConnected } = usePresenceSubscription(
    targetIds,
    enabled,
  );

  const singleId = targetIds.length === 1 ? targetIds[0] : null;
  const singleStatus = singleId ? statuses[singleId] || null : null;
  const isConnected = singleId
    ? isUserConnected(singleId)
    : targetIds.some((id) => isUserConnected(id));

  return {
    statuses,
    isUserConnected,
    isConnected,
    sources: singleStatus?.sources ?? [],
    lastSeen: singleStatus?.lastSeen ? new Date(singleStatus.lastSeen) : null,
    status: singleStatus,
  };
}
