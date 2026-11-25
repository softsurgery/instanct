import { useIdentifiedUser } from "api-client/hooks";
import { usePulseAnimation } from "@softsurgery/mobile-hooks";
import { identifyUserAvatar } from "@/lib/user";
import { cn } from "@softsurgery/lib";
import { useMapStore } from "@/stores/useMapStore";
import React from "react";
import { Animated, Platform, View } from "react-native";
import { Text } from "@softsurgery/mobile-ui";
import { useRNServerImages } from "@softsurgery/mobile-hooks";

const MARKER_AVATAR_SIZE = { width: 40, height: 40 };

interface UserMarkerProps {
  className?: string;
  userId: string;
  isOnline?: boolean;
  isCurrentUser?: boolean;
  animatePulse?: boolean;
}

export const UserMarker = React.memo(function UserMarker({
  className,
  userId,
  isOnline,
  isCurrentUser = false,
  animatePulse = true,
}: UserMarkerProps) {
  const { width, height } = MARKER_AVATAR_SIZE;
  const activeBackgroundColor = "rgba(34,197,94,0.8)";
  const isAndroid = Platform.OS === "android";

  const showUsernames = useMapStore((s) => s.settings.showUsernames);
  const { user } = useIdentifiedUser({ id: userId });

  React.useEffect(() => {
    if (user) useMapStore.getState().addUser(user);
  }, [user]);

  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);
  const imageIds = React.useMemo(() => [user?.pictureId], [user?.pictureId]);
  const imageFallbacks = React.useMemo(() => [fallback], [fallback]);

  const { jsxArray: profilePictures } = useRNServerImages({
    ids: imageIds,
    fallbacks: imageFallbacks,
    className: "rounded-full",
    wrapperClassName: "bg-foreground/25",
    fallbackClassName: "text-xs",
    size: MARKER_AVATAR_SIZE,
  });

  // Pulse animation (iOS only — Android renders markers as static ViewShot bitmaps)
  const { scale, opacity } = usePulseAnimation({
    active: Boolean(isOnline) && !isAndroid && animatePulse,
  });

  const onlinePulseBlock = React.useMemo(() => {
    return (
      <Animated.View
        style={{
          width,
          height,
          borderRadius: width / 2,
          position: "absolute",
          backgroundColor: activeBackgroundColor,
          transform: [{ scale }],
          opacity,
        }}
      />
    );
  }, []);

  return (
    <View
      className={cn("flex flex-col items-center justify-center", className)}
      pointerEvents="none"
    >
      <View>
        {/* Online pulsing highlight (iOS only; Android uses AnimatedMarker in MapRenderer) */}
        {isOnline && !isAndroid && animatePulse ? onlinePulseBlock : null}
        {/* Avatar */}
        <View
          style={{
            width,
            height,
            borderRadius: width / 2,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {profilePictures[0]}
        </View>
      </View>

      {/* Username */}
      {showUsernames && (
        <Text className="mt-1 text-xs font-extrabold bg-background/50 p-1 rounded-lg text-center">
          {!isCurrentUser ? user?.username : "You"}
        </Text>
      )}
    </View>
  );
});
