import {
  MessageVariant,
  StaticMessageEnum,
  type ResponseMessageDto,
  type ResponseUserDto,
} from "@softsurgery/api-client";
import {
  getChatNotificationDestination,
  type NotificationDestination,
} from "@/lib/notification-destination";
import { presentLocalNotification } from "@/lib/notification";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import i18n from "@/i18n";

function chatNotificationT(key: string) {
  return i18n.t(`chat.notifications.${key}`, { ns: "chat" }).toString();
}

export function formatChatNotificationBody(
  message?: Pick<ResponseMessageDto, "content" | "variant" | "static"> | null,
): string {
  if (!message) return chatNotificationT("sentMessage");

  if (
    message.variant === MessageVariant.STATIC &&
    message.static === StaticMessageEnum.POKE
  ) {
    return chatNotificationT("pokedYou");
  }

  if (message.static === StaticMessageEnum.FIRST_MESSAGE) {
    return message.content?.trim() || chatNotificationT("wantsToChat");
  }

  switch (message.variant) {
    case MessageVariant.IMAGE:
      return chatNotificationT("image");
    case MessageVariant.VIDEO:
      return chatNotificationT("video");
    case MessageVariant.FILE:
      return chatNotificationT("file");
    case MessageVariant.EMOJI:
    case MessageVariant.TEXT:
      return message.content?.trim() || chatNotificationT("sentMessage");
    default:
      return message.content?.trim() || chatNotificationT("sentMessage");
  }
}

export type PresentChatMessageNotificationInput = {
  conversationId: number | string;
  user?: ResponseUserDto | null;
  message?: Pick<ResponseMessageDto, "content" | "variant" | "static"> | null;
  /** Optional override when message body should differ from the formatted message. */
  body?: string;
  title?: string;
  destination?: NotificationDestination | null;
  data?: Record<string, unknown>;
};

/**
 * Local chat notification showing the sender's name, profile picture, and message.
 */
export async function presentChatMessageNotification({
  conversationId,
  user,
  message,
  body,
  title,
  destination,
  data = {},
}: PresentChatMessageNotificationInput) {
  const displayName = identifyUser(user);
  const resolvedDestination =
    destination ??
    getChatNotificationDestination({
      conversationId,
      userId: user?.id,
      identifier: displayName,
      pictureId: user?.pictureId,
      avatarFallback: identifyUserAvatar(user),
    });

  await presentLocalNotification({
    title: title ?? displayName,
    body: body ?? formatChatNotificationBody(message),
    pictureId: user?.pictureId,
    destination: resolvedDestination,
    data: {
      type: "NEW_MESSAGE",
      conversationId: String(conversationId),
      ...(user?.id ? { userId: String(user.id) } : {}),
      ...data,
    },
  });
}
