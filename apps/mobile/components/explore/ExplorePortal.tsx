import React from "react";
import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@softsurgery/lib";
import { ResponseUserDto } from "api-client";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { router } from "expo-router";
import { ArrowDownNarrowWide, Bell, CalendarCog } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserCard } from "./UserCard";
import { Text } from "@softsurgery/mobile-ui";
import { SessionCountdown } from "../session/SessionCountdown";
import { SessionStarter } from "../session/SessionStarter";
import { useExploreFilterStore } from "@/stores/userExploreFilterStore";
import {
  ApplicationHeader,
  NotFound,
  ShuffleCardList,
  ShuffleCardRenderInfo,
  StableSafeAreaView,
  Loader,
} from "@softsurgery/mobile-components";
import { useChatContext } from "@/contexts/ChatContext";
import { useActiveMapSessionContext } from "@/contexts/ActiveMapSessionContext";
import {
  hslToHex,
  useColorPalette,
  useScreenActive,
  useScreenOrientation,
} from "@softsurgery/mobile-hooks";
import { useCurrentUser, useIndustries, useObjectives } from "api-client/hooks";
import { useLiveGeolocation } from "api-client/hooks/geolocation";

const EXPLORE_JOIN = ["user", "user.industries", "user.sessions"];

interface ExplorePortalProps {
  className?: string;
}

type Size = { width: number; height: number };

const matchesAny = (targets: number[] | undefined, values: number[]) =>
  !targets?.length || values.some((value) => targets.includes(value));

export const ExplorePortal = ({ className }: ExplorePortalProps) => {
  const isScreenActive = useScreenActive();
  const { palette } = useColorPalette();
  const { t, i18n } = useTranslation("common");
  const { t: tExplore } = useTranslation("explore");
  const { currentUser } = useCurrentUser();
  const { filters, dto } = useExploreFilterStore();
  const { count: notificationCount } = useNotificationContext();
  const { count: chatCount } = useChatContext();
  const { activeSession } = useActiveMapSessionContext();
  const { users: liveUsers } = useLiveGeolocation({
    enabled: true,
    join: EXPLORE_JOIN,
    subscribe: { users: true },
  });
  useIndustries({ locale: i18n.language });
  const { objectives } = useObjectives({ locale: i18n.language });

  const insets = useSafeAreaInsets();
  const { isLandscape } = useScreenOrientation();

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
  const activeUserId = users[activeIndex]?.id;

  const framePaddingX = cardSize ? Math.round(cardSize.width * 0.04) : 14;
  const framePaddingTop = 8;
  const framePaddingBottom = cardSize
    ? Math.max(Math.round(cardSize.height * 0.09), isLandscape ? 16 : 48)
    : 48;
  const cardBorderColor = hslToHex(palette.border, 0.8);

  const renderCard = React.useCallback(
    ({
      item,
      isActive,
      cardWidth,
      cardHeight,
    }: ShuffleCardRenderInfo<ResponseUserDto>) => (
      <UserCard
        user={item}
        objectives={objectives}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        isActive={isScreenActive && isActive}
      />
    ),
    [objectives, isScreenActive],
  );

  const showCards = !!activeSession && users.length > 0;
  const foreground = hslToHex(palette.foreground);
  const titleColor = foreground;
  const shortcutColor = foreground;

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
    if (!activeSession) {
      return <SessionStarter className="px-4" isActive={isScreenActive} />;
    }

    return (
      <View className="flex-1 items-center justify-center px-4">
        {filterCount > 0 ? (
          <NotFound message={tExplore("explore.noMatchFilters")} />
        ) : (
          <>
            <Loader isPending={isScreenActive} />
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
        <ShuffleCardList
          data={users}
          extraData={isScreenActive ? activeUserId : null}
          style={[StyleSheet.absoluteFill, { left: cardsLeft }]}
          width={cardSize.width}
          height={cardSize.height}
          activeIndex={activeIndex}
          onIndexChange={setCurrentIndex}
          paddingHorizontal={framePaddingX}
          paddingTop={framePaddingTop}
          paddingBottom={framePaddingBottom}
          borderColor={cardBorderColor}
          keyExtractor={(item) => item.id.toString()}
          renderCard={renderCard}
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
    <View className={cn("flex-1", className)}>
      <View
        style={{
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
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
                  isActive={isScreenActive}
                  styles={{ text: { color: titleColor } }}
                />
              )}
            </View>
          }
          classNames={{ wrapper: cn(activeSession && "items-start") }}
          shortcuts={shortcuts}
        />
      </View>
      <View className="flex-1" onLayout={handleLayout}>
        {showCards ? (
          renderCards()
        ) : (
          <StableSafeAreaView edges={["bottom", "left", "right"]}>
            {renderEmptyState()}
          </StableSafeAreaView>
        )}
      </View>
    </View>
  );
};
