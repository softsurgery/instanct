import React from "react";
import { View, Alert, RefreshControl, Pressable } from "react-native";
import { router } from "expo-router";
import { Monitor, Loader2, ChevronRight, LogOut } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { toast } from "sonner-native";
import { cn } from "@softsurgery/lib";
import { ApplicationHeader } from "@softsurgery/mobile-components";
import { StableSafeAreaView } from "@softsurgery/mobile-components";
import { AppHeaderBack } from "@softsurgery/mobile-components";
import { StableScrollView } from "@softsurgery/mobile-components";
import { Text } from "@softsurgery/mobile-ui";
import { Badge } from "@softsurgery/mobile-ui";
import { Button } from "@softsurgery/mobile-ui";
import { Separator } from "@softsurgery/mobile-ui";
import { Icon } from "@softsurgery/mobile-ui";
import { useApi } from "@/contexts/ApiContext";
import { ResponseUserDeviceDto } from "@softsurgery/api-client";
import { useLogout } from "@/hooks/useLogout";
import { getDeviceIcon } from "@/lib/device-icon";
import { useCurrentDeviceId } from "@/hooks/useCurrentDeviceId";
import {
  isCurrentDevice,
  getDeviceDisplayName,
  getDeviceSubtitle,
} from "@/lib/device";

interface UserDevicesPortalProps {
  className?: string;
}

