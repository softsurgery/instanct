import { useRNServerImages } from "@softsurgery/mobile-hooks";
import { identifyUserAvatar } from "@/lib/user";
import { cn } from "@softsurgery/lib";
import { useMapStore } from "@/stores/useMapStore";
import React from "react";
import { Pressable } from "react-native";

interface UserCarouselEntryProps {
  className?: string;
  userId: string;
  onPress?: (user: any) => void;
}

const CAROUSEL_AVATAR_SIZE = { width: 50, height: 50 };

export const UserCarouselEntry = React.memo(function UserCarouselEntry({
  className,
  userId,
  onPress,
}: UserCarouselEntryProps) {
  const user = useMapStore(
    React.useCallback((s) => s.usersById[userId] ?? null, [userId]),
  );
  const nearbyUser = useMapStore(
    React.useCallback((s) => s.nearbyUsersById[userId] ?? null, [userId]),
  );
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);
  const imageIds = React.useMemo(() => [user?.pictureId], [user?.pictureId]);
  const imageFallbacks = React.useMemo(() => [fallback], [fallback]);
  const { jsxArray: profilePictures } = useRNServerImages({
    ids: imageIds,
    fallbacks: imageFallbacks,
    className: "rounded-full",
    wrapperClassName: "rounded-full overflow-hidden",
    size: CAROUSEL_AVATAR_SIZE,
  });

  return (
    <Pressable
      className={cn(className)}
      onPress={() => onPress?.({ ...nearbyUser, userId, user })}
    >
      {profilePictures[0]}
    </Pressable>
  );
});
