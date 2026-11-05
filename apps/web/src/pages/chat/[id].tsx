import { Conversation } from "@softsurgery/chat-materials/web";
import { useRouter } from "next/router";

export default function ConversationPage() {
  const router = useRouter();
  const conversationId = Number(router.query.id);

  if (!router.isReady) return null;

  if (!Number.isFinite(conversationId)) {
    return <p className="text-sm text-muted-foreground">Conversation not found.</p>;
  }

  return <Conversation conversationId={conversationId} />;
}
