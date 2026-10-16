import React from "react";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  fingerprint?: string;
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
  fingerprint,
}: NewSignInPortalProps) => {
  const { t } = useTranslation("notifications");
  const insets = useSafeAreaInsets();

  const deviceData = React.useMemo<DeviceDetailsData>(
    () => ({
      id: deviceId,
      deviceName: device || "iPhone 15 Pro",
      os: os || "iOS 18.5",
      ipAddress: ip || "82.65.14.203",
      location: location || "Paris, France",
      lastSignInAt: time || "12 August 2026 at 14:32",
      fingerprint,
    }),
    [deviceId, device, os, ip, location, time, fingerprint],
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
