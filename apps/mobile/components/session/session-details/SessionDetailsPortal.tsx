import React from "react";
import { StableScrollView } from "@instanct/mobile-components";
import { ApplicationHeader } from "@instanct/mobile-components";
import { StableSafeAreaView } from "@instanct/mobile-components";
import { Text } from "@instanct/mobile-ui";
import { cn } from "@instanct/lib";
import { MapSessionPayload, ResponseSessionDto } from "@/types/session";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { View } from "react-native";
import { SessionDetailsContent } from "./SessionDetailsContent";
import { useTranslation } from "react-i18next";

import { AppHeaderBack } from "@instanct/mobile-components";
interface SessionDetailsPortalProps {
  className?: string;
}

export const SessionDetailsPortal = ({
  className,
}: SessionDetailsPortalProps) => {
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
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
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

      <StableScrollView className="flex-1 bg-background">
        {!session ? (
          <EmptyState />
        ) : (
          <SessionDetailsContent session={session} />
        )}
      </StableScrollView>
    </StableSafeAreaView>
  );
};
