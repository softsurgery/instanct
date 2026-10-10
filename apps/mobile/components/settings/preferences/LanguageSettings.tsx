import React from "react";
import { View } from "react-native";
import { Text } from "@instanct/mobile-ui";
import { cn } from "@instanct/lib";
import { StableKeyboardAwareScrollView } from "@instanct/mobile-components";
import { StableSafeAreaView } from "@instanct/mobile-components";
import { useTranslation } from "react-i18next";
import { ApplicationHeader } from "@instanct/mobile-components";
import { LanguageSwitcher } from "@instanct/mobile-components";

import { AppHeaderBack } from "@instanct/mobile-components";
interface LanguageSettingsPortalProps {
  className?: string;
}

export const LanguageSettingsPortal = ({
  className,
}: LanguageSettingsPortalProps) => {
  const { t } = useTranslation("settings");

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2 bg-transparent" }}
        title={t("settings.preferences.screens.language.title")}
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
            {t("settings.preferences.screens.language.description")}
          </Text>
          <LanguageSwitcher classNames={{ trigger: "my-4" }} />
        </View>
      </StableKeyboardAwareScrollView>
    </StableSafeAreaView>
  );
};
