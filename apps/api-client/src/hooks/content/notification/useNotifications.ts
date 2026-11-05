import { useAuthPersistStore } from "@softsurgery/hooks/stores";
import {
  createAndroidChannel,
  presentLocalNotification,
  requestNotificationPermissions,
} from "../../lib/mobile/notification";
import { getNotificationDestination } from "../../lib/mobile/notification-destination";
import { advanceNotificationWatermark } from "../../lib/notification-watermark";
import { disconnectSocket, getSocket, type Socket } from "@softsurgery/lib";
import { stringUtils } from "@softsurgery/lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { NotificationType, ResponseNotificationDto } from "api-client";

export const NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY = [
  "notifications-unread-count",
] as const;

interface useNotificationsProps {
  enabled?: boolean;
  consequences?: Record<NotificationType, (...args: any[]) => void>;
}

export interface UseNotificationsResult {
  notifications: ResponseNotificationDto[];
  count: number;
  resetCount: () => void;
}

export function useNotifications(
  { enabled = true, consequences }: useNotificationsProps = { enabled: true },
): UseNotificationsResult {
  const api = useApi();
  const queryClient = useQueryClient();
  const { t } = useTranslation("notifications");
  const [notifications, setNotifications] = React.useState<
    ResponseNotificationDto[]
  >([]);
  const socketRef = React.useRef<Socket | null>(null);
  const { accessToken, isAuthenticated } = useAuthPersistStore();

  const { data: count = 0 } = useQuery({
    queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
    queryFn: () => api.notification.getUnreadCount(),
    enabled: enabled && isAuthenticated,
  });

  const { mutate: markAllAsRead } = useMutation({
    mutationFn: () => api.notification.markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData(NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY, 0);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  React.useEffect(() => {
    (async () => {
      await requestNotificationPermissions();
      await createAndroidChannel();
    })();
  }, []);

  React.useEffect(() => {
    const socket = getSocket("notifications", {
      token: accessToken,
    });

    socketRef.current = socket;

    socket.on("notification", async (notification: ResponseNotificationDto) => {
      if (!enabled) return;
      setNotifications((prev) => [...prev, notification]);
      queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      if (notification.type === NotificationType.NEW_SIGNIN) {
        queryClient.invalidateQueries({ queryKey: ["user-devices"] });
      }

      consequences?.[notification.type]?.(notification);

      const destination = getNotificationDestination(notification);
      await presentLocalNotification({
        title: stringUtils.sanitizeText(
          t(`titles.${notification.type}`, notification.payload).toString(),
        ),
        body: stringUtils.sanitizeText(
          t(
            `descriptions.${notification.type}`,
            notification.payload,
          ).toString(),
        ),
        destination,
        data: {
          type: notification.type,
          notificationId: notification.id,
        },
      });
      void advanceNotificationWatermark(notification.createdAt);
    });

    return () => {
      disconnectSocket("notifications");
      socketRef.current = null;
    };
  }, [accessToken, consequences, enabled, queryClient, t]);

  const resetCount = React.useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return {
    notifications,
    count,
    resetCount,
  };
}
