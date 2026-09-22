import { ApplicationHeader } from "@instanct/mobile-components";
import { FormBuilder } from "@instanct/mobile-form-builder";
import { StableSafeAreaView } from "@instanct/mobile-components";
import { router } from "expo-router";
import { View } from "react-native";
import { useExploreFilterFormStructure } from "./useExploreFilterFormStructure";
import { StableKeyboardAwareScrollView } from "@instanct/mobile-components";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { Button } from "@instanct/mobile-ui";
import { Text } from "@instanct/mobile-ui";
import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { mapToSelectOptions } from "@instanct/mobile-form-builder";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useExploreFilterStore } from "@/stores/userExploreFilterStore";
import { useTranslation } from "react-i18next";
import { cn } from "@instanct/lib";
import React from "react";
import { toast } from "sonner-native";
import { BottomButtonWrapper } from "@instanct/mobile-components";
import { AppHeaderBack } from "@instanct/mobile-components";

interface UserFilterPortalProps {
  className?: string;
}

export const UserFilterPortal = ({ className }: UserFilterPortalProps) => {
  const isKeyboardVisible = useKeyboardVisible();
  const exploreFilterStore = useExploreFilterStore();

  React.useEffect(() => {
    exploreFilterStore.set("dto", structuredClone(exploreFilterStore.filters));
    return () => {
      exploreFilterStore.resetDto();
    };
  }, []);

  const { t } = useTranslation("explore");

  const { objectives, isObjectivesSubTypePending } = useObjectives();
  const { industries, isIndustriesSubTypePending } = useIndustries();

  const handleApplyFilters = () => {
    exploreFilterStore.apply();
    toast.success(t("explore.filter.toasts.filtersApplied"));
    router.back();
  };

  const handleResetFilters = () => {
    exploreFilterStore.reset();
    toast.success(t("explore.filter.toasts.filtersRemoved"));
    router.back();
  };

  const structure = useExploreFilterFormStructure({
    store: exploreFilterStore,
    objectives: mapToSelectOptions({
      data: objectives,
      labelKey: "label",
      valueKey: "id",
    }),
    industries: mapToSelectOptions({
      data: industries,
      labelKey: "label",
      valueKey: "id",
    }),
    isPending: isObjectivesSubTypePending || isIndustriesSubTypePending,
  });

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("explore.filter.title")}
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
        <StableKeyboardAwareScrollView className="flex-1 bg-background">
          <View className="px-5 pt-4 pb-2">
            <Text className="text-sm text-muted-foreground leading-relaxed">
              {t("explore.filter.filtersDescription")}
            </Text>
          </View>
          <FormBuilder structure={structure} className="mt-4 px-2" />
        </StableKeyboardAwareScrollView>
      </View>
      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button
            size="lg"
            variant="outline"
            className="rounded-xl"
            onPress={handleResetFilters}
          >
            <Text className="text-md font-bold">
              {t("explore.filter.actions.removeFilters")}
            </Text>
          </Button>
          <Button size="lg" className="rounded-xl" onPress={handleApplyFilters}>
            <Text className="text-md font-bold">
              {t("explore.filter.actions.saveFilters")}
            </Text>
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
