import { ConversationReportPortal } from "@softsurgery/chat-materials/mobile";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function Screen() {
  const { id, reportedUserName } = useLocalSearchParams();

  return (
    <ConversationReportPortal
      conversationId={Number(id)}
      reportedUserName={reportedUserName as string | undefined}
    />
  );
}
