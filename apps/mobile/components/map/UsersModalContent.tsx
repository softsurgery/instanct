import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ChevronRight, X } from "lucide-react-native";
import { Icon, Text } from "@softsurgery/mobile-ui";
import { formatDistanceToNow } from "date-fns";
import { NearbyUser } from "@/types";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useServerImages } from "@/hooks/content/useServerImages";

interface ClusterUserRowProps {
  user: NearbyUser;
  onPress: () => void;
}

const ClusterUserRow = ({ user, onPress }: ClusterUserRowProps) => {
  const identification = React.useMemo(
    () => identifyUser(user.user),
    [user.user],
  );

  const fallback = React.useMemo(
    () => identifyUserAvatar(user.user),
    [user.user],
  );

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user.user?.pictureId],
    fallbacks: [fallback],
    className: "rounded-full",
    size: { width: 44, height: 44 },
  });

  const subtitle = React.useMemo(() => {
    if (user.user?.industries?.length) {
      return user.user.industries
        .map((i) => i?.label)
        .filter(Boolean)
        .join(" · ");
    }
    return user.user?.bio?.trim() || null;
  }, [user.user]);

  return (
    <Pressable
      className="flex-row items-center gap-3.5 py-3 px-1 border-b border-border/30 active:opacity-60"
      onPress={onPress}
    >
      <View className="relative">
        <View className="overflow-hidden rounded-full bg-muted">
          {profilePictures[0]}
        </View>
        {user.isOnline && (
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border border-card" />
        )}
      </View>

      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="text-base font-semibold text-foreground"
        >
          {identification}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          {user.isOnline ? (
            <Text className="text-xs text-emerald-600 font-medium">Online</Text>
          ) : (
            <Text className="text-xs text-muted-foreground">
              {user.updatedAt
                ? formatDistanceToNow(new Date(user.updatedAt), {
                    addSuffix: true,
                  })
                : "Offline"}
            </Text>
          )}
          {user.distance != null && (
            <>
              <Text className="text-xs text-muted-foreground">•</Text>
              <Text className="text-xs text-muted-foreground">
                {user.distance.toFixed(2)} km away
              </Text>
            </>
          )}
        </View>
        {!!subtitle && (
          <Text
            numberOfLines={1}
            className="text-xs text-muted-foreground mt-0.5"
          >
            {subtitle}
          </Text>
        )}
      </View>

      <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
    </Pressable>
  );
};

interface UsersModalContentProps {
  clusterUsers?: NearbyUser[] | null;
  onSelectUser: (user: NearbyUser) => void;
  onClose?: () => void;
}

export const UsersModalContent = ({
  clusterUsers,
  onSelectUser,
  onClose,
}: UsersModalContentProps) => {
  return (
    <View className="px-5 pt-2 pb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2 px-1">
        <Text className="text-lg font-bold text-foreground">
          {clusterUsers?.length ?? 0} People Nearby
        </Text>
        {onClose && (
          <Pressable
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="p-1 rounded-full active:bg-muted"
          >
            <Icon as={X} size={18} className="text-muted-foreground" />
          </Pressable>
        )}
      </View>

      {/* Cluster Users List */}
      <ScrollView
        style={{ maxHeight: 380 }}
        showsVerticalScrollIndicator={false}
      >
        {clusterUsers?.map((u) => (
          <ClusterUserRow
            key={u.userId}
            user={u}
            onPress={() => onSelectUser(u)}
          />
        ))}
      </ScrollView>
    </View>
  );
};
