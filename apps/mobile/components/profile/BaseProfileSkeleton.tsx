import React from "react";
import { View, useWindowDimensions } from "react-native";
import { Skeleton } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { useScreenOrientation } from "@softsurgery/mobile-hooks";

interface BaseProfileSkeletonProps {
  className?: string;
}

export const BaseProfileSkeleton = ({
  className,
}: BaseProfileSkeletonProps) => {
  const { width } = useWindowDimensions();
  const { isLandscape } = useScreenOrientation();
  const leftPaneWidth = Math.min(Math.round(width * 0.42), 360);

  if (isLandscape) {
    return (
      <View className={cn("flex-1 flex-row bg-background", className)}>
        <View
          className="border-r border-border/40"
          style={{ width: leftPaneWidth }}
        >
          <Skeleton className="h-28 w-full rounded-none bg-primary/25" />
          <View className="-mt-10 px-4">
            <View className="rounded-full border-4 border-background self-start">
              <Skeleton className="h-[76px] w-[76px] rounded-full" />
            </View>
            <Skeleton className="mt-3 h-6 w-36 rounded-md" />
            <Skeleton className="mt-2 h-4 w-24 rounded-md" />
          </View>
        </View>
        <View className="flex-1 p-4 gap-3">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </View>
      </View>
    );
  }

  return (
    <View className={cn("flex-1 bg-background", className)}>
      {/* Cover */}
      <Skeleton className="h-48 w-full rounded-none bg-primary/25" />

      {/* Header */}
      <View className="-mt-12 px-5">
        <View className="flex-row items-end justify-between">
          <View className="rounded-full border-4 border-background">
            <Skeleton className="h-[100px] w-[100px] rounded-full" />
          </View>
        </View>
      </View>
    </View>
  );
};
