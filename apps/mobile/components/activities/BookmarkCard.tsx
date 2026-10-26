import React from "react";
import { View, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { type ActionSheetRef } from "react-native-actions-sheet";
import { Icon, Text } from "@softsurgery/mobile-ui";
import { ResponseUserDto } from "api-client";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useServerImages } from "@/hooks/content/useServerImages";
import { useBookmarkActions } from "@/hooks/content/users/useBookmarkActions";
import { useRouter } from "expo-router";
import {
  Bookmark,
  BookmarkX,
  ChevronRight,
  SendIcon,
  UserRound,
} from "lucide-react-native";
import {
  ThreeDotsActionSheet,
  useColorPalette,
} from "@softsurgery/mobile-components";
import { useTranslation } from "react-i18next";

interface BookmarkCardProps {
  className?: string;
  user?: ResponseUserDto;
  onRemoved?: (user?: ResponseUserDto) => void;
}

export const BookmarkCard = ({
  className,
  user,
  onRemoved,
}: BookmarkCardProps) => {
  const { t } = useTranslation("activities");
  const { palette } = useColorPalette();
  const ids = [user?.pictureId];
  const fallbacks = [identifyUserAvatar(user)];
  const router = useRouter();
  const sheetRef = React.useRef<ActionSheetRef>(null);

  const { jsxArray: bookmarkImages } = useServerImages({
    ids,
    fallbacks,
    className: "w-14 h-14 rounded-full",
    size: { width: 50, height: 50 },
  });

  const { deleteBookmark } = useBookmarkActions({
    bookmarkId: user?.id ?? "",
    enabled: false,
    onDeleteBookmarkSuccess: () => onRemoved?.(user),
  });

  const subtitle = user?.industries?.length
    ? user.industries
        .map((industry) => industry?.label)
        .filter(Boolean)
        .join(" · ")
    : user?.bio?.trim() || user?.email;

  const openProfile = React.useCallback(() => {
    router.push({
      pathname: "/main/profile/inspect-profile",
      params: { id: user?.id },
    });
  }, [router, user?.id]);

  const handleLongPress = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    sheetRef.current?.show();
  }, []);

  const options = React.useMemo(
    () => [
      {
        label: t("activities.bookmarks.actions.viewProfile"),
        icon: UserRound,
        onPress: openProfile,
      },
      {
        label: t("activities.bookmarks.actions.sendMessage"),
        icon: SendIcon,
        onPress: () => {
          if (user?.id) {
            router.push({
              pathname: "/main/chat",
              params: { userId: user.id },
            });
          }
        },
      },
      {
        label: t("activities.bookmarks.actions.removeBookmark"),
        icon: BookmarkX,
        destructive: true,
        onPress: () => {
          if (user?.id) deleteBookmark();
        },
      },
    ],
    [openProfile, deleteBookmark, user?.id, router, t],
  );

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        className={className}
        onPress={openProfile}
        onLongPress={handleLongPress}
        delayLongPress={220}
      >
        <View className="flex-row items-center gap-3.5 p-3">
          {/* Avatar with brand ring + saved marker */}
          <View className="relative">
            <View
              className="rounded-full p-[3px]"
              style={{ backgroundColor: `${palette.primary}1f` }}
            >
              <View className="rounded-full bg-muted">{bookmarkImages[0]}</View>
            </View>
            <View
              className="absolute -bottom-0.5 -right-0.5 h-6 w-6 items-center justify-center rounded-full border-2 border-card"
              style={{ backgroundColor: palette.primary }}
            >
              <Icon as={Bookmark} size={12} color="#ffffff" fill="#ffffff" />
            </View>
          </View>

          {/* Identity */}
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-[16px] font-semibold text-foreground"
            >
              {identifyUser(user)}
            </Text>
            {!!subtitle && (
              <Text
                numberOfLines={1}
                className="mt-0.5 text-[13px] text-muted-foreground"
              >
                {subtitle}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => sheetRef.current?.show()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon as={ChevronRight} size={20} color={palette.foreground} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <ThreeDotsActionSheet
        ref={sheetRef}
        renderTrigger={false}
        customContent={
          <View className="px-6 pt-2 pb-2">
            <View className="flex-row items-center gap-3">
              {!!bookmarkImages[0] && (
                <View className="overflow-hidden rounded-full bg-muted">
                  {bookmarkImages[0]}
                </View>
              )}
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  variant="large"
                  className="text-foreground"
                >
                  {identifyUser(user)}
                </Text>
                {!!subtitle && (
                  <Text
                    numberOfLines={1}
                    className="mt-0.5 text-sm text-muted-foreground"
                  >
                    {subtitle}
                  </Text>
                )}
              </View>
            </View>
          </View>
        }
        options={options}
      />
    </>
  );
};
