import { Dimensions, View } from "react-native";
import { Skeleton } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";

const screenHeight = Dimensions.get("window").height;

interface RequestSkeletonProps {
  className?: string;
  hasLocation?: boolean;
}

export const RequestSkeleton = ({
  className,
  hasLocation,
}: RequestSkeletonProps) => {
  return (
    <View className={cn("flex-1 bg-background gap-4", className)}>
      {/* User header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-3.5 w-44 rounded-full" />
          </View>
        </View>
        <Skeleton className="h-7 w-20 rounded-full" />
      </View>

      {/* Date & Time */}
      <View className="flex-row items-center gap-3">
        <Skeleton className="h-5 w-5 rounded-md" />
        <View className="flex-1 gap-1.5">
          <Skeleton className="h-4 w-44 rounded-full" />
          <Skeleton className="h-3.5 w-24 rounded-full" />
        </View>
      </View>

      {/* Message bubble */}
      <View className="self-start">
        <Skeleton className="h-12 w-40 rounded-2xl rounded-bl-sm" />
      </View>

      {/* Location */}
      {hasLocation && (
        <Skeleton
          className="w-full rounded-xl"
          style={{ height: screenHeight * 0.4 }}
        />
      )}
    </View>
  );
};
