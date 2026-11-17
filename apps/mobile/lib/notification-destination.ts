import {
  NotificationType,
  type ResponseNotificationDto,
} from "api-client";
import type { NotificationDestination } from "@softsurgery/mobile-lib";

export type {
  NotificationDestination,
  NotificationNavData,
} from "@softsurgery/mobile-lib";
export {
  destinationToNavData,
  navigateToNotificationDestination,
  parseNotificationNavData,
} from "@softsurgery/mobile-lib";

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
