import React from "react";
import { View } from "react-native";
import { Loader2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { cn } from "@softsurgery/lib";
import { ApplicationHeader } from "@softsurgery/mobile-components";
import { StableSafeAreaView } from "@softsurgery/mobile-components";
import { StableKeyboardAwareScrollView } from "@softsurgery/mobile-components";
import { Button } from "@softsurgery/mobile-ui";
import { Icon } from "@softsurgery/mobile-ui";
import { Text } from "@softsurgery/mobile-ui";
import { FormBuilder } from "@softsurgery/mobile-form-builder";
import { useChangePasswordFormStructure } from "./useChangePasswordFormStructure";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { useUserStore } from "@/stores/useUserStore";
import { useMutation } from "@tanstack/react-query";
import { useApi } from "@/contexts/ApiContext";
import { toast } from "sonner-native";
import { ServerErrorResponse } from "@softsurgery/api-client";
import * as Haptics from "expo-haptics";
import { useLogout } from "@/hooks/useLogout";
import { BottomButtonWrapper } from "@softsurgery/mobile-components";

import { AppHeaderBack } from "@softsurgery/mobile-components";
interface ChangePasswordProps {
  className?: string;
}

export const ChangePassword = ({ className }: ChangePasswordProps) => {
  const api = useApi();
  const { t } = useTranslation("settings");
  const userStore = useUserStore();
  const isKeyboardVisible = useKeyboardVisible();
  const logout = useLogout();

  const { structure } = useChangePasswordFormStructure({
    store: userStore,
  });

  const { mutate: updatePassword, isPending } = useMutation({
    mutationFn: async () =>
      api.clientAuth.updatePassword({
        currentPassword: userStore.updatePasswordDto.currentPassword!,
        newPassword: userStore.updatePasswordDto.newPassword!,
      }),
    onSuccess: () => {
      toast.success("Password updated successfully.");
      logout();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(error.response?.data?.message || "Failed to update password");
    },
  });

  const handleSave = () => {
    const { currentPassword, newPassword, confirmPassword } =
      userStore.updatePasswordDto;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    updatePassword();
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t(
          "settings.account.screens.privacy-security.screens.account-security.change-password.forms.title",
        )}
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
            {t(
              "settings.account.screens.privacy-security.screens.account-security.change-password.forms.description",
            )}
          </Text>
        </View>
        <FormBuilder structure={structure} className="px-2" />
      </StableKeyboardAwareScrollView>

      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button
            size="lg"
            className="rounded-xl"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleSave();
            }}
            disabled={isPending}
          >
            {isPending ? (
              <React.Fragment>
                <Icon
                  as={Loader2}
                  size={18}
                  className="text-primary-foreground animate-spin"
                />
                <Text className="text-primary-foreground font-semibold">
                  {t(
                    "settings.account.screens.privacy-security.screens.account-security.change-password.forms.actions.updating-password",
                  )}
                </Text>
              </React.Fragment>
            ) : (
              <Text className="text-md font-bold">
                {t(
                  "settings.account.screens.privacy-security.screens.account-security.change-password.forms.actions.update-password",
                )}
              </Text>
            )}
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
