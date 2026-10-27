import React from "react";
import { View } from "react-native";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Network } from "lucide-react-native";
import { cn } from "@softsurgery/lib";
import { Text, Icon } from "@softsurgery/mobile-ui";
import type { ResponseUserConnectionHistoryDto } from "api-client";
import type { DeviceLike } from "@/lib/device";
import { ActiveLocationBadge } from "@softsurgery/mobile-components";
import { TimelineNode } from "./TimelineNode";

export interface ConnectionCardProps {
  connection: ResponseUserConnectionHistoryDto;
  device?: DeviceLike | null;
  isLatest?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
}

export const ConnectionCard = ({
  connection,
  isLatest = false,
  isFirst = false,
  isLast = false,
  className,
}: ConnectionCardProps) => {
  const { t } = useTranslation("settings");

  const isOnline = Boolean(isLatest && !connection.disconnectedAt);
  const connectionDate = connection.createdAt;

  const timeValue = React.useMemo(() => {
    if (!connectionDate) return null;
    const start = new Date(connectionDate);
    if (isNaN(start.getTime())) return null;
    const startTimeStr = format(start, "HH:mm");

    if (connection.disconnectedAt) {
      const end = new Date(connection.disconnectedAt);
      if (!isNaN(end.getTime())) {
        return `${startTimeStr} – ${format(end, "HH:mm")}`;
      }
    }

    return startTimeStr;
  }, [connectionDate, connection.disconnectedAt]);

  const locationLabel =
    connection.location ||
    (connection.latitude != null && connection.longitude != null
      ? `${connection.latitude.toFixed(4)}, ${connection.longitude.toFixed(4)}`
      : t(
          "settings.account.screens.privacy-security.screens.account-security.devices.details.noLocation",
          "Location unavailable",
        ));

  if (isLatest) {
    return (
      <View className={cn("mx-4 mb-3", className)}>
        <View className="bg-card rounded-2xl p-4 border border-border/50 flex-row items-center justify-between shadow-sm">
          {/* Left: Map illustration + Location/IP */}
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <ActiveLocationBadge />
            <View className="flex-1">
              <Text
                className="text-base font-bold text-foreground"
                numberOfLines={1}
              >
                {locationLabel}
              </Text>
              {connection.ipAddress ? (
                <View className="flex-row items-center gap-1.5 mt-0.5">
                  <Icon
                    as={Network}
                    size={13}
                    className="text-muted-foreground"
                  />
                  <Text className="text-xs text-muted-foreground font-medium">
                    {connection.ipAddress}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Right: Time + Connected Badge */}
          <View className="flex-row items-center gap-2 shrink-0">
            {timeValue && (
              <Text className="text-xs text-muted-foreground font-medium">
                {timeValue}
              </Text>
            )}
            {isOnline && (
              <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-500/30">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {t(
                    "settings.account.screens.privacy-security.screens.account-security.devices.connections.connectedNow",
                    "Connected",
                  )}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={cn("flex-row items-center pl-2 pr-4 mb-2.5", className)}>
      <TimelineNode isFirst={isFirst} isLast={isLast} />
      <View className="flex-1 bg-card rounded-2xl px-4 py-3.5 border border-border/40 shadow-sm flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text
            className="text-base font-bold text-foreground"
            numberOfLines={1}
          >
            {locationLabel}
          </Text>
          {connection.ipAddress ? (
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Icon as={Network} size={13} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground font-medium">
                {connection.ipAddress}
              </Text>
            </View>
          ) : null}
        </View>

        {timeValue && (
          <Text className="text-xs text-muted-foreground font-medium shrink-0">
            {timeValue}
          </Text>
        )}
      </View>
    </View>
  );
};
