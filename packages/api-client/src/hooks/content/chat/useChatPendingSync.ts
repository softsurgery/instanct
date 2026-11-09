import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@softsurgery/lib";
import { useAuthPersistStore } from "@softsurgery/hooks/stores";
import { useCurrentUser } from "../../user-based/useCurrentUser";
import { useChatPendingStore } from "../../stores/useChatPendingStore";
import {
  conversationLinksMessagesQueryKey,
  prependMessageToConversationLinksCache,
  removeMessageFromInfiniteMessages,
} from "../../lib/chat-cache";
import { messageHasLinks } from "../../lib/messageLinks";
import { MessageVariant, ResponseMessageDto } from "api-client";

interface CachedConversationMessages {
  messages: ResponseMessageDto[];
  hasMore: boolean;
  currentPage: number;
}

/**
 * Effect hook that synchronizes real-time incoming messages with React Query cache
 * and reconciles outgoing pending text messages in useChatPendingStore.
 */
export const useChatPendingSync = () => {
  const queryClient = useQueryClient();
  const authPersistStore = useAuthPersistStore();
  const { currentUser } = useCurrentUser();

  React.useEffect(() => {
    const s = getSocket("chat", { token: authPersistStore.accessToken });
    const userId = currentUser?.id;

    /**
     * Handler invoked when Socket.io receives a new message.
     * Updates React Query message caches and dequeues matching pending text items.
     */
    const onMessage = (message: ResponseMessageDto) => {
      queryClient.setQueryData<CachedConversationMessages>(
        ["conversation-messages", message.conversationId],
        (prev) => {
          const existing = prev?.messages ?? [];
          if (existing.some((item) => item.id === message.id)) {
            return prev;
          }

          return {
            messages: [message, ...existing],
            hasMore: prev?.hasMore ?? true,
            currentPage: prev?.currentPage ?? 1,
          };
        },
      );

      if (messageHasLinks(message)) {
        queryClient.setQueryData(
          conversationLinksMessagesQueryKey(message.conversationId),
          (oldData) =>
            prependMessageToConversationLinksCache(
              oldData as Parameters<
                typeof prependMessageToConversationLinksCache
              >[0],
              message,
            ),
        );
      }

      if (
        userId &&
        message.userId === userId &&
        message.variant === MessageVariant.TEXT
      ) {
        const clientId = useChatPendingStore
          .getState()
          .dequeueSentText(message.conversationId);
        if (clientId) {
          useChatPendingStore.getState().removePendingText(clientId);
        }
      }
    };

    const onMessageDeleted = ({
      messageId,
      conversationId,
    }: {
      messageId: number;
      conversationId: number;
    }) => {
      queryClient.setQueryData<CachedConversationMessages>(
        ["conversation-messages", conversationId],
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.filter((message) => message.id !== messageId),
          };
        },
      );

      queryClient.setQueriesData({ queryKey: ["messages"] }, (oldData) =>
        removeMessageFromInfiniteMessages(
          oldData as Parameters<typeof removeMessageFromInfiniteMessages>[0],
          messageId,
        ),
      );

      queryClient.invalidateQueries({
        queryKey: ["conversation-message-search", conversationId],
      });
    };

    s.on("message", onMessage);
    s.on("message-deleted", onMessageDeleted);

    return () => {
      s.off("message", onMessage);
      s.off("message-deleted", onMessageDeleted);
    };
  }, [authPersistStore.accessToken, currentUser?.id, queryClient]);
};
