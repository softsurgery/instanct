import React from "react";
import { View, Alert, Pressable, RefreshControl } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import * as Haptics from "expo-haptics";
import { toast } from "sonner-native";
import {
  Trash2,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react-native";

import { cn } from "@softsurgery/lib";
import {
  ApplicationHeader,
  StableSafeAreaView,
  StableScrollView,
  AppHeaderBack,
  LocationMap,
} from "@softsurgery/mobile-components";
import { Text, Button, Icon, Separator } from "@softsurgery/mobile-ui";
import { useApi } from "@/contexts/ApiContext";
import {
  ResponseUserDeviceDto,
  ResponseUserConnectionHistoryDto,
} from "@softsurgery/api-client";
import { useCurrentDeviceMac } from "@/hooks/useCurrentDeviceMac";
import {
  isCurrentDevice,
  parseDeviceCoordinates,
  getDeviceDisplayName,
} from "@/lib/device";
import { useLogout } from "@/hooks/useLogout";
import { DeviceDetailsSection } from "./DeviceDetailsSection";
import { ConnectionCard } from "./ConnectionCard";

const INITIAL_VISIBLE_CONNECTIONS = 3;

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

  const currentMacAddress = useCurrentDeviceMac();

  const initialDevice = React.useMemo<ResponseUserDeviceDto | null>(() => {
    if (params.deviceData) {
      try {
        return JSON.parse(params.deviceData);
      } catch {
        return null;
      }
    }
    return null;
  }, [params.deviceData]);

  const {
    data: devices = [],
    isLoading,
    isRefetching: isRefetchingDevices,
    refetch: refetchDevices,
  } = useQuery<ResponseUserDeviceDto[]>({
    queryKey: ["user-devices"],
    queryFn: async () => api.userDevices.getAll(),
  });

  const {
    data: history = [],
    isLoading: isHistoryLoading,
    isRefetching: isRefetchingHistory,
    refetch: refetchHistory,
  } = useQuery<ResponseUserConnectionHistoryDto[]>({
    queryKey: ["device-history", id],
    queryFn: async () => (id ? api.userDeviceHistory.getByDeviceId(id) : []),
    enabled: !!id,
  });

  const device = devices.find((d) => d.id === id) || initialDevice;
  const latestConnection = history[0];

  // Extract coordinates from latest connection history
  const activeCoords = React.useMemo(
    () => parseDeviceCoordinates(latestConnection),
    [latestConnection],
  );

  const displayLocation = latestConnection?.location;

  const isThisDevice = isCurrentDevice(device, currentMacAddress);

  const visibleConnections = React.useMemo(
    () => history.slice(0, INITIAL_VISIBLE_CONNECTIONS),
    [history],
  );

  const groupedConnections = React.useMemo(() => {
    if (!visibleConnections || visibleConnections.length === 0) return [];

    const grouped: Record<
      string,
      { connection: ResponseUserConnectionHistoryDto; isLatest: boolean }[]
    > = {};

    visibleConnections.forEach((conn, index) => {
      const rawDate = conn.createdAt;
      let title = t("common.unknown", "Unknown Date");

      if (rawDate) {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          const date = parseISO(parsed.toISOString());
          title = format(date, "MMMM d, yyyy");

          if (isToday(date)) {
            title = t("common.today", "Today");
          } else if (isYesterday(date)) {
            title = t("common.yesterday", "Yesterday");
          }
        }
      }

      if (!grouped[title]) {
        grouped[title] = [];
      }
      grouped[title].push({
        connection: conn,
        isLatest: index === 0,
      });
    });

    return Object.entries(grouped).map(([title, items]) => ({
      title,
      items,
    }));
  }, [visibleConnections, t]);

  const hasMoreConnections = history.length > INITIAL_VISIBLE_CONNECTIONS;

  const revokeMutation = useMutation({
    mutationFn: (deviceId: string) => api.userDevices.revoke(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-devices"] });
      queryClient.invalidateQueries({ queryKey: ["device-history", id] });
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

  const handleShowMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/main/profile/device-connections",
      params: {
        id: device?.id || id,
        ...(device ? { deviceData: JSON.stringify(device) } : {}),
      },
    });
  };

  const handleRefresh = () => {
    void refetchDevices();
    void refetchHistory();
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

      <StableScrollView
        className="flex-1 bg-background"
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingDevices || isRefetchingHistory}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Device Information Section */}
        <DeviceDetailsSection
          device={device}
          connection={latestConnection}
          connections={history}
          isThisDevice={isThisDevice}
          className="px-5 pt-4 pb-2"
        />

        {/* Map Section */}
        <LocationMap
          latitude={activeCoords?.latitude}
          longitude={activeCoords?.longitude}
          location={
            displayLocation ||
            (activeCoords
              ? `${activeCoords.latitude.toFixed(4)}, ${activeCoords.longitude.toFixed(4)}`
              : null)
          }
          title={device?.deviceName || device?.os || "Device"}
          description={displayLocation || undefined}
          className="h-80 mx-4 my-2"
          disableGesturesUnlessOpened={true}
          showLocationPill={true}
          showFullscreenToggle={true}
          fallbackText={
            displayLocation ||
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

        {/* Connection History Section */}
        <View className="mt-4">
          <Text className="text-sm font-semibold text-foreground px-4">
            {t(
              "settings.account.screens.privacy-security.screens.account-security.devices.connections.title",
              "Connection History",
            )}
          </Text>

          {isHistoryLoading ? (
            <View className="items-center justify-center py-6 gap-2">
              <Icon
                as={Loader2}
                className="animate-spin text-primary"
                size={20}
              />
              <Text className="text-xs text-muted-foreground">
                {t(
                  "settings.account.screens.privacy-security.screens.account-security.devices.connections.loading",
                  "Loading connections...",
                )}
              </Text>
            </View>
          ) : groupedConnections.length === 0 ? (
            <View className="items-center justify-center py-6 px-6 gap-1.5">
              <Text className="text-sm text-muted-foreground">
                {t(
                  "settings.account.screens.privacy-security.screens.account-security.devices.connections.emptyTitle",
                  "No connection history yet",
                )}
              </Text>
            </View>
          ) : (
            <View className="pt-1">
              {groupedConnections.map((group) => (
                <View key={group.title}>
                  <Text className="mb-2.5 mt-2 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {group.title}
                  </Text>
                  {group.items.map(({ connection, isLatest }, idx) => (
                    <View
                      key={
                        connection.id
                          ? String(connection.id)
                          : `${group.title}-${idx}`
                      }
                    >
                      <ConnectionCard
                        connection={connection}
                        device={device}
                        isLatest={isLatest}
                      />
                      {idx < group.items.length - 1 && <Separator />}
                    </View>
                  ))}
                </View>
              ))}

              {hasMoreConnections && (
                <View className="items-center pt-3 pb-1">
                  <Pressable
                    accessibilityRole="link"
                    onPress={handleShowMore}
                    className="flex-row items-center justify-center gap-1 px-4 py-1.5 active:opacity-70"
                  >
                    <Text className="text-sm font-semibold text-primary">
                      {t(
                        "settings.account.screens.privacy-security.screens.account-security.devices.actions.showMore",
                        "Show more",
                      )}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bottom Actions */}
        <View
          className="p-4 pt-4 pb-8"
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
      </StableScrollView>
    </StableSafeAreaView>
  );
};
