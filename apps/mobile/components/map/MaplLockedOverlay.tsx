import React from "react";
import { cn } from "@softsurgery/lib";
import {
  hslToHex,
  useColorPalette,
  useScreenOrientation,
} from "@softsurgery/mobile-hooks";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Map } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { RadarRing } from "@softsurgery/mobile-components";
import { Icon } from "@softsurgery/mobile-ui";

interface MapLockedOverlayProps {
  className?: string;
  onStartSession?: () => void;
  blurRadius?: number;
  isActive?: boolean;
}

/** Staggered fade + rise on mount. */
const useReveal = (delay: number) => {
  const v = useSharedValue(0);
  React.useEffect(() => {
    v.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay, v]);
  return useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: (1 - v.value) * 14 }],
  }));
};

export const MapLockedOverlay = ({
  className,
  blurRadius = 5,
  isActive = true,
}: MapLockedOverlayProps) => {
  const { isLandscape } = useScreenOrientation();
  const { t } = useTranslation("common");
  const { palette, colorScheme } = useColorPalette();

  const bg = hslToHex(palette.background);
  const primary = hslToHex(palette.primary);

  // staggered entrance
  const iconReveal = useReveal(0);
  const textReveal = useReveal(140);

  return (
    <View className={cn("flex-1 overflow-hidden bg-muted", className)}>
      <Image
        source={require("@/assets/images/map-lock.jpg")}
        resizeMode="cover"
        blurRadius={blurRadius}
        style={StyleSheet.absoluteFill}
      />
      {/* Frost + scrim + bottom atmosphere */}
      <BlurView
        intensity={colorScheme === "dark" ? 24 : 36}
        tint={colorScheme === "dark" ? "dark" : "light"}
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />
      <View className="absolute inset-0 bg-background/25" />
      <LinearGradient
        colors={[`${bg}00`, `${bg}99`]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Content */}
      <View
        className={cn(
          "flex-1 items-center justify-center px-8",
          isLandscape ? "pt-10" : "",
        )}
      >
        <View
          className={cn(
            "w-full items-center",
            isLandscape
              ? "max-w-xl flex-row justify-center gap-8"
              : "max-w-sm flex-col",
          )}
        >
          {/* Radar + lock */}
          <Animated.View
            style={iconReveal}
            className={cn(
              "items-center justify-center",
              isLandscape ? "h-24 w-24" : "mb-8 h-32 w-32",
            )}
          >
            <RadarRing delay={0} color={primary} isActive={isActive} />
            <RadarRing delay={950} color={primary} isActive={isActive} />
            <RadarRing delay={1900} color={primary} isActive={isActive} />

            <View className="h-16 w-16 items-center justify-center">
              <Icon as={Map} size={isLandscape ? 28 : 32} />
            </View>
          </Animated.View>

          {/* Copy */}
          <Animated.View
            style={textReveal}
            className={cn(isLandscape ? "flex-1 items-start" : "items-center")}
          >
            <Text
              className={cn(
                "text-2xl font-bold tracking-tight text-foreground",
                isLandscape ? "text-left" : "text-center",
              )}
            >
              {t("screens.map.locked.title")}
            </Text>
            <Text
              className={cn(
                "mt-2.5 text-sm leading-5 text-muted-foreground",
                isLandscape ? "text-left" : "text-center",
              )}
            >
              {t("screens.map.locked.description")}
            </Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};
