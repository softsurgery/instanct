import React from "react";
import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@softsurgery/lib";
import { ResponseUserDto } from "api-client";
import { LegendList } from "@legendapp/list";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { router } from "expo-router";
import { ArrowDownNarrowWide, Bell, CalendarCog } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserCard } from "./UserCard";
import { Text } from "@softsurgery/mobile-ui";
import { SessionCountdown } from "../session/SessionCountdown";
import { SessionStarter } from "../session/SessionStarter";
import { useExploreFilterStore } from "@/stores/userExploreFilterStore";
import {
  ApplicationHeader,
  NotFound,
  StableSafeAreaView,
  Loader,
} from "@softsurgery/mobile-components";
import { useChatContext } from "@/contexts/ChatContext";
import { useActiveMapSessionContext } from "@/contexts/ActiveMapSessionContext";
import {
  hslToHex,
  useColorPalette,
  useScreenOrientation,
  useScrollableElement,
} from "@softsurgery/mobile-hooks";
import {
  useCurrentUser,
  useIndustries,
  useObjectives,
} from "api-client/hooks";
import { useLiveGeolocation } from "api-client/hooks/geolocation";

interface ExplorePortalProps {
  className?: string;
}

type Size = { width: number; height: number };

const matchesAny = (targets: number[] | undefined, values: number[]) =>
  !targets?.length || values.some((value) => targets.includes(value));

