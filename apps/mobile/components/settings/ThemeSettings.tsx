import React from "react";
import { View } from "react-native";
import { Text } from "@instanct/mobile-ui";
import { cn } from "@instanct/lib";
import { StableKeyboardAwareScrollView } from "@instanct/mobile-components";
import { StableSafeAreaView } from "@instanct/mobile-components";
import { useTranslation } from "react-i18next";
import { ApplicationHeader } from "@instanct/mobile-components";
import { ThemeSwitcher } from "../shared/ThemeSwitcher";
import { AppHeaderBack } from "@instanct/mobile-components";

interface ThemeSettingsPortalProps {
  className?: string;
}

export const ThemeSettingsPortal = ({
  className,
}: ThemeSettingsPortalProps) => {
  const { t } = useTranslation("settings");

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2 bg-transparent" }}
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
      <StableKeyboardAwareScrollView className="flex-1 bg-background">
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
