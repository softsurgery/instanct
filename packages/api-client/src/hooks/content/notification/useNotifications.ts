import { useAuthPersistStore } from "@softsurgery/hooks/stores";
import {
  addPushTokenListener,
  advanceNotificationWatermark,
  createAndroidChannel,
  getExpoPushToken,
  getPushDeviceName,
  presentLocalNotification,
  requestNotificationPermissions,
  type NotificationDestination,
} from "@softsurgery/notification-materials/mobile/lib";
import { disconnectSocket, getSocket, type Socket } from "@softsurgery/lib";
import { stringUtils } from "@softsurgery/lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { NotificationType, ResponseNotificationDto } from "api-client";

export const NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY = [
  "notifications-unread-count",
] as const;

interface useNotificationsProps {
  enabled?: boolean;
  consequences?: Record<NotificationType, (...args: any[]) => void>;
  getDestination?: (
    notification: ResponseNotificationDto,
  ) => NotificationDestination | null;
}

export interface UseNotificationsResult {
  notifications: ResponseNotificationDto[];
  count: number;
  resetCount: () => void;
}

export function useNotifications(
  { enabled = true, consequences, getDestination }: useNotificationsProps = {
    enabled: true,
  },
): UseNotificationsResult {
  const api = useApi();
  const queryClient = useQueryClient();
  const { t } = useTranslation("notifications");
  const [notifications, setNotifications] = React.useState<
    ResponseNotificationDto[]
  >([]);
  const socketRef = React.useRef<Socket | null>(null);
  const consequencesRef = React.useRef(consequences);
  const getDestinationRef = React.useRef(getDestination);
  consequencesRef.current = consequences;
  getDestinationRef.current = getDestination;
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
    if (!enabled || !isAuthenticated) return;

    let cancelled = false;
    (async () => {
      await requestNotificationPermissions();
      await createAndroidChannel();
      const token = await getExpoPushToken();
      if (!cancelled && token) {
        try {
          await api.notification.registerPushToken({
            token,
            platform: Platform.OS,
            deviceName: getPushDeviceName(),
          });
        } catch (error) {
          console.warn("[notif] failed to register push token:", error);
        }
      }
    })();

    const tokenSub = addPushTokenListener(() => {
      void getExpoPushToken().then((refreshedToken) => {
        if (!cancelled && refreshedToken) {
          void api.notification
            .registerPushToken({
              token: refreshedToken,
              platform: Platform.OS,
              deviceName: getPushDeviceName(),
            })
            .catch(() => {});
        }
      });
    });

    return () => {
      cancelled = true;
      tokenSub?.remove?.();
    };
  }, [api.notification, enabled, isAuthenticated]);

  React.useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    const socket = getSocket("notifications", {
      token: accessToken,
    });

    socketRef.current = socket;

    const onNotification = async (notification: ResponseNotificationDto) => {
      setNotifications((prev) => [...prev, notification]);
      queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      if (notification.type === NotificationType.NEW_SIGNIN) {
        queryClient.invalidateQueries({ queryKey: ["user-devices"] });
      }

      consequencesRef.current?.[notification.type]?.(notification);

      const destination = getDestinationRef.current?.(notification) ?? null;
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
    };

    socket.on("notification", onNotification);

    return () => {
      socket.off("notification", onNotification);
      disconnectSocket("notifications");
      socketRef.current = null;
    };
  }, [accessToken, enabled, isAuthenticated, queryClient, t]);

  const resetCount = React.useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return {
    notifications,
    count,
    resetCount,
  };
}
