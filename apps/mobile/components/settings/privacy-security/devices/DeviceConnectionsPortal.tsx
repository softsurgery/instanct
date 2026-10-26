import React from "react";
import { View, RefreshControl } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { Loader2 } from "lucide-react-native";
import { LegendList } from "@legendapp/list";

import { cn } from "@softsurgery/lib";
import {
  ApplicationHeader,
  StableSafeAreaView,
  AppHeaderBack,
} from "@softsurgery/mobile-components";
import { Text, Icon, Separator } from "@softsurgery/mobile-ui";
import { useApi } from "@/contexts/ApiContext";
import type {
  ResponseUserDeviceDto,
  ResponseUserConnectionHistoryDto,
} from "api-client";
import { ConnectionCard } from "./ConnectionCard";

export type HistoryListItem =
  | { type: "header"; id: string; title: string }
  | {
      type: "connection";
      id: string;
      connection: ResponseUserConnectionHistoryDto;
      isLatest: boolean;
    };

interface DeviceConnectionsPortalProps {
  className?: string;
}

export const DeviceConnectionsPortal = ({
  className,
}: DeviceConnectionsPortalProps) => {
  const api = useApi();
  const { t } = useTranslation("settings");

  const params = useLocalSearchParams<{ id?: string; deviceData?: string }>();
  const id = params.id;

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

  const { data: devices = [] } = useQuery<ResponseUserDeviceDto[]>({
    queryKey: ["user-devices"],
    queryFn: async () => api.userDevices.getAll(),
  });

  const device = devices.find((d) => d.id === id) || initialDevice;

  const {
    data: history = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<ResponseUserConnectionHistoryDto[]>({
    queryKey: ["device-history", id],
    queryFn: async () =>
      id
        ? api.userDeviceHistory.getByDeviceId(id)
        : api.userDeviceHistory.getAll(),
  });

  const screenTitle = t(
    "settings.account.screens.privacy-security.screens.account-security.devices.connections.title",
    "Connection History",
  );

  // Group connection entries by date using the Bookmarks portal header design
  const flattenedHistory = React.useMemo<HistoryListItem[]>(() => {
    if (!history || history.length === 0) return [];

    const grouped: Record<
      string,
      { connection: ResponseUserConnectionHistoryDto; isLatest: boolean }[]
    > = {};

    history.forEach((conn, index) => {
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

    const flattened: HistoryListItem[] = [];
    Object.entries(grouped).forEach(([title, items]) => {
      flattened.push({
        type: "header",
        title,
        id: `header-${title}`,
      });
      items.forEach(({ connection, isLatest }, idx) => {
        flattened.push({
          type: "connection",
          id: connection.id ? String(connection.id) : `conn-${title}-${idx}`,
          connection,
          isLatest,
        });
      });
    });

    return flattened;
  }, [history, t]);

  const renderItem = React.useCallback(
    ({ item }: { item: HistoryListItem }) => {
      if (item.type === "header") {
        return (
          <Text className="mb-2.5 mt-2 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {item.title}
          </Text>
        );
      }

      return (
        <ConnectionCard
          connection={item.connection}
          device={device}
          isLatest={item.isLatest}
        />
      );
    },
    [device],
  );

  const renderSeparator = React.useCallback(
    ({ leadingItem }: { leadingItem: HistoryListItem }) => {
      if (leadingItem.type === "header") return null;
      const leadingIndex = flattenedHistory.findIndex(
        (x) => x.id === leadingItem.id,
      );
      const nextItem = flattenedHistory[leadingIndex + 1];
      if (nextItem && nextItem.type === "header") return null;
      return <Separator />;
    },
    [flattenedHistory],
  );

  const renderEmpty = React.useCallback(() => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center p-10 gap-2">
          <Icon as={Loader2} className="animate-spin text-primary" size={24} />
          <Text className="text-sm text-muted-foreground">
            {t(
              "settings.account.screens.privacy-security.screens.account-security.devices.connections.loading",
              "Loading connections...",
            )}
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center p-8 gap-2">
        <Text className="text-sm text-foreground">
          {t(
            "settings.account.screens.privacy-security.screens.account-security.devices.connections.emptyTitle",
            "No connection history yet",
          )}
        </Text>
        <Text className="text-xs text-muted-foreground text-center max-w-[260px]">
          {t(
            "settings.account.screens.privacy-security.screens.account-security.devices.connections.emptyDescription",
            "Each time this device connects with presence, a history log is created.",
          )}
        </Text>
      </View>
    );
  }, [isLoading, t]);

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

      <View className="flex-1 bg-background">
        <LegendList
          style={{ flex: 1 }}
          data={flattenedHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          recycleItems={true}
          estimatedItemSize={65}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
            />
          }
          contentContainerStyle={{
            paddingBottom: 32,
            flexGrow: 1,
          }}
        />
      </View>
    </StableSafeAreaView>
  );
};
