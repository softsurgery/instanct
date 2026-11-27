import React from "react";
import { cn } from "@softsurgery/lib";
import { View, useWindowDimensions } from "react-native";
import { GlowingOrb, IconArc } from "@softsurgery/mobile-components";
import { Text } from "@softsurgery/mobile-ui";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Briefcase,
  Calendar,
  Handshake,
  MapPin,
  Users,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  useColorPalette,
  useScreenOrientation,
} from "@softsurgery/mobile-hooks";

const ARC_ICONS = [
  { key: "calendar", Icon: Calendar, angle: -112 },
  { key: "handshake", Icon: Handshake, angle: -56 },
  { key: "users", Icon: Users, angle: 0 },
  { key: "briefcase", Icon: Briefcase, angle: 56 },
  { key: "map-pin", Icon: MapPin, angle: 112 },
] as const;

const ARC_DOT_ANGLES = [-84, -28, 28, 84] as const;

interface SessionStarterProps {
  className?: string;
  isActive?: boolean;
}

export const SessionStarter = ({
  className,
  isActive = true,
}: SessionStarterProps) => {
  const { t } = useTranslation("explore");
  const { colorScheme } = useColorPalette();
  const { height: screenHeight } = useWindowDimensions();
  const { isLandscape } = useScreenOrientation();
  const isDark = colorScheme === "dark";

  const containerSize = isLandscape
    ? Math.min(220, Math.round(screenHeight * 0.62))
    : 320;
  const arcRadius = Math.round(containerSize * 0.41);
  const badgeSize = Math.round(containerSize * 0.13);
  const iconSize = Math.round(badgeSize * 0.48);
  const orbSize = Math.round(containerSize * 0.52);
  const logoSize = Math.round(orbSize * 0.56);

  const highlightColor = isDark ? "#38BDF8" : "#0284C7";
  const arcStrokeColor = isDark
    ? "rgba(125, 211, 252, 0.28)"
    : "rgba(2, 132, 199, 0.25)";
  const badgeBgColor = isDark
    ? "rgba(56, 189, 248, 0.08)"
    : "rgba(2, 132, 199, 0.08)";
  const badgeBorderColor = isDark
    ? "rgba(125, 211, 252, 0.25)"
    : "rgba(2, 132, 199, 0.28)";
  const badgeIconColor = isDark ? "#F8FAFC" : "#0F172A";

  return (
    <View
      className={cn(
        "flex-1 items-center justify-center gap-6 px-6",
        isLandscape ? "flex-row pt-8" : "flex-col",
        className,
      )}
    >
      <View
        style={{
          width: containerSize,
          height: containerSize,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconArc
          size={containerSize}
          radius={arcRadius}
          items={ARC_ICONS}
          dotAngles={ARC_DOT_ANGLES}
          badgeSize={badgeSize}
          iconSize={iconSize}
          strokeWidth={2.5}
          dotRadius={isLandscape ? 2.2 : 3}
          arcStrokeColor={arcStrokeColor}
          dotColor={highlightColor}
          badgeBgColor={badgeBgColor}
          badgeBorderColor={badgeBorderColor}
          iconColor={badgeIconColor}
        />

        <GlowingOrb
          size={orbSize}
          glowSize={containerSize}
          isActive={isActive}
          onPress={() => router.push("/main/explore/session-starter")}
        >
          <Image
            source={require("~/assets/images/logo.png")}
            tintColor="#ffffff"
            contentFit="contain"
            style={{
              width: logoSize,
              height: logoSize,
            }}
          />
        </GlowingOrb>
      </View>

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
          {t("session.starter.titlePrefix")}
          <Text
            variant={"h1"}
            className={cn(isLandscape && "text-2xl")}
            style={{ color: highlightColor }}
          >
            {t("session.starter.titleHighlight")}
          </Text>
          {t("session.starter.titleSuffix")}
        </Text>
        <Text
          className={cn(
            "text-base text-foreground/80",
            isLandscape ? "text-left" : "text-center px-2",
          )}
        >
          {t("session.starter.description")}
        </Text>
      </View>
    </View>
  );
};
