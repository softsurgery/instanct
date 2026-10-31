import { Icon } from "@softsurgery/mobile-ui";
import { VibratingTabButton } from "@softsurgery/mobile-components";
import { IconChecklist } from "@tabler/icons-react-native";
import { Tabs, useSegments } from "expo-router";
import { Map, Telescope, User } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useColorPalette,
  useRTL,
  useScreenOrientation,
} from "@softsurgery/mobile-hooks";

export default function TabLayout() {
  const { palette } = useColorPalette();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const isMapScreen = currentRoute === "map";

  const { isLandscape } = useScreenOrientation();
  const insets = useSafeAreaInsets();
  const iosBottomInset = Platform.OS === "ios" ? insets.bottom : 0;

  const isRTL = useRTL();
  const { t } = useTranslation("screens");

  const tabsConfig = React.useMemo(
    () => [
      {
        name: "index",
        title: "explore",
        label: t("explore"),
        icon: Telescope,
      },
      {
        name: "activities",
        title: "activities",
        label: t("activities"),
        icon: IconChecklist,
      },
      {
        name: "map",
        title: "map",
        label: t("map"),
        icon: Map,
      },
      {
        name: "menu",
        title: "menu",
        label: t("menu"),
        icon: User,
      },
    ],
    [t],
  );

  const orderedTabs = isRTL ? [...tabsConfig].reverse() : tabsConfig;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          flex: 1,
          backgroundColor: "transparent",
        },
        tabBarShowLabel: true,
        tabBarLabelPosition: isLandscape ? "beside-icon" : "below-icon",
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.foreground,
        tabBarStyle: {
          borderTopEndRadius: !isMapScreen ? (isLandscape ? 16 : 28) : 0,
          borderTopStartRadius: !isMapScreen ? (isLandscape ? 16 : 28) : 0,
          paddingTop: isLandscape ? 2 : 8,
          paddingBottom: isLandscape
            ? Math.min(iosBottomInset, 10)
            : Math.min(iosBottomInset, 16),
          paddingLeft: Math.max(insets.left, 12),
          paddingRight: Math.max(insets.right, 12),
          backgroundColor: palette.card,
          borderColor: palette.border,
          borderTopWidth: 0,
          height: isLandscape
            ? 44 + Math.min(iosBottomInset, 12)
            : 66 + Math.min(iosBottomInset, 20),
        },
        tabBarLabelStyle: {
          fontSize: isLandscape ? 11 : 11,
          fontWeight: "700",
          marginLeft: isLandscape ? 6 : 0,
          marginTop: 0,
        },
      }}
    >
      {orderedTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarLabel: tab.label,
            tabBarButton: (props) => (
              <VibratingTabButton {...props} isLandscape={isLandscape} />
            ),
            tabBarIcon: ({ color, focused }) => (
              <Icon
                as={tab.icon}
                size={isLandscape ? (focused ? 20 : 18) : focused ? 26 : 23}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