export const UserDevicesPortal = ({ className }: UserDevicesPortalProps) => {
  const api = useApi();
  const { t } = useTranslation("settings");
  const queryClient = useQueryClient();
  const logout = useLogout();
  const currentDeviceId = useCurrentDeviceId();

  const {
    data: devices = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<ResponseUserDeviceDto[]>({
    queryKey: ["user-devices"],
    queryFn: async () => api.userDevices.getAll(),
  });

  const logoutAllMutation = useMutation({
    mutationFn: () => api.userDevices.revokeAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-devices"] });
      toast.success(
        t(
          "settings.account.screens.privacy-security.screens.account-security.devices.toasts.logoutAllSuccess",
          "Logged out of all devices",
        ),
      );
      logout();
    },
    onError: () => {
      toast.error(
        t(
          "settings.account.screens.privacy-security.screens.account-security.devices.toasts.logoutAllError",
          "Failed to log out of all devices",
        ),
      );
    },
  });

  const handleLogoutAllDevices = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      t(
        "settings.account.screens.privacy-security.screens.account-security.devices.logoutAllAlert.title",
        "Log Out of All Devices",
      ),
      t(
        "settings.account.screens.privacy-security.screens.account-security.devices.logoutAllAlert.message",
        "Are you sure you want to log out of all devices? This will sign you out of this device and log out all other devices.",
      ),
      [
        {
          text: t(
            "settings.account.screens.privacy-security.screens.account-security.devices.logoutAllAlert.cancel",
            "Cancel",
          ),
          style: "cancel",
        },
        {
          text: t(
            "settings.account.screens.privacy-security.screens.account-security.devices.logoutAllAlert.confirm",
            "Log Out All",
          ),
          style: "destructive",
          onPress: () => logoutAllMutation.mutate(),
        },
      ],
    );
  };

  const handleDevicePress = (device: ResponseUserDeviceDto) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/main/profile/device-details",
      params: {
        id: device.id,
        deviceData: JSON.stringify(device),
      },
    });
  };

  const isMutating = logoutAllMutation.isPending;

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t(
          "settings.account.screens.privacy-security.screens.account-security.devices.title",
          "Devices & Allowed Access",
        )}
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
        className="bg-background"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
          />
        }
      >
        <View className="p-4">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            {t(
              "settings.account.screens.privacy-security.screens.account-security.devices.sectionDescription",
              "Manage devices that have signed into your account. Tap a device to view full details or remove and log out.",
            )}
          </Text>
        </View>

        {isLoading ? (
          <View className="p-10 flex-row justify-center items-center gap-3">
            <Icon
              as={Loader2}
              className="animate-spin text-primary"
              size={24}
            />
            <Text className="text-muted-foreground font-medium">
              {t(
                "settings.account.screens.privacy-security.screens.account-security.devices.loading",
                "Loading devices...",
              )}
            </Text>
          </View>
        ) : devices.length === 0 ? (
          <View className="p-8 items-center justify-center">
            <View className="w-16 h-16 rounded-full bg-muted/30 items-center justify-center mb-4">
              <Icon as={Monitor} className="text-muted-foreground" size={32} />
            </View>
            <Text className="text-base font-semibold text-foreground mb-1">
              {t(
                "settings.account.screens.privacy-security.screens.account-security.devices.emptyTitle",
                "No registered devices",
              )}
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              {t(
                "settings.account.screens.privacy-security.screens.account-security.devices.emptyDescription",
                "Devices you sign in from will appear here.",
              )}
            </Text>
          </View>
        ) : (
          <View className="flex-col">
            {devices.map((device, index) => {
              const isThisDevice = isCurrentDevice(device, currentDeviceId);
              const DeviceIcon = getDeviceIcon(device.os, device.deviceName);
              const isLast = index === devices.length - 1;

              return (
                <View key={device.id}>
                  {/* Single Line Device Item */}
                  <Pressable
                    onPress={() => handleDevicePress(device)}
                    className="px-4 py-3.5 flex-row items-center justify-between active:opacity-70"
                  >
                    {/* Left: Device Icon & Name */}
                    <View className="flex-row items-center gap-3 flex-1 pr-3">
                      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                        <Icon
                          as={DeviceIcon}
                          className="text-primary"
                          size={20}
                        />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 flex-wrap">
                          <Text
                            className="font-semibold text-base text-foreground"
                            numberOfLines={1}
                          >
                            {getDeviceDisplayName(device)}
                          </Text>

                          {isThisDevice && (
                            <Badge
                              variant="secondary"
                              className="bg-primary/15 border-primary/20 px-1.5 py-0"
                            >
                              <Text className="text-sm font-semibold text-primary">
                                {t(
                                  "settings.account.screens.privacy-security.screens.account-security.devices.thisDevice",
                                  "This Device",
                                )}
                              </Text>
                            </Badge>
                          )}
                        </View>

                        {device.os && (
                          <Text
                            className="text-xs text-muted-foreground mt-0.5"
                            numberOfLines={1}
                          >
                            {getDeviceSubtitle(device)}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Right: Chevron */}
                    <Icon
                      as={ChevronRight}
                      size={18}
                      className="text-muted-foreground"
                    />
                  </Pressable>

                  {!isLast && <Separator className="ml-16" />}
                </View>
              );
            })}
          </View>
        )}

        {/* Option to Log Out All Devices */}
        {!isLoading && devices.length > 0 && (
          <View className="p-4 mt-2 mb-8">
            <Button
              variant="destructive-outline"
              size="lg"
              className="rounded-xl flex-row items-center justify-center gap-2"
              onPress={handleLogoutAllDevices}
              disabled={isMutating}
            >
              {logoutAllMutation.isPending ? (
                <Icon
                  as={Loader2}
                  size={18}
                  className="animate-spin text-destructive"
                />
              ) : (
                <Icon as={LogOut} size={18} className="text-destructive" />
              )}
              <Text className="text-destructive text-md font-bold">
                {t(
                  "settings.account.screens.privacy-security.screens.account-security.devices.actions.logoutAll",
                  "Log Out of All Devices",
                )}
              </Text>
            </Button>
            <Text className="text-xs text-muted-foreground text-center mt-2 px-4 leading-normal">
              {t(
                "settings.account.screens.privacy-security.screens.account-security.devices.actions.logoutAllDescription",
                "You will be signed out from all active sessions and devices, including this one.",
              )}
            </Text>
          </View>
        )}
      </StableScrollView>
    </StableSafeAreaView>
  );
};
