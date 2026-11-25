import { useNotificationContext } from "@/contexts/NotificationsContext";
import { cn } from "@softsurgery/lib";
import { useMapStore } from "@/stores/useMapStore";
import { IconMapPinCog, IconMessageChatbot } from "@tabler/icons-react-native";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { MapRenderer } from "./MapRenderer";
import { useChatContext } from "@/contexts/ChatContext";
import { useActiveMapSessionContext } from "@/contexts/ActiveMapSessionContext";
import {
  Loader,
  StableSafeAreaView,
  ApplicationHeader,
} from "@softsurgery/mobile-components";
import { MapStatus } from "./MapDebugging/MapStatus";
import { MapLockedOverlay } from "./MaplLockedOverlay";
import { MapDebugDialog } from "./MapDebugging/MapDebugDialog";
import {
  hslToHex,
  useColorPalette,
  useScreenActive,
} from "@softsurgery/mobile-hooks";

interface MapPortalProps {
  className?: string;
}

export const MapPortal = ({ className }: MapPortalProps) => {
  const isScreenActive = useScreenActive();
  const mapMode = useMapStore((s) => s.settings.mode);
  const location = useMapStore((s) => s.location);
  const { activeSession, initialized } = useActiveMapSessionContext();
  const { palette, colorScheme } = useColorPalette();

  const mapHeaderIconColors = React.useMemo(() => {
    if (colorScheme === "light" && mapMode === "sattelite") {
      return hslToHex(palette.background);
    }
    return hslToHex(palette.foreground);
  }, [palette, colorScheme, mapMode]);

  const mapHeaderTitleClassName = React.useMemo(() => {
    if (colorScheme === "light" && mapMode === "sattelite") {
      return "text-background";
    }
    return "text-foreground";
  }, [colorScheme, mapMode]);

  const { t } = useTranslation("common");
  const { count: chatCount } = useChatContext();
  const { count } = useNotificationContext();

  const handleChatPress = React.useCallback(() => {
    router.push("/main/chat");
  }, []);

  const { latitude, longitude } = location?.coords || {
    latitude: 0,
    longitude: 0,
  };

  return (
    <View className={cn("flex-1 bg-background", className)}>
      <View className="absolute inset-0 border-y border-border top-0">
        {activeSession && (!initialized || !location) ? (
          <View
            className={cn(
              "flex-1 items-center justify-center bg-background",
              className,
            )}
          >
            <Loader size="large" isPending={isScreenActive} />
          </View>
        ) : activeSession ? (
          <MapRenderer
            className="flex-1"
            latitude={latitude}
            longitude={longitude}
            isActive={isScreenActive}
          />
        ) : (
          <MapLockedOverlay className="flex-1" isActive={isScreenActive} />
        )}
      </View>

      <StableSafeAreaView className="absolute top-0 left-0 right-0 z-20 pb-2">
        <ApplicationHeader
          title={t("screens:map")}
          classNames={{
            title: mapHeaderTitleClassName,
          }}
          shortcuts={[
            {
              key: "settings",
              icon: IconMapPinCog,
              color: mapHeaderIconColors,
              onPress: () => router.push("/main/maps/map-settings"),
            },
            {
              key: "notifications",
              icon: Bell,
              color: mapHeaderIconColors,
              onPress: () => {
                router.push("/main/notifications");
              },
              badgeText: count > 0 ? `${count}` : undefined,
            },
            {
              key: "chat",
              icon: IconMessageChatbot,
              color: mapHeaderIconColors,
              badgeText: chatCount > 0 ? String(chatCount) : undefined,
              onPress: handleChatPress,
            },
          ]}
        />
        {activeSession && (
          <MapStatus
            classNames={{
              text: mapHeaderTitleClassName,
            }}
          />
        )}
        {/* <MapDebugDialog className="m-4" /> */}
      </StableSafeAreaView>
      {/* {!sessionStarted && (
        <MapSessionStarter onStart={() => setSessionStarted(true)} />
      )} */}
    </View>
  );
};
