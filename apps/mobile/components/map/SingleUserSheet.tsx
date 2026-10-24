import React, { forwardRef } from "react";
import { Pressable, View } from "react-native";
import { type ActionSheetRef } from "react-native-actions-sheet";
import { useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { MapPin, MessageCircle, Send, UserRound } from "lucide-react-native";
import { ThreeDotsActionSheet } from "@softsurgery/mobile-components";
import { Text } from "@softsurgery/mobile-ui";
import { NearbyUser } from "@/types";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useServerImages } from "@/hooks/content/useServerImages";
import { useStartConversation } from "@/hooks/content/chat/useStartConversation";

interface SingleUserSheetProps {
  user: NearbyUser | null;
  onShowOnMap: (latitude: number, longitude: number) => void;
  onClose?: () => void;
}

export const SingleUserSheet = forwardRef<ActionSheetRef, SingleUserSheetProps>(
  ({ user, onShowOnMap, onClose }, ref) => {
    const router = useRouter();
    const targetUserId = user?.user?.id ?? user?.userId;

    const identification = React.useMemo(
      () => identifyUser(user?.user),
      [user?.user],
    );

    const fallback = React.useMemo(
      () => identifyUserAvatar(user?.user),
      [user?.user],
    );

    const { jsxArray: profilePictures } = useServerImages({
      ids: [user?.user?.pictureId],
      fallbacks: [fallback],
      className: "rounded-full",
      size: { width: 50, height: 50 },
    });

    const { startConversation, isStartingConversation } = useStartConversation({
      onSuccess: (conversation) => {
        router.push({
          pathname: "/main/chat/conversation",
          params: { id: conversation.id },
        });
      },
    });

    const subtitle = React.useMemo(() => {
      if (!user) return "";
      const parts: string[] = [];
      if (user.user?.industries?.length) {
        parts.push(
          user.user.industries
            .map((i) => i?.label)
            .filter(Boolean)
            .join(" · "),
        );
      } else if (user.user?.bio?.trim()) {
        parts.push(user.user.bio.trim());
      }
      return parts.join(" • ");
    }, [user]);

    const handleInspectProfile = React.useCallback(() => {
      if (!targetUserId) return;
      router.push({
        pathname: "/main/profile/inspect-profile",
        params: { id: targetUserId },
      });
    }, [router, targetUserId]);

    const handleSendMessage = React.useCallback(() => {
      if (!targetUserId) return;
      startConversation({ users: [targetUserId] });
    }, [startConversation, targetUserId]);

    const handleSendRequest = React.useCallback(() => {
      if (!targetUserId) return;
      router.push({
        pathname: "/main/request/new-request",
        params: { id: targetUserId },
      });
    }, [router, targetUserId]);

    const handleShow = React.useCallback(() => {
      if (user?.latitude != null && user?.longitude != null) {
        onShowOnMap(user.latitude, user.longitude);
      }
    }, [onShowOnMap, user?.latitude, user?.longitude]);

    const options = React.useMemo(
      () => [
        {
          label: "Send Request",
          icon: Send,
          onPress: handleSendRequest,
        },
        {
          label: isStartingConversation ? "Opening..." : "Send Message",
          icon: MessageCircle,
          disabled: isStartingConversation,
          onPress: handleSendMessage,
        },
        {
          label: "Show on Map",
          icon: MapPin,
          onPress: handleShow,
        },
        {
          label: "View Profile",
          icon: UserRound,
          onPress: handleInspectProfile,
        },
      ],
      [
        handleSendRequest,
        handleSendMessage,
        isStartingConversation,
        handleShow,
        handleInspectProfile,
      ],
    );

    return (
      <ThreeDotsActionSheet
        ref={ref}
        renderTrigger={false}
        onClose={onClose}
        options={options}
        customContent={
          user ? (
            <Pressable
              className="px-6 pt-2 pb-2 active:opacity-70"
              onPress={handleInspectProfile}
            >
              <View className="flex-row items-center gap-3.5">
                <View className="relative">
                  <View className="overflow-hidden rounded-full bg-muted">
                    {profilePictures[0]}
                  </View>
                  {user.isOnline && (
                    <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card" />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    variant="large"
                    className="text-foreground font-semibold"
                  >
                    {identification}
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-0.5">
                    {user.isOnline ? (
                      <Text className="text-xs font-semibold text-emerald-600">
                        Online
                      </Text>
                    ) : (
                      <Text className="text-xs text-muted-foreground">
                        {user.updatedAt
                          ? `Last active ${formatDistanceToNow(
                              new Date(user.updatedAt),
                              { addSuffix: true },
                            )}`
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
                      className="mt-0.5 text-xs text-muted-foreground"
                    >
                      {subtitle}
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          ) : null
        }
      />
    );
  },
);

SingleUserSheet.displayName = "SingleUserSheet";
