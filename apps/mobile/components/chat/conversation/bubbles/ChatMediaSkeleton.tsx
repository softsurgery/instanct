import { Dimensions, View } from "react-native";
import { cn } from "@softsurgery/lib";
import { Skeleton } from "@softsurgery/mobile-ui";

export interface ChatMediaSkeletonProps {
  className?: string;
  right?: boolean;
  isGrouped?: boolean;
  hasCaption?: boolean;
  width?: number;
  height?: number;
}

/**
 * Skeleton placeholder for chat media bubbles when loading in conversations.
 */
export const ChatMediaSkeleton = ({
  className,
  right = false,
  isGrouped = false,
  hasCaption = false,
  width,
  height,
}: ChatMediaSkeletonProps) => {
  const screenWidth = Dimensions.get("window").width;
  const CHAT_MEDIA_WIDTH = width ?? Math.round(screenWidth * 0.75);
  const CHAT_MEDIA_HEIGHT =
    height ?? (isGrouped ? CHAT_MEDIA_WIDTH : Math.round(CHAT_MEDIA_WIDTH * 0.75));

  return (
    <View
      className={cn(
        "mx-3 mt-1.5",
        right ? "self-end" : "self-start",
        className,
      )}
      style={{
        maxWidth: CHAT_MEDIA_WIDTH + 24,
      }}
    >
      <View
        className="relative overflow-hidden rounded-xl bg-muted"
        style={{
          width: CHAT_MEDIA_WIDTH,
          height: CHAT_MEDIA_HEIGHT,
        }}
      >
        <Skeleton
          className="rounded-xl border border-border"
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </View>

      {hasCaption && (
        <View className="px-1 py-2 gap-1.5">
          <Skeleton className="h-4 w-4/5 rounded" />
          <Skeleton className="h-4 w-3/5 rounded" />
        </View>
      )}

      <View
        className={cn(
          "px-1 pt-1 flex-row",
          right ? "justify-end" : "justify-start",
        )}
      >
        <Skeleton className="h-3 w-12 rounded mt-0.5" />
      </View>
    </View>
  );
};
