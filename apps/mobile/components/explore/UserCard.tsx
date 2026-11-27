import React from "react";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import {
  hslToHex,
  useColorPalette,
  useScreenOrientation,
} from "@softsurgery/mobile-hooks";
import { cn } from "@softsurgery/lib";
import {
  ResponseConversationDto,
  resolveRefLabel,
  ResponseRefParamDto,
  ResponseUserDto,
} from "api-client";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  MessageCircle,
  Bookmark,
  Briefcase,
  Quote,
  Goal,
} from "lucide-react-native";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Icon, Text } from "@softsurgery/mobile-ui";
import { useStartConversation } from "api-client/hooks/chat";
import { useBookmarkActions } from "api-client/hooks/content/users/useBookmarkActions";
import { useRNServerImages } from "@softsurgery/mobile-hooks";
import { useAppConfig } from "@softsurgery/contexts";
import { IconMoodPlus } from "@tabler/icons-react-native";
import Animated, {
  cancelAnimation,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { ScrollView } from "react-native-gesture-handler";
import { ImageBackground } from "expo-image";
import { useTranslation } from "react-i18next";

const USER_CARD_IMAGE_SIZE = { width: 1080, height: 1080, quality: 90 };

interface UserCardProps {
  className?: string;
  user: ResponseUserDto;
  objectives: ResponseRefParamDto[];
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  cardWidth?: number;
  cardHeight?: number;
  isActive?: boolean;
  // industries: ResponseRefParamDto[];
}

export const UserCard = React.memo(function UserCard({
  user,
  objectives,
  onScroll,
  cardWidth: cardWidthProp,
  cardHeight: cardHeightProp,
  isActive = true,
  // industries,
  className,
}: UserCardProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { isLandscape } = useScreenOrientation();

  const resolvedWidth = cardWidthProp ?? screenWidth;
  const resolvedHeight = cardHeightProp ?? screenHeight;

  const heroHeight = Math.round(resolvedHeight * 0.5);

  const { t, i18n } = useTranslation("explore");
  const { palette } = useColorPalette();
  const primary = hslToHex(palette?.primary);
  const primaryDark = hslToHex(palette?.primary, 0.8);

  const router = useRouter();
  const { isBookmarked, toggleBookmark } = useBookmarkActions({
    bookmarkId: user.id,
  });

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);
  const { imageCachePolicy } = useAppConfig();
  const imageIds = React.useMemo(() => [user?.pictureId], [user?.pictureId]);
  const imageFallbacks = React.useMemo(() => [fallback], [fallback]);

  const { uploads: uploadedProfilePicture } = useRNServerImages({
    ids: imageIds,
    fallbacks: imageFallbacks,
    imageOptions: USER_CARD_IMAGE_SIZE,
  });

  const photoSource = uploadedProfilePicture[0];

  const { startConversation, isStartingConversation } = useStartConversation({
    onSuccess: (conversation: ResponseConversationDto) => {
      router.push({
        pathname: "/main/chat/conversation",
        params: { id: conversation.id },
      });
    },
  });

  const openProfile = () =>
    router.push({
      pathname: "/main/profile/inspect-profile",
      params: { id: user?.id },
    });

  // Reanimated button states
  const bookmarkScale = useSharedValue(1);
  const requestScale = useSharedValue(1);
  const messageScale = useSharedValue(1);

  const bookmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  const requestStyle = useAnimatedStyle(() => ({
    transform: [{ scale: requestScale.value }],
  }));

  const messageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: messageScale.value }],
  }));

  // Pulsing animation for the main action button (only active on focused active card)
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(isActive ? 0.4 : 0);

  React.useEffect(() => {
    if (!isActive) {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      pulseScale.value = 1;
      pulseOpacity.value = 0;
      return;
    }

    pulseScale.value = 1;
    pulseOpacity.value = 0.4;
    pulseScale.value = withRepeat(
      withTiming(1.35, { duration: 1600 }),
      -1,
      false,
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 1600 }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
    };
  }, [isActive, pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const actionButtons = (
    <View
      className={cn(
        "flex-row items-center gap-4",
        isLandscape ? "justify-start" : "justify-center",
      )}
      style={!isLandscape ? { marginTop: -28 } : undefined}
    >
      {/* Bookmark */}
      <Animated.View style={bookmarkStyle}>
        <Pressable
          onPressIn={() => {
            bookmarkScale.value = withSpring(0.85, {
              damping: 12,
              stiffness: 250,
            });
          }}
          onPressOut={() => {
            bookmarkScale.value = withSpring(1, {
              damping: 12,
              stiffness: 250,
            });
          }}
          onPress={toggleBookmark}
          style={isLandscape ? { width: 40, height: 40 } : undefined}
          className={cn(
            "h-11 w-11 items-center justify-center rounded-full border shadow-lg shadow-black/20",
            isBookmarked
              ? "border-primary/40 bg-primary active:bg-primary/60"
              : "border-border/70 bg-card/70 active:bg-card/40",
          )}
        >
          <Icon
            as={Bookmark}
            size={isLandscape ? 18 : 20}
            color={isBookmarked ? "#ffffff" : primary}
            fill={isBookmarked ? "#ffffff" : "transparent"}
          />
        </Pressable>
      </Animated.View>

      {/* Send request — the headline action with pulsing aura */}
      <View className="relative items-center justify-center">
        <Animated.View
          style={[
            pulseStyle,
            {
              position: "absolute",
              width: isLandscape ? 52 : 64,
              height: isLandscape ? 52 : 64,
              borderRadius: isLandscape ? 26 : 32,
              backgroundColor: primary,
            },
          ]}
        />
        <Animated.View style={requestStyle}>
          <Pressable
            onPressIn={() => {
              requestScale.value = withSpring(0.85, {
                damping: 12,
                stiffness: 250,
              });
            }}
            onPressOut={() => {
              requestScale.value = withSpring(1, {
                damping: 12,
                stiffness: 250,
              });
            }}
            onPress={() =>
              router.push({
                pathname: "/main/request/new-request",
                params: { id: user?.id },
              })
            }
            style={isLandscape ? { width: 52, height: 52 } : undefined}
            className="rounded-full bg-primary active:bg-primary/70 border border-primary-foreground/30 w-16 h-16 flex items-center justify-center shadow-xl shadow-primary/30"
          >
            <Icon
              as={IconMoodPlus}
              strokeWidth={1.5}
              size={isLandscape ? 24 : 30}
              color={"white"}
            />
          </Pressable>
        </Animated.View>
      </View>

      {/* Message */}
      <Animated.View style={messageStyle}>
        <Pressable
          disabled={isStartingConversation}
          onPressIn={() => {
            messageScale.value = withSpring(0.85, {
              damping: 12,
              stiffness: 250,
            });
          }}
          onPressOut={() => {
            messageScale.value = withSpring(1, {
              damping: 12,
              stiffness: 250,
            });
          }}
          onPress={() => {
            if (!isStartingConversation) {
              startConversation({ users: [user.id] });
            }
          }}
          style={isLandscape ? { width: 40, height: 40 } : undefined}
          className="h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-card/70 active:bg-card/40 shadow-lg shadow-black/20"
        >
          <Icon
            as={MessageCircle}
            size={isLandscape ? 18 : 20}
            color={primary}
          />
        </Pressable>
      </Animated.View>
    </View>
  );

  const heroOverlay = (
    <View
      className="flex-1 justify-end px-5"
      style={{ paddingBottom: isLandscape ? 16 : 30 }}
      pointerEvents="box-none"
    >
      <Pressable onPress={openProfile} className="gap-1">
        <Text
          className="text-3xl font-extrabold text-primary-foreground tracking-tight"
          style={isLandscape ? { fontSize: 20, lineHeight: 28 } : undefined}
          numberOfLines={1}
        >
          {identity}
        </Text>
        <Text className="text-sm font-semibold text-primary-foreground tracking-wide">
          @{user.username}
        </Text>
      </Pressable>
      {isLandscape ? <View className="mt-3">{actionButtons}</View> : null}
    </View>
  );

  const heroContent = photoSource ? (
    <ImageBackground
      source={photoSource}
      style={{ flex: 1 }}
      contentFit="cover"
      cachePolicy={imageCachePolicy}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "transparent"]}
        style={[styles.scrim, { height: isLandscape ? 90 : 120 }]}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
        style={StyleSheet.absoluteFill}
      />
      {heroOverlay}
    </ImageBackground>
  ) : (
    <LinearGradient
      colors={[primary, primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Elegant glassmorphic default user layout */}
      <View
        style={StyleSheet.absoluteFill}
        className="items-center justify-center"
      >
        {/* Floating decorative glass elements for background depth */}
        <View className="absolute top-10 left-10 w-24 h-24 rounded-full text-primary-foreground/5 border border-primary-foreground/10" />
        <View className="absolute bottom-16 right-12 w-32 h-32 rounded-full bg-primary-foreground/5 border border-primary-foreground/10" />

        {/* Main Avatar Badge */}
        <View
          className="w-28 h-28 rounded-full items-center justify-center bg-primary-foreground/10 border border-primary-foreground/20 shadow-2xl"
          style={isLandscape ? { width: 80, height: 80 } : undefined}
        >
          <Text
            className="text-4xl font-extrabold text-primary-foreground tracking-widest uppercase"
            style={isLandscape ? { fontSize: 22, lineHeight: 28 } : undefined}
          >
            {fallback}
          </Text>
        </View>
      </View>
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.35)"]}
        style={StyleSheet.absoluteFill}
      />
      {heroOverlay}
    </LinearGradient>
  );

  const industryItems = React.useMemo(
    () =>
      (user.industries ?? []).map((ind) => ({
        key: String(ind.id),
        label: resolveRefLabel(ind.label, ind.extras, i18n.language),
      })),
    [user.industries, i18n.language],
  );

  const objectiveItems = React.useMemo(
    () =>
      (user?.activeSession?.payload?.objectives ?? []).flatMap((id) => {
        const objective = objectives.find(
          (obj) => String(obj.id) === String(id),
        );
        return objective
          ? [{ key: String(objective.id), label: objective.label }]
          : [];
      }),
    [user?.activeSession?.payload?.objectives, objectives],
  );

  const renderTagSection = (
    icon: typeof Briefcase,
    title: string,
    items: { key: string; label: string }[],
  ) => {
    if (items.length === 0) return null;
    return (
      <View>
        <View className="mb-2.5 flex-row items-center gap-2">
          <Icon as={icon} size={15} color={primary} />
          <Text className="text-sm font-extrabold text-foreground tracking-wider">
            {title}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {items.map((item) => (
            <View
              key={item.key}
              className="rounded-full border border-border px-3 py-1 flex-row items-center gap-1.5"
            >
              <Text className="text-sm font-semibold text-foreground">
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const detailsSections = (
    <View className={cn("flex flex-col gap-8", isLandscape ? "mb-4" : "mb-8")}>
      {/* Bio */}
      <View>
        <View className="mb-2.5 flex-row items-center gap-2">
          <Icon as={Quote} size={15} color={primary} />
          <Text className="text-sm font-extrabold text-foreground tracking-wider">
            {t("explore.about")}
          </Text>
        </View>
        <Text
          className={cn("text-sm leading-6", !user.bio && "text-foreground/80")}
        >
          {user.bio?.trim() || t("explore.noBioAvailable")}
        </Text>
      </View>
      {renderTagSection(Briefcase, t("explore.industries"), industryItems)}
      {renderTagSection(Goal, t("explore.objectives"), objectiveItems)}
    </View>
  );

  const leftWidth = Math.round(resolvedWidth * 0.44);

  return (
    <View
      className={cn("bg-background/30", className)}
      style={{
        width: resolvedWidth,
        height: resolvedHeight,
        flexDirection: isLandscape ? "row" : "column",
      }}
    >
      {isLandscape ? (
        <View style={{ width: leftWidth, height: resolvedHeight }}>
          {heroContent}
        </View>
      ) : null}

      <ScrollView
        className="flex-1 bg-transparent"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={
          isLandscape
            ? {
                paddingTop: 52,
                paddingBottom: 48,
                paddingHorizontal: 20,
              }
            : undefined
        }
      >
        {!isLandscape ? (
          <View style={{ height: heroHeight, width: "100%" }}>
            {heroContent}
          </View>
        ) : null}

        <View
          className="flex-1 bg-transparent"
          style={
            !isLandscape
              ? {
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                }
              : undefined
          }
        >
          {!isLandscape ? actionButtons : null}

          <View
            style={
              isLandscape
                ? { marginTop: 20 }
                : { paddingHorizontal: 20, marginTop: 16 }
            }
          >
            {detailsSections}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
