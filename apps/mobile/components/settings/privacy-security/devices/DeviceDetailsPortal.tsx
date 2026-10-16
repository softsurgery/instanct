import React from "react";
import { View, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { toast } from "sonner-native";
import { Trash2, Loader2, AlertCircle } from "lucide-react-native";

import { cn } from "@softsurgery/lib";
import {
  ApplicationHeader,
  StableSafeAreaView,
  AppHeaderBack,
  LocationMap,
} from "@softsurgery/mobile-components";
import { Text, Button, Icon } from "@softsurgery/mobile-ui";
import { useApi } from "@/contexts/ApiContext";
import { UserDevice } from "@softsurgery/api-client";
import { useCurrentDeviceId } from "@/hooks/useCurrentDeviceId";
import {
  isCurrentDevice,
  parseDeviceCoordinates,
  getDeviceDisplayName,
} from "@/lib/device";
import { useLogout } from "@/hooks/useLogout";
import { DeviceDetailsSection } from "./DeviceDetailsSection";

interface DeviceDetailsPortalProps {
  className?: string;
}

export const DeviceDetailsPortal = ({
  className,
}: DeviceDetailsPortalProps) => {
  const api = useApi();
  const { t } = useTranslation("settings");
  const queryClient = useQueryClient();
  const logout = useLogout();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{ id?: string; deviceData?: string }>();
  const id = params.id;

  const currentDeviceId = useCurrentDeviceId();
  const [geocodedCoords, setGeocodedCoords] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const initialDevice = React.useMemo<UserDevice | null>(() => {
    if (params.deviceData) {
      try {
        return JSON.parse(params.deviceData);
      } catch {
        return null;
      }
    }
    return null;
  }, [params.deviceData]);

  const { data: devices = [], isLoading } = useQuery<UserDevice[]>({
    queryKey: ["user-devices"],
    queryFn: async () => api.devices.getDevices(),
  });

  const device = devices.find((d) => d.id === id) || initialDevice;

  // Extract coordinates from device or parse from location string
  const coordinates = React.useMemo(
    () => parseDeviceCoordinates(device),
    [device],
  );

  // Geocode address fallback if coordinates are not stored
  React.useEffect(() => {
    if (!coordinates && device?.location) {
      let isMounted = true;
      Location.geocodeAsync(device.location)
        .then((results) => {
          if (isMounted && results && results.length > 0) {
            setGeocodedCoords({
              latitude: results[0].latitude,
              longitude: results[0].longitude,
            });
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [coordinates, device?.location]);

  const activeCoords = coordinates || geocodedCoords;

  const isThisDevice = isCurrentDevice(device, currentDeviceId);

  const revokeMutation = useMutation({
    mutationFn: (deviceId: string) => api.devices.revokeDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-devices"] });
      toast.success(
        t(
          "settings.account.screens.privacy-security.screens.account-security.devices.toasts.revokeSuccess",
          "Device removed and logged out successfully",
        ),
      );
      if (isThisDevice) {
        logout();
      } else {
        router.back();
      }
    },
    onError: () => {
      toast.error(
        t(
          "settings.account.screens.privacy-security.screens.account-security.devices.toasts.revokeError",
          "Failed to remove and log out device",
        ),
      );
    },
  });

  const handleRevoke = () => {
    if (!device) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      t(
        "settings.account.screens.privacy-security.screens.account-security.devices.revokeAlert.title",
        "Remove and Log Out Device",
      ),
      t(
        "settings.account.screens.privacy-security.screens.account-security.devices.revokeAlert.message",
        "Are you sure you want to remove and log out this device? You will need to sign in again from that device.",
      ),
      [
        {
          text: t(
            "settings.account.screens.privacy-security.screens.account-security.devices.revokeAlert.cancel",
            "Cancel",
          ),
          style: "cancel",
        },
        {
          text: t(
            "settings.account.screens.privacy-security.screens.account-security.devices.revokeAlert.confirm",
            "Remove and Log Out",
          ),
          style: "destructive",
          onPress: () => revokeMutation.mutate(device.id),
        },
      ],
    );
  };

  const screenTitle =
    getDeviceDisplayName(device, "") ||
    t(
      "settings.account.screens.privacy-security.screens.account-security.devices.details.title",
      "Device Details",
    );

  if (!device && !isLoading) {
    return (
      <StableSafeAreaView className="flex-1 bg-card">
        <ApplicationHeader
          classNames={{ wrapper: "border-b border-border pb-2" }}
          title={t(
            "settings.account.screens.privacy-security.screens.account-security.devices.details.title",
            "Device Details",
          )}
          titleVariant="large"
          reverse
          shortcuts={[{ key: "back", render: <AppHeaderBack /> }]}
        />
        <View className="flex-1 items-center justify-center p-6 bg-background">
          <Icon
            as={AlertCircle}
            size={48}
            className="text-muted-foreground mb-3"
          />
          <Text className="text-base font-semibold text-foreground mb-1">
            {t(
              "settings.account.screens.privacy-security.screens.account-security.devices.details.notFound",
              "Device not found",
            )}
          </Text>
        </View>
      </StableSafeAreaView>
    );
  }

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={screenTitle}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />

      <View className="flex-1 bg-background flex-col justify-between">
        {/* Device Information Section (Resembles old sheet, unboxed) */}
        <DeviceDetailsSection
          device={device}
          isThisDevice={isThisDevice}
          className="px-5 pt-4 pb-2"
        />

        {/* Map Section - Takes Remaining Space (flex-1) using shared LocationMap */}
        <LocationMap
          latitude={activeCoords?.latitude}
          longitude={activeCoords?.longitude}
          location={
            device?.location ||
            (activeCoords
              ? `${activeCoords.latitude.toFixed(4)}, ${activeCoords.longitude.toFixed(4)}`
              : null)
          }
          title={device?.deviceName || device?.os || "Device"}
          description={device?.location || undefined}
          className="flex-1 mx-4 my-2"
          scrollEnabled={true}
          zoomEnabled={true}
          showLocationPill={true}
          showFullscreenToggle={true}
          fallbackText={
            device?.location ||
            t(
              "settings.account.screens.privacy-security.screens.account-security.devices.details.noLocation",
              "Location details unavailable for this device",
            )
          }
          subFallbackText={t(
            "settings.account.screens.privacy-security.screens.account-security.devices.details.approximate",
            "Approximate location based on sign-in IP",
          )}
        />

        {/* Remove and Log Out Action Button with bottom padding */}
        <View
          className="p-4 pt-2 pb-8"
          style={{ paddingBottom: Math.max(insets.bottom + 8, 28) }}
        >
          <Button
            variant="destructive-outline"
            size="lg"
            className="rounded-xl flex-row items-center justify-center gap-2"
            onPress={handleRevoke}
            disabled={revokeMutation.isPending}
          >
            {revokeMutation.isPending ? (
              <Icon
                as={Loader2}
                size={18}
                className="animate-spin text-destructive"
              />
            ) : (
              <Icon as={Trash2} size={18} className="text-destructive" />
            )}
            <Text className="text-destructive text-md font-bold">
              {t(
                "settings.account.screens.privacy-security.screens.account-security.devices.actions.revoke",
                "Remove and Log Out",
              )}
            </Text>
          </Button>
        </View>
      </View>
    </StableSafeAreaView>
  );
};
