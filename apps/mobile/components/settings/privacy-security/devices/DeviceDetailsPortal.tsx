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
import { Text, Button, Icon } from "@softsurgery/mobile-ui";
import { useApi } from "@/contexts/ApiContext";
import {
  ResponseUserDeviceDto,
  ResponseUserConnectionHistoryDto,
} from "api-client";
import { useCurrentDeviceMac } from "@/hooks/useCurrentDeviceMac";
import {
  isCurrentDevice,
  parseDeviceCoordinates,
  getDeviceDisplayName,
} from "@/lib/device";
import { useLogout } from "@/hooks/useLogout";
import { DeviceDetailsSection } from "./DeviceDetailsSection";
import { ConnectionCard } from "./ConnectionCard";

const INITIAL_VISIBLE_CONNECTIONS = 5;

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
      ),
      t(
        "settings.account.screens.privacy-security.screens.account-security.devices.revokeAlert.message",
      ),
      [
        {
          text: t(
            "settings.account.screens.privacy-security.screens.account-security.devices.revokeAlert.cancel",
          ),
          style: "cancel",
        },
        {
          text: t(
            "settings.account.screens.privacy-security.screens.account-security.devices.revokeAlert.confirm",
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
    );

  if (!device && !isLoading) {
    return (
      <StableSafeAreaView className="flex-1 bg-card">
        <ApplicationHeader
          classNames={{ wrapper: "border-b border-border pb-2" }}
          title={t(
            "settings.account.screens.privacy-security.screens.account-security.devices.details.title",
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
        <Text className="text-sm font-semibold text-foreground px-4 mt-4">
          {t(
            "settings.account.screens.privacy-security.screens.account-security.devices.map.title",
          )}
        </Text>
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
            )
          }
          subFallbackText={t(
            "settings.account.screens.privacy-security.screens.account-security.devices.details.approximate",
          )}
        />

        {/* Connection History Section */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between px-4">
            <Text className="text-sm font-semibold text-foreground">
              {t(
                "settings.account.screens.privacy-security.screens.account-security.devices.connections.title",
              )}
            </Text>

            {hasMoreConnections && (
              <Pressable
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={handleShowMore}
                className="flex-row items-center gap-1 active:opacity-70"
              >
                <Text className="text-xs font-semibold text-primary">
                  {t(
                    "settings.account.screens.privacy-security.screens.account-security.devices.actions.showMore",
                  )}
                </Text>
                <Icon as={ChevronRight} size={14} className="text-primary" />
              </Pressable>
            )}
          </View>

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
                )}
              </Text>
            </View>
          ) : groupedConnections.length === 0 ? (
            <View className="items-center justify-center py-6 px-6 gap-1.5">
              <Text className="text-sm text-muted-foreground">
                {t(
                  "settings.account.screens.privacy-security.screens.account-security.devices.connections.emptyTitle",
                )}
              </Text>
            </View>
          ) : (
            <View className="pt-1">
              {groupedConnections.map((group) => (
                <View key={group.title} className="mb-2">
                  <Text className="mt-4 mb-2 px-4 text-sm font-semibold text-muted-foreground">
                    {group.title}
                  </Text>
                  {group.items.map(({ connection, isLatest }, idx) => (
                    <ConnectionCard
                      key={
                        connection.id
                          ? String(connection.id)
                          : `${group.title}-${idx}`
                      }
                      connection={connection}
                      device={device}
                      isLatest={isLatest}
                      isFirst={idx === 0}
                      isLast={idx === group.items.length - 1}
                    />
                  ))}
                </View>
              ))}
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
              )}
            </Text>
          </Button>
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
