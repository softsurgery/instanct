import React from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ShieldAlert } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { cn } from "@softsurgery/lib";
import {
  ApplicationHeader,
  AppHeaderBack,
  StableSafeAreaView,
  StableScrollView,
} from "@softsurgery/mobile-components";
import { Icon, Image, Text } from "@softsurgery/mobile-ui";
import { useApi } from "@/contexts/ApiContext";
import { useQuery } from "@tanstack/react-query";
import {
  DeviceDetailsSection,
  type DeviceDetailsData,
} from "@/components/settings/privacy-security/devices/DeviceDetailsSection";

const TRANSLATION_PREFIX = "screens.new-signin";

interface NewSignInPortalProps {
  className?: string;
  device?: string;
  os?: string;
  location?: string;
  ip?: string;
  time?: string;
  when?: string;
  deviceId?: string;
  macAddress?: string;
  connectionId?: string;
}

/**
 * "New sign-in" security alert screen, showing where and when the
 * account was accessed using the shared device details block and providing
 * a pressable link to navigate to device management/control.
 */
export const NewSignInPortal = ({
  className,
  device,
  os,
  location,
  ip,
  time,
  when,
  deviceId,
  macAddress,
  connectionId,
}: NewSignInPortalProps) => {
  const { t } = useTranslation("notifications");
  const api = useApi();

  const { data: fetchedDevice } = useQuery({
    queryKey: ["user-device", deviceId],
    queryFn: () => (deviceId ? api.userDevices.getById(deviceId) : null),
    enabled: !!deviceId,
  });

  const { data: fetchedHistory = [] } = useQuery({
    queryKey: ["device-history", deviceId],
    queryFn: () =>
      deviceId ? api.userDeviceHistory.getByDeviceId(deviceId) : [],
    enabled: !!deviceId,
  });

  const targetConnection = React.useMemo(() => {
    if (!fetchedHistory.length) return null;
    if (connectionId) {
      return (
        fetchedHistory.find((c) => c.id === connectionId) || fetchedHistory[0]
      );
    }
    return fetchedHistory[0];
  }, [fetchedHistory, connectionId]);

  const deviceData = React.useMemo<DeviceDetailsData>(
    () => ({
      id: deviceId,
      deviceName: device || fetchedDevice?.deviceName || "Mobile Device",
      os: os || fetchedDevice?.os || "Mobile OS",
      ipAddress: ip || targetConnection?.ipAddress || "",
      location: location || targetConnection?.location || "",
      time:
        time ||
        (targetConnection?.createdAt
          ? new Date(targetConnection.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""),
      macAddress: macAddress || fetchedDevice?.macAddress,
    }),
    [
      deviceId,
      device,
      os,
      ip,
      location,
      time,
      macAddress,
      fetchedDevice,
      targetConnection,
    ],
  );

  const handleSecurePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/main/profile/devices");
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t(`${TRANSLATION_PREFIX}.header`)}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />

      <StableScrollView className="bg-background">
        <View className="items-center px-6 pt-8 pb-8">
          <Image
            source={require("@/assets/images/new-signin.png")}
            className="w-20 h-20 rounded-2xl shadow-md border border-border"
          />

          <Text variant="h4" className="text-center mt-4">
            {t(`${TRANSLATION_PREFIX}.title`)}
          </Text>

          <Text className="text-center text-base text-muted-foreground mt-2">
            {t(`${TRANSLATION_PREFIX}.description`)}
          </Text>
        </View>

        <View className="px-5 pb-2">
          <Text className="text-sm font-semibold uppercase tracking-wider">
            {t(`${TRANSLATION_PREFIX}.sections.details`)}
          </Text>
        </View>

        <DeviceDetailsSection
          device={deviceData}
          className="mx-4"
          timeLabel={t(`${TRANSLATION_PREFIX}.details.time`)}
        />

        <Text className="text-base px-4 my-4 leading-relaxed text-destructive">
          {t(`${TRANSLATION_PREFIX}.footnote`)}
        </Text>

        {/* Secure account pressable link taking user to devices control */}
        <View className="items-center px-6 pt-2">
          <Pressable
            accessibilityRole="link"
            onPress={handleSecurePress}
            className="flex-row items-center justify-center gap-2 px-4 active:opacity-70"
          >
            <Icon as={ShieldAlert} size={24} className="text-destructive" />
            <Text className="text-base font-semibold text-destructive">
              {t(`${TRANSLATION_PREFIX}.actions.secure`)}
            </Text>
          </Pressable>
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