export const ExplorePortal = ({ className }: ExplorePortalProps) => {
  const { palette } = useColorPalette();
  const { t } = useTranslation("common");
  const { t: tExplore } = useTranslation("explore");
  const { currentUser } = useCurrentUser();
  const { filters, dto } = useExploreFilterStore();
  const { count: notificationCount } = useNotificationContext();
  const { count: chatCount } = useChatContext();
  const { activeSession } = useActiveMapSessionContext();
  const { users: liveUsers } = useLiveGeolocation({
    enabled: true,
    join: ["user", "user.industries", "user.sessions"],
  });
  useIndustries();
  const { objectives } = useObjectives();
  const {
    animatedHeaderStyle,
    handleScroll: handleHeaderScroll,
    onLayout: onHeaderLayout,
    reset: resetHeader,
  } = useScrollableElement({
    deltaThreshold: 10,
    duration: 250,
    checkScrollable: true,
    collapseHeight: false,
  });

  // Same top offset StableSafeAreaView applies on the other screens, so the
  // floating header lines up with them while the cards stay full-bleed.
  const insets = useSafeAreaInsets();
  const { isLandscape } = useScreenOrientation();
  const headerTop =
    !isLandscape && Platform.OS === "android"
      ? (StatusBar.currentHeight ?? 0) + insets.top * 0.2
      : insets.top;

  // The real size of the content area drives the card size and layout, so the
  // cards always match the rendered frame in both portrait and landscape.
  const [size, setSize] = React.useState<Size | null>(null);

  const handleLayout = React.useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    setSize((prev) =>
      prev &&
      Math.abs(prev.width - width) < 1 &&
      Math.abs(prev.height - height) < 1
        ? prev
        : { width, height },
    );
  }, []);

  // In landscape, keep the cards clear of a notch on the left; the cards
  // still bleed under the status bar at the top.
  const cardsLeft = isLandscape ? insets.left : 0;
  const cardSize = React.useMemo<Size | null>(
    () =>
      size
        ? { width: Math.max(size.width - cardsLeft, 1), height: size.height }
        : null,
    [size, cardsLeft],
  );

  const filterCount =
    (filters.industry?.length ?? 0) + (filters.objectives?.length ?? 0);

  const users = React.useMemo(
    () =>
      liveUsers.filter(
        (user) =>
          user.id !== currentUser?.id &&
          matchesAny(
            dto.industry,
            (user.industries ?? []).map((industry) => industry.id),
          ) &&
          matchesAny(
            dto.objectives,
            (user.sessions ?? []).flatMap(
              (session) => session.payload?.objectives ?? [],
            ),
          ),
      ),
    [liveUsers, currentUser?.id, dto],
  );

  // Live updates replace the users array often; clamp instead of resetting so
  // the pager does not jump back to the first card on every location tick.
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const activeIndex = Math.min(currentIndex, Math.max(users.length - 1, 0));

  const handleHorizontalScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement } = event.nativeEvent;
      if (layoutMeasurement.width <= 0) return;
      setCurrentIndex(
        Math.max(0, Math.round(contentOffset.x / layoutMeasurement.width)),
      );
    },
    [],
  );

  // Show the header again whenever the user swipes to another card.
  React.useEffect(() => {
    resetHeader();
  }, [activeIndex, resetHeader]);

  const renderItem = React.useCallback(
    ({ item }: { item: ResponseUserDto }) => (
      <UserCard
        user={item}
        objectives={objectives}
        onScroll={handleHeaderScroll}
        cardWidth={cardSize?.width}
        cardHeight={cardSize?.height}
      />
    ),
    [objectives, handleHeaderScroll, cardSize],
  );

  const showCards = !!activeSession && users.length > 0;
  const foreground = hslToHex(palette.foreground);
  // The title sits on the card photo; in landscape the shortcuts sit on the
  // details pane instead, so they keep the regular foreground color.
  const titleColor = showCards ? "white" : foreground;
  const shortcutColor = showCards && !isLandscape ? "white" : foreground;

  const shortcuts = React.useMemo(
    () => [
      {
        key: "end-session",
        hidden: !activeSession,
        icon: CalendarCog,
        color: shortcutColor,
        onPress: () => router.push("/main/sessions/manage"),
      },
      {
        key: "filter",
        hidden: !activeSession,
        icon: ArrowDownNarrowWide,
        color: shortcutColor,
        badgeText: filterCount > 0 ? String(filterCount) : undefined,
        onPress: () => router.push("/main/explore/users-filter"),
      },
      {
        key: "notifications",
        icon: Bell,
        color: shortcutColor,
        badgeText:
          notificationCount > 0 ? String(notificationCount) : undefined,
        onPress: () => router.push("/main/notifications"),
      },
      {
        key: "chat",
        icon: IconMessageChatbot,
        color: shortcutColor,
        badgeText: chatCount > 0 ? String(chatCount) : undefined,
        onPress: () => router.push("/main/chat"),
      },
    ],
    [activeSession, shortcutColor, filterCount, notificationCount, chatCount],
  );

  const renderEmptyState = () => {
    if (!activeSession) return <SessionStarter className="px-4" />;

    return (
      <View className="flex-1 items-center justify-center px-4">
        {filterCount > 0 ? (
          <NotFound message={tExplore("explore.noMatchFilters")} />
        ) : (
          <>
            <Loader />
            <Text variant="large" className="text-center">
              {tExplore("explore.nearbyPeopleShortly")}
            </Text>
          </>
        )}
      </View>
    );
  };

  const renderCards = () => {
    if (!cardSize) return null;

    return (
      <>
        <LegendList
          // Remount on resize so paging snaps to the current card in the new
          // orientation instead of landing between two cards.
          key={`${Math.round(cardSize.width)}x${Math.round(cardSize.height)}`}
          data={users}
          style={[StyleSheet.absoluteFill, { left: cardsLeft }]}
          horizontal
          pagingEnabled
          recycleItems
          bounces={false}
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={cardSize.width}
          initialScrollIndex={activeIndex}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          onScroll={handleHorizontalScroll}
        />
        <View
          pointerEvents="none"
          className={cn(
            "absolute left-0 right-0",
            isLandscape ? "bottom-2 items-end pr-4" : "bottom-4 items-center",
          )}
        >
          <View className="px-4 py-1.5 bg-background rounded-full border border-border">
            <Text className="text-base font-bold">
              {activeIndex + 1} / {users.length}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    // Cards bleed under the status bar (and keep the left inset in landscape);
    // the header and the empty states are kept inside the safe area.
    <View className={cn("flex-1", className)} onLayout={handleLayout}>
      {showCards ? (
        renderCards()
      ) : (
        <StableSafeAreaView>{renderEmptyState()}</StableSafeAreaView>
      )}
      <Animated.View
        onLayout={onHeaderLayout}
        style={[
          animatedHeaderStyle,
          {
            position: "absolute",
            top: headerTop,
            left: insets.left,
            right: insets.right,
            zIndex: 10,
          },
        ]}
      >
        <ApplicationHeader
          title={
            <View className="flex flex-col items-center">
              <Text variant="h1" style={{ color: titleColor }}>
                {t("screens.explore")}
              </Text>
              {activeSession && (
                <SessionCountdown
                  session={activeSession}
                  styles={{ text: { color: titleColor } }}
                />
              )}
            </View>
          }
          classNames={{ wrapper: cn(activeSession && "items-start") }}
          shortcuts={shortcuts}
        />
      </Animated.View>
    </View>
  );
};
