import { ConversationDetails } from "@softsurgery/chat-materials/mobile";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function Screen() {
  const { id } = useLocalSearchParams();

  return <ConversationDetails id={id as string} />;
}
