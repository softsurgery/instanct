import { Dimensions, View } from "react-native";
import { cn } from "@softsurgery/lib";
import { Skeleton } from "@softsurgery/mobile-ui";
import { ChatMediaSkeleton } from "./bubbles/ChatMediaSkeleton";

export interface ConversationMessagesSkeletonProps {
  className?: string;
}

const screenWidth = Dimensions.get("window").width;
const CONTENT_WIDTH = screenWidth - 24;

type MessageSkeletonItem =
  | { type: "text"; right: boolean; width: number; height: number }
  | {
      type: "media";
      right: boolean;
      isGrouped?: boolean;
      hasCaption?: boolean;
    };

const MESSAGE_SKELETONS: MessageSkeletonItem[] = [
  { type: "text", right: true, width: CONTENT_WIDTH * 0.4, height: 56 },
  { type: "media", right: false, isGrouped: false, hasCaption: false },
  { type: "text", right: false, width: CONTENT_WIDTH * 0.5, height: 56 },
  { type: "text", right: false, width: CONTENT_WIDTH * 0.3, height: 56 },
  { type: "media", right: true, isGrouped: true, hasCaption: false },
  { type: "text", right: true, width: CONTENT_WIDTH * 0.25, height: 56 },
  { type: "text", right: false, width: CONTENT_WIDTH * 0.5, height: 56 },
  { type: "text", right: true, width: CONTENT_WIDTH * 0.4, height: 56 },
];

/**
 * Skeleton loading placeholder rendered while initial conversation messages are being fetched.
 */
export const ConversationMessagesSkeleton = ({
  className,
}: ConversationMessagesSkeletonProps) => {
  return (
    <View className={cn("flex-1 justify-end px-3 py-4 gap-2", className)}>
      {MESSAGE_SKELETONS.map((item, index) => {
        if (item.type === "media") {
          return (
            <ChatMediaSkeleton
              key={index}
              right={item.right}
              isGrouped={item.isGrouped}
              hasCaption={item.hasCaption}
            />
          );
        }

        return (
          <View
            key={index}
            className={cn(
              "w-full flex-row",
              item.right ? "justify-end" : "justify-start",
            )}
          >
            <Skeleton
              className={cn("rounded-xl border border-border")}
              style={{ width: item.width, height: item.height }}
            />
          </View>
        );
      })}
    </View>
  );
};
