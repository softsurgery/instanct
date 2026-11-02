import React from "react";
import { cn } from "@softsurgery/lib";
import { TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Text } from "@softsurgery/mobile-ui";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useScreenOrientation } from "@softsurgery/mobile-hooks";

interface SessionStarterProps {
  className?: string;
}

export const SessionStarter = ({ className }: SessionStarterProps) => {
  const { t } = useTranslation("explore");
  const { height: screenHeight } = useWindowDimensions();
  const { isLandscape } = useScreenOrientation();
  const lottieSize = isLandscape
    ? Math.min(175, Math.round(screenHeight * 0.52))
    : 300;
  const height = useSharedValue(1);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    height.value = withTiming(1, { duration: 300 });
    opacity.value = withTiming(1, { duration: 300 });
  }, [height, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height: lottieSize,
    overflow: "hidden",
  }));

  return (
    <View
      className={cn(
        "flex-1 items-center justify-center gap-6 px-6",
        isLandscape ? "flex-row pt-8" : "flex-col",
        className,
      )}
    >
      <TouchableOpacity
        onPress={() => router.push("/main/explore/session-starter")}
        activeOpacity={0.8}
      >
        <Animated.View style={animatedStyle}>
          <LottieView
            autoPlay
            loop
            style={{
              width: lottieSize,
              height: lottieSize,
            }}
            source={require("~/assets/lotties/power-on.json")}
          />
        </Animated.View>
      </TouchableOpacity>
      <View
        className={cn(
          isLandscape
            ? "flex-1 max-w-md gap-2 items-start"
            : "items-center gap-4",
        )}
      >
        <Text
          variant={"h1"}
          className={cn(isLandscape ? "text-left text-2xl" : "text-center")}
        >
          {t("session.starter.title")}
        </Text>
        <Text
          className={cn(
            "text-base",
            isLandscape ? "text-left" : "text-center px-2",
          )}
        >
          {t("session.starter.description")}
        </Text>
      </View>
    </View>
  );
};
