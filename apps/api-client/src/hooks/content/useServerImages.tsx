// @ts-nocheck — NativeWind className props; typechecked via mobile app.
import { Image } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { ImageSource } from "expo-image";
import React from "react";
import { View } from "react-native";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@softsurgery/mobile-components";
import { Skeleton } from "@softsurgery/mobile-ui";
import { Text } from "@softsurgery/mobile-ui";
import { useAuthPersistStore } from "@softsurgery/hooks/stores";
import { useApi } from "../context/ApiContext";

interface UseServerImagesProps {
  ids: (number | undefined)[];
  fallbacks?: (string | React.ReactNode | ImageSource | undefined)[];
  size?: { width?: number; height?: number };
  className?: string;
  wrapperClassName?: string;
  fallbackClassName?: string;
}

export const useServerImages = ({
  ids,
  fallbacks = [],
  size,
  className,
  wrapperClassName,
  fallbackClassName,
}: UseServerImagesProps) => {
  const api = useApi();
  const accessToken = useAuthPersistStore((s) => s.accessToken);

  const getUploadSource = React.useCallback(
    (id?: number): ImageSource | undefined => {
      if (!id || !accessToken) return undefined;

      return api.upload.getUploadById(id) as unknown as ImageSource;
    },
    [accessToken, api.upload],
  );

  const idsString = JSON.stringify(ids);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedIds = React.useMemo(() => ids, [idsString]);

  const uploads = React.useMemo(() => {
    return memoizedIds.map((id) => {
      return getUploadSource(id);
    });
  }, [memoizedIds, getUploadSource]);

  const jsxArray = React.useMemo(() => {
    return memoizedIds.map((id, index) => {
      const fallback = fallbacks[index];
      const upload = uploads[index];

      if (!id) {
        return (
          <View
            key={index}
            className={cn("overflow-hidden rounded-full", wrapperClassName)}
            style={{
              width: size?.width ?? "100%",
              height: size?.height ?? "100%",
            }}
          >
            {typeof fallback === "string" ? (
              <Avatar className={cn("h-full w-full", className)}>
                <AvatarFallback className={fallbackClassName}>
                  <Text>{fallback}</Text>
                </AvatarFallback>
              </Avatar>
            ) : (
              fallback
            )}
          </View>
        );
      }

      if (!upload) {
        return (
          <View
            key={index}
            className={cn("overflow-hidden rounded-full", wrapperClassName)}
            style={{
              width: size?.width ?? "100%",
              height: size?.height ?? "100%",
            }}
          >
            <Skeleton
              className={cn("h-full w-full rounded-full", className)}
              style={{ width: size?.width, height: size?.height }}
            />
          </View>
        );
      }

      return (
        <View
          key={index}
          className={cn("overflow-hidden rounded-full", wrapperClassName)}
          style={{
            width: size?.width ?? "100%",
            height: size?.height ?? "100%",
          }}
        >
          <Image
            source={upload}
            className={className}
            style={{ width: size?.width, height: size?.height }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>
      );
    });
  }, [
    memoizedIds,
    fallbacks,
    uploads,
    size,
    className,
    wrapperClassName,
    fallbackClassName,
  ]);

  return { jsxArray, uploads };
};
