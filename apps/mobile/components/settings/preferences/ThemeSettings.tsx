import React from "react";
import { View } from "react-native";
import { Text } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import {
  StableKeyboardAwareScrollView,
  StableSafeAreaView,
  ApplicationHeader,
  ThemeSwitcher,
  AppHeaderBack,
} from "@softsurgery/mobile-components";
import { useTranslation } from "react-i18next";
import { useLayoutConfig } from "@/config/wrapper-config";

interface ThemeSettingsPortalProps {
  className?: string;
}

export const ThemeSettingsPortal = ({
  className,
}: ThemeSettingsPortalProps) => {
  const { safeAreaClassNames, applicationHeaderClassNames } = useLayoutConfig();
  const { t } = useTranslation("settings");

  return (
    <StableSafeAreaView classNames={safeAreaClassNames} className={className}>
      <ApplicationHeader
        classNames={{
          wrapper: applicationHeaderClassNames.wrapper,
        }}
        title={t("settings.preferences.screens.theme.title")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <StableKeyboardAwareScrollView className="flex-1 bg-background rounded-b-xl">
        <View className="p-4">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            {t("settings.preferences.screens.theme.description")}
          </Text>
          <ThemeSwitcher classNames={{ trigger: "my-4" }} />
        </View>
      </StableKeyboardAwareScrollView>
    </StableSafeAreaView>
  );
};
