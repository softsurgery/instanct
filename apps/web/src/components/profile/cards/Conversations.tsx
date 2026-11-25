import { useCurrentUser } from "@/hooks/content/user/useCurrentUser";
import { cn } from "@/lib/utils";
import {
  ChatBubble,
  ChatFileBubble,
  ChatMediaBubble,
  ChatPortal,
  ChatStaticBubble,
  ConversationMessagesSkeleton,
} from "@softsurgery/chat-materials/web";
import { Button } from "@softsurgery/ui";
import { MessageVariant } from "api-client";
import { useConversationMessages } from "api-client/hooks/chat/useConversationMessages";
import { MessageSquare } from "lucide-react";
import React from "react";

interface ConversationsProps {
  className?: string;
  userId?: string;
}

const ConversationReadOnlyViewer = ({
  conversationId,
  perspectiveUserId,
}: {
  conversationId: number;
  perspectiveUserId?: string;
}) => {
  const {
    messages,
    isMessagesPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useConversationMessages({
    id: conversationId,
    query: { limit: "30", sort: "createdAt,DESC" },
  });

  const orderedMessages = React.useMemo(
    () => [...messages].reverse(),
    [messages],
  );

  return (
    <div className="flex h-[600px] min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/20 px-4 py-4">
        {hasNextPage ? (
          <div className="mb-2 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Loading..." : "Earlier messages"}
            </Button>
          </div>
        ) : null}

        {isMessagesPending ? (
          <ConversationMessagesSkeleton />
        ) : orderedMessages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {orderedMessages.map((message) => {
              const isRight = message.userId === perspectiveUserId;

              if (message.variant === MessageVariant.STATIC) {
                return <ChatStaticBubble key={message.id} message={message} />;
              }

              if (
                message.variant === MessageVariant.IMAGE ||
                message.variant === MessageVariant.VIDEO
              ) {
                return (
                  <ChatMediaBubble
                    key={message.id}
                    uploads={message.uploads}
                    variant={message.variant}
                    caption={message.content}
                    timestamp={new Date(message.createdAt)}
                    right={isRight}
                  />
                );
              }

              if (message.variant === MessageVariant.FILE) {
                return (
                  <ChatFileBubble
                    key={message.id}
                    uploads={message.uploads}
                    caption={message.content}
                    timestamp={new Date(message.createdAt)}
                    right={isRight}
                  />
                );
              }

              return (
                <ChatBubble
                  key={message.id}
                  message={message.content}
                  links={message.links}
                  timestamp={new Date(message.createdAt)}
                  right={isRight}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const Conversations = ({ className, userId }: ConversationsProps) => {
  const { user: currentUser } = useCurrentUser();
  const isOtherUser = Boolean(userId && userId !== currentUser?.id);
  const [selectedConversationId, setSelectedConversationId] = React.useState<
    number | undefined
  >(undefined);

  React.useEffect(() => {
    setSelectedConversationId(undefined);
  }, [userId]);

  if (!isOtherUser) {
    return (
      <ChatPortal
        userId={userId}
        enableIntro={false}
        className={cn("h-[600px]", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 lg:grid-cols-12",
        className,
      )}
    >
      <div className="lg:col-span-5">
        <ChatPortal
          userId={userId}
          enableIntro={false}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          className="h-[600px]"
        />
      </div>
      <div className="lg:col-span-7">
        {selectedConversationId ? (
          <ConversationReadOnlyViewer
            conversationId={selectedConversationId}
            perspectiveUserId={userId}
          />
        ) : (
          <div className="flex h-[600px] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              Select a conversation to view its messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
