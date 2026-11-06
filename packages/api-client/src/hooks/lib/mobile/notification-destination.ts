import {
  NotificationType,
  type ResponseNotificationDto,
} from "api-client";
import { router } from "expo-router";

export type NotificationDestination = {
  pathname: string;
  params?: Record<string, string>;
};

/** Payload carried in OS notification `data` so taps know where to navigate. */
export type NotificationNavData = {
  screen: string;
  params?: string;
  type?: string;
  notificationId?: string;
  conversationId?: string;
};

export function getNotificationDestination(
  notification: Pick<ResponseNotificationDto, "type" | "payload">,
): NotificationDestination | null {
  switch (notification.type) {
    case NotificationType.REQUEST_RECEIVED:
      return {
        pathname: "/main/request/answer",
        params: {
          id: String(notification.payload?.requestId ?? ""),
          isIncoming: "1",
        },
      };
    case NotificationType.REQUEST_ACCEPTED:
    case NotificationType.REQUEST_REJECTED:
      return {
        pathname: "/main/request/answer",
        params: {
          id: String(notification.payload?.requestId ?? ""),
          isIncoming: "0",
        },
      };
    case NotificationType.NEW_SIGNIN:
      return {
        pathname: "/main/new-signin",
        params: {
          deviceId: String(notification.payload?.deviceId ?? ""),
          connectionId: String(notification.payload?.connectionId ?? ""),
        },
      };
    case NotificationType.NEW_MESSAGE: {
      const conversationId =
        notification.payload?.conversationId ?? notification.payload?.id;
      if (conversationId == null) {
        return { pathname: "/main/chat" };
      }
      return {
        pathname: "/main/chat/conversation",
        params: {
          id: String(conversationId),
          ...(notification.payload?.userId != null
            ? { userId: String(notification.payload.userId) }
            : {}),
          ...(notification.payload?.identifier
            ? { identifier: String(notification.payload.identifier) }
            : {}),
          ...(notification.payload?.pictureId != null
            ? { pictureId: String(notification.payload.pictureId) }
            : {}),
        },
      };
    }
    case NotificationType.TEST:
      return { pathname: "/main/notifications" };
    default:
      return null;
  }
}

export function getChatNotificationDestination(input: {
  conversationId: number | string;
  userId?: string;
  identifier?: string;
  pictureId?: string | number | null;
  avatarFallback?: string;
}): NotificationDestination {
  return {
    pathname: "/main/chat/conversation",
    params: {
      id: String(input.conversationId),
      ...(input.userId ? { userId: String(input.userId) } : {}),
      ...(input.identifier ? { identifier: input.identifier } : {}),
      ...(input.pictureId != null
        ? { pictureId: String(input.pictureId) }
        : {}),
      ...(input.avatarFallback ? { avatarFallback: input.avatarFallback } : {}),
    },
  };
}

export function destinationToNavData(
  destination: NotificationDestination | null | undefined,
  extras: Omit<NotificationNavData, "screen" | "params"> = {},
): NotificationNavData | Record<string, never> {
  if (!destination?.pathname) return {};
  return {
    screen: destination.pathname,
    ...(destination.params
      ? { params: JSON.stringify(destination.params) }
      : {}),
    ...extras,
  };
}

export function parseNotificationNavData(
  data: Record<string, unknown> | undefined | null,
): NotificationDestination | null {
  if (!data || typeof data.screen !== "string" || !data.screen) {
    return null;
  }

  let params: Record<string, string> | undefined;
  if (typeof data.params === "string" && data.params) {
    try {
      const parsed = JSON.parse(data.params) as Record<string, unknown>;
      params = Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [key, String(value)]),
      );
    } catch {
      params = undefined;
    }
  } else if (data.params && typeof data.params === "object") {
    params = Object.fromEntries(
      Object.entries(data.params as Record<string, unknown>).map(
        ([key, value]) => [key, String(value)],
      ),
    );
  }

  return { pathname: data.screen, params };
}

export function navigateToNotificationDestination(
  destination: NotificationDestination | null | undefined,
): boolean {
  if (!destination?.pathname) return false;
  router.push({
    pathname: destination.pathname as never,
    params: destination.params,
  });
  return true;
}
