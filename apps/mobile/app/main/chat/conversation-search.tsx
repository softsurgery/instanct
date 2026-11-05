import React from "react";
import {
  ConversationSearchPortal,
  navigateToConversationMessage,
} from "@softsurgery/chat-materials/mobile";
import { router, useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();
  const id = Number(conversationId);

  return (
    <ConversationSearchPortal
      conversationId={id}
      onClose={() => router.back()}
      onResultPress={(message) =>
        navigateToConversationMessage({
          conversationId: id,
          messageId: message.id,
        })
      }
    />
  );
}
