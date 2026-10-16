import React from "react";
import { View } from "react-native";
import {
  Clock,
  MapPin,
  Globe,
  SmartphoneNfc,
  LogIn,
  type LucideIcon,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { cn } from "@softsurgery/lib";
import { Text, Badge, Icon } from "@softsurgery/mobile-ui";
import { getDeviceIcon } from "@/lib/device-icon";
import {
  getDeviceDisplayName,
  getDeviceSubtitle,
  type DeviceLike,
} from "@/lib/device";
import { formatSmartDate, toDateOrNull } from "@/lib/date";

export type DeviceDetailsData = DeviceLike;

export interface DeviceDetailsSectionProps {
  className?: string;
  device?: DeviceDetailsData | null;
  isThisDevice?: boolean;
  timeLabel?: string;
}

interface DeviceInfoRowProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}

const DeviceInfoRow = ({ icon, label, value }: DeviceInfoRowProps) => (
  <View className="flex-row items-center justify-between gap-4">
    <View className="flex-row items-center gap-2 flex-shrink-0">
      <Icon as={icon} size={16} className="text-muted-foreground" />
      <Text className="text-sm text-muted-foreground">{label}</Text>
    </View>
    <Text
      className="text-sm font-medium text-foreground text-right flex-shrink"
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {value}
    </Text>
  </View>
);

export const DeviceDetailsSection = ({
  device,
  isThisDevice = false,
  timeLabel,
  className,
}: DeviceDetailsSectionProps) => {
  const { t } = useTranslation("settings");

  const DeviceIcon = device
    ? getDeviceIcon(device.os || "", device.deviceName || "")
    : SmartphoneNfc;

  const rows = [
    device?.os && {
      key: "os",
      icon: SmartphoneNfc,
      label: t(
        "settings.account.screens.privacy-security.screens.account-security.devices.details.os",
        "Operating System",
      ),
      value: device.os,
    },
    device?.ipAddress && {
      key: "ip",
      icon: Globe,
      label: t(
        "settings.account.screens.privacy-security.screens.account-security.devices.details.ipAddress",
        "IP Address",
      ),
      value: device.ipAddress,
    },
    device?.location && {
      key: "location",
      icon: MapPin,
      label: t(
        "settings.account.screens.privacy-security.screens.account-security.devices.details.location",
        "Location",
      ),
      value: device.location,
    },
    (device?.lastSignInAt || device?.time) && {
      key: "lastSignIn",
      icon: Clock,
      label:
        timeLabel ||
        t(
          "settings.account.screens.privacy-security.screens.account-security.devices.lastSignIn",
          "Last active",
        ),
      value: (() => {
        const rawDate = device.lastSignInAt || device.time;
        const parsed = toDateOrNull(rawDate);
        return parsed ? formatSmartDate(parsed) : String(rawDate || "");
      })(),
    },
    device?.signInCount != null && device.signInCount > 0 && {
      key: "signIns",
      icon: LogIn,
      label: t(
        "settings.account.screens.privacy-security.screens.account-security.devices.details.signIns",
        "Sign-ins",
      ),
      value: device.signInCount,
    },
  ].filter(Boolean) as Array<{
    key: string;
    icon: LucideIcon;
    label: string;
    value: React.ReactNode;
  }>;

  return (
    <View className={cn("flex-col py-4 gap-3", className)}>
      {/* Device Header */}
      <View className="flex-row items-center gap-3 pb-1">
        <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
          <Icon as={DeviceIcon} className="text-primary" size={24} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="font-bold text-lg text-foreground">
              {getDeviceDisplayName(device, "Device Details")}
            </Text>
            {isThisDevice && (
              <Badge
                variant="secondary"
                className="bg-primary/15 border-primary/20 px-2 py-0.5"
              >
                <Text className="text-xs font-semibold text-primary">
                  {t(
                    "settings.account.screens.privacy-security.screens.account-security.devices.thisDevice",
                    "This Device",
                  )}
                </Text>
              </Badge>
            )}
          </View>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {getDeviceSubtitle(device)}
          </Text>
        </View>
      </View>

      {/* Info Rows */}
      <View className="flex-col gap-2.5 py-1">
        {rows.map((row) => (
          <DeviceInfoRow
            key={row.key}
            icon={row.icon}
            label={row.label}
            value={row.value}
          />
        ))}
      </View>
    </View>
  );
};
