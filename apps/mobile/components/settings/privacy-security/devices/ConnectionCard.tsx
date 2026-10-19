import React from "react";
import { View } from "react-native";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { cn } from "@softsurgery/lib";
import { Text, Badge } from "@softsurgery/mobile-ui";
import type { ResponseUserConnectionHistoryDto } from "@softsurgery/api-client";
import type { DeviceLike } from "@/lib/device";

export interface ConnectionCardProps {
  connection: ResponseUserConnectionHistoryDto;
  device?: DeviceLike | null;
  isLatest?: boolean;
  className?: string;
}

interface ConnectionInfoRowProps {
  label: string;
  value: React.ReactNode;
}

const ConnectionInfoRow = ({ label, value }: ConnectionInfoRowProps) => (
  <View className="flex-row items-center justify-between gap-4">
    <Text className="text-sm text-muted-foreground shrink-0">{label}</Text>
    <View className="flex-1 items-end justify-center">
      {typeof value === "string" || typeof value === "number" ? (
        <Text
          className="text-sm text-foreground text-right"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  </View>
);

export const ConnectionCard = ({
  connection,
  isLatest = false,
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
        return `${startTimeStr} - ${format(end, "HH:mm")}`;
      }
    }

    return startTimeStr;
  }, [connectionDate, connection.disconnectedAt]);

  const locationLabel =
    connection.location ||
    (connection.latitude != null && connection.longitude != null
      ? `${connection.latitude.toFixed(4)}, ${connection.longitude.toFixed(4)}`
      : null);

  return (
    <View className={cn("px-5 py-3 flex-col gap-1.5", className)}>
      {/* Time of session with Connected badge if currently active */}
      {timeValue ? (
        <ConnectionInfoRow
          label={t(
            "settings.account.screens.privacy-security.screens.account-security.devices.connections.time",
            "Time",
          )}
          value={
            <View className="flex-row items-center gap-2 justify-end">
              <Text className="text-sm text-foreground">{timeValue}</Text>
              {isOnline && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/15 border-emerald-500/30 px-1.5 py-0"
                >
                  <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {t(
                      "settings.account.screens.privacy-security.screens.account-security.devices.connections.connectedNow",
                      "Connected",
                    )}
                  </Text>
                </Badge>
              )}
            </View>
          }
        />
      ) : null}

      {/* IP Address */}
      {connection.ipAddress ? (
        <ConnectionInfoRow
          label={t(
            "settings.account.screens.privacy-security.screens.account-security.devices.details.ipAddress",
            "IP Address",
          )}
          value={connection.ipAddress}
        />
      ) : null}

      {/* Location */}
      {locationLabel ? (
        <ConnectionInfoRow
          label={t(
            "settings.account.screens.privacy-security.screens.account-security.devices.details.location",
            "Location",
          )}
          value={locationLabel}
        />
      ) : null}
    </View>
  );
};

export const ConnectionItem = ConnectionCard;
