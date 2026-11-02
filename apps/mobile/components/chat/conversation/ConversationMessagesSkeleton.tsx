import { View, useWindowDimensions } from "react-native";
import { cn } from "@softsurgery/lib";
import { Skeleton } from "@softsurgery/mobile-ui";
import { useScreenOrientation } from "@softsurgery/mobile-hooks";
import { ChatMediaSkeleton } from "./bubbles/ChatMediaSkeleton";

export interface ConversationMessagesSkeletonProps {
  className?: string;
}

type MessageSkeletonItem =
  | { type: "text"; right: boolean; widthFactor: number; height: number }
  | {
      type: "media";
      right: boolean;
      isGrouped?: boolean;
      hasCaption?: boolean;
    };

const SKELETON_TEMPLATES: MessageSkeletonItem[] = [
  { type: "text", right: true, widthFactor: 0.4, height: 56 },
  { type: "media", right: false, isGrouped: false, hasCaption: false },
  { type: "text", right: false, widthFactor: 0.5, height: 56 },
  { type: "text", right: false, widthFactor: 0.3, height: 56 },
  { type: "media", right: true, isGrouped: true, hasCaption: false },
  { type: "text", right: true, widthFactor: 0.25, height: 56 },
  { type: "text", right: false, widthFactor: 0.5, height: 56 },
  { type: "text", right: true, widthFactor: 0.4, height: 56 },
];

/**
 * Skeleton loading placeholder rendered while initial conversation messages are being fetched.
 */
export const ConversationMessagesSkeleton = ({
  className,
}: ConversationMessagesSkeletonProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const { isLandscape } = useScreenOrientation();
  const contentWidth = isLandscape
    ? Math.min(screenWidth - 48, 500)
    : screenWidth - 24;

  return (
    <View className={cn("flex-1 justify-end px-3 py-4 gap-2", className)}>
      {SKELETON_TEMPLATES.map((item, index) => {
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
              style={{
                width: Math.round(contentWidth * item.widthFactor),
                height: item.height,
              }}
            />
          </View>
        );
      })}
    </View>
  );
};
