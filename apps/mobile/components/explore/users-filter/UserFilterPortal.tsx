import {
  ApplicationHeader,
  StableSafeAreaView,
  StableKeyboardAwareScrollView,
  BottomButtonWrapper,
  AppHeaderBack,
} from "@softsurgery/mobile-components";
import {
  FormBuilder,
  mapToSelectOptions,
} from "@softsurgery/mobile-form-builder";
import { router } from "expo-router";
import { View } from "react-native";
import { useExploreFilterFormStructure } from "./useExploreFilterFormStructure";
import { useKeyboardVisible } from "@softsurgery/mobile-hooks";
import { Button, Text } from "@softsurgery/mobile-ui";
import { useObjectives } from "api-client/hooks/content/reference-types/useObjectives";
import { useIndustries } from "api-client/hooks/content/reference-types/useIndustries";
import { useExploreFilterStore } from "@/stores/userExploreFilterStore";
import { useTranslation } from "react-i18next";
import React from "react";
import { toast } from "sonner-native";
import { useLayoutConfig } from "@/config/wrapper-config";

interface UserFilterPortalProps {
  className?: string;
}

export const UserFilterPortal = ({ className }: UserFilterPortalProps) => {
  const { safeAreaClassNames, applicationHeaderClassNames } = useLayoutConfig();
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
    <StableSafeAreaView classNames={safeAreaClassNames} className={className}>
      <ApplicationHeader
        classNames={{
          wrapper: applicationHeaderClassNames.wrapper,
        }}
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
      <View className="flex-1 bg-background rounded-b-xl">
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
        <BottomButtonWrapper orientation="horizontal">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl flex-1"
            onPress={handleResetFilters}
          >
            <Text className="text-md font-bold">
              {t("explore.filter.actions.removeFilters")}
            </Text>
          </Button>
          <Button
            size="sm"
            className="rounded-xl flex-1"
            onPress={handleApplyFilters}
          >
            <Text className="text-md font-bold">
              {t("explore.filter.actions.saveFilters")}
            </Text>
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
