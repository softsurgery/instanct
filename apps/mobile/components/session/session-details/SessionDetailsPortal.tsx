import React from "react";
import {
  StableScrollView,
  ApplicationHeader,
  StableSafeAreaView,
  AppHeaderBack,
} from "@softsurgery/mobile-components";
import { Text } from "@softsurgery/mobile-ui";
import { MapSessionPayload, ResponseSessionDto } from "api-client";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { SessionDetailsContent } from "./SessionDetailsContent";
import { useTranslation } from "react-i18next";
import { useLayoutConfig } from "@/config/wrapper-config";

interface SessionDetailsPortalProps {
  className?: string;
}

export const SessionDetailsPortal = ({
  className,
}: SessionDetailsPortalProps) => {
  const { safeAreaClassNames, applicationHeaderClassNames } = useLayoutConfig();
  const { t } = useTranslation("common");

  const { session: sessionParam } = useLocalSearchParams<{
    session?: string;
  }>();

  const session =
    React.useMemo<ResponseSessionDto<MapSessionPayload> | null>(() => {
      if (!sessionParam || typeof sessionParam !== "string") return null;
      try {
        return JSON.parse(
          sessionParam,
        ) as ResponseSessionDto<MapSessionPayload>;
      } catch {
        return null;
      }
    }, [sessionParam]);

  const EmptyState = () => (
    <View className="px-4 mt-4">
      <View className="rounded-2xl border border-destructive/60 bg-destructive/5 shadow-sm overflow-hidden">
        <View className="p-4">
          <Text className="text-lg font-semibold">Session not found</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            We could not load this session&apos;s details.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <StableSafeAreaView classNames={safeAreaClassNames} className={className}>
      <ApplicationHeader
        classNames={{
          wrapper: applicationHeaderClassNames.wrapper,
        }}
        title={t("screens.sessionDetails")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />

      <StableScrollView className="flex-1 bg-background rounded-b-xl">
        {!session ? (
          <EmptyState />
        ) : (
          <SessionDetailsContent session={session} />
        )}
      </StableScrollView>
    </StableSafeAreaView>
  );
};
