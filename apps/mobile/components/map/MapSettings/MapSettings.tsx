import React from "react";
import { cn } from "@softsurgery/lib";
import { useMapStore } from "@/stores/useMapStore";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import {
  ApplicationHeader,
  AppHeaderBack,
  BottomButtonWrapper,
  StableSafeAreaView,
} from "@softsurgery/mobile-components";
import { Button, Text } from "@softsurgery/mobile-ui";
import { FormBuilder } from "@softsurgery/mobile-form-builder";
import { useMutation } from "@tanstack/react-query";
import { useApi } from "@/contexts/ApiContext";
import { toast } from "sonner-native";
import { useMapSettingsFormStructure } from "./useMapSettingsFormStructure";

interface MapSettingsProps {
  className?: string;
}

export const MapSettings = ({ className }: MapSettingsProps) => {
  const api = useApi();
  const { t } = useTranslation("settings");
  const mapStore = useMapStore();

  React.useEffect(() => {
    mapStore.set("draftSettings", mapStore.settings);
    return () => {
      // Reset draft settings when unmounting the component
      mapStore.setNested("draftSettings.radius", mapStore.settings.radius);
      mapStore.setNested(
        "draftSettings.showUsernames",
        mapStore.settings.showUsernames,
      );
    };
  }, []);

  const {
    mutate: updateMapConfiguration,
    isPending: isUpdateMapConfigurationPending,
  } = useMutation({
    mutationFn: async () => {
      await api.currentUser.updateMapConfiguration({
        radius: mapStore.draftSettings.radius,
        showUsernames: mapStore.draftSettings.showUsernames,
      });
    },
    onSuccess: () => {
      mapStore.setNested("settings.radius", mapStore.draftSettings.radius);
      mapStore.setNested(
        "settings.showUsernames",
        mapStore.draftSettings.showUsernames,
      );
      mapStore.set("nearbyUsers", []);
      toast.success(t("map-settings.toasts.updated"), {
        description: t("map-settings.toasts.updated-description"),
      });
      router.push("/main/(tabs)/map");
    },
  });

  const { sections } = useMapSettingsFormStructure({
    isPending: isUpdateMapConfigurationPending,
  });

  const handleMapConfigurationUpdate = () => {
    updateMapConfiguration();
  };

  return (
    <StableSafeAreaView className={cn("flex flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("map-settings.title")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <ScrollView className="bg-background flex-1">
        <View className="flex flex-col">
          {sections.map((section) => (
            <View
              key={section.key}
              className="border border-b-border border-t-border overflow-hidden"
            >
              <View className="px-8 py-4 bg-card mb-4">
                <Text className="text-lg font-semibold">{section.title}</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </Text>
              </View>

              <View className="px-4 pb-4 flex flex-col">
                <FormBuilder structure={section.structure} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomButtonWrapper>
        <Button
          size="lg"
          variant="default"
          className="rounded-xl"
          onPress={() => {
            handleMapConfigurationUpdate();
          }}
          disabled={isUpdateMapConfigurationPending}
        >
          <Text className="text-md font-bold">
            {isUpdateMapConfigurationPending
              ? t("map-settings.actions.update-map-config-pending")
              : t("map-settings.actions.update-map-config")}
          </Text>
        </Button>
      </BottomButtonWrapper>
    </StableSafeAreaView>
  );
};
