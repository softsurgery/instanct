import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useApi } from "@/contexts/ApiContext";
import { View } from "react-native";
import { Loader2 } from "lucide-react-native";
import { Text } from "@softsurgery/mobile-ui";
import { createFeedbackSchema } from "~/types/validations/system-reports.validation";
import { Button } from "@softsurgery/mobile-ui";
import { FormBuilder } from "@softsurgery/mobile-form-builder";
import { useSendFeedbackFormStructure } from "./useSendFeedbackFormStructure";
import { cn } from "@softsurgery/lib";
import { StableKeyboardAwareScrollView } from "@softsurgery/mobile-components";
import { router } from "expo-router";
import { StableSafeAreaView } from "@softsurgery/mobile-components";
import { useTranslation } from "react-i18next";
import { ApplicationHeader } from "@softsurgery/mobile-components";
import { useSendFeedbackStore } from "@/stores/useFeedbackManager";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { ServerErrorResponse } from "@softsurgery/api-client";
import { toast } from "sonner-native";
import { Icon } from "@softsurgery/mobile-ui";
import * as Haptics from "expo-haptics";
import { BottomButtonWrapper } from "@softsurgery/mobile-components";

import { AppHeaderBack } from "@softsurgery/mobile-components";
interface SendFeedbackPortalProps {
  className?: string;
}

export const SendFeedbackPortal = ({ className }: SendFeedbackPortalProps) => {
  const api = useApi();
  const { t } = useTranslation("settings");
  const isKeyboardVisible = useKeyboardVisible();
  const sendFeedbackStore = useSendFeedbackStore();

  React.useEffect(() => {
    return () => {
      sendFeedbackStore.reset();
    };
  }, []);

  const { feedbackFormStructure } = useSendFeedbackFormStructure({
    store: sendFeedbackStore,
  });

  const { mutate: sendFeedback, isPending: isSendFeedbackPending } =
    useMutation({
      mutationFn: async () => api.admin.feedback.create(sendFeedbackStore.createDto),
      onSuccess: () => {
        toast.success("Feedback submitted successfully", {
          description: "Your feedback has been successfully submitted.",
        });
        router.back();
        sendFeedbackStore.reset();
      },
      onError: (error: ServerErrorResponse) => {
        toast.error("Oops! Failed to submit feedback", {
          description:
            error.response?.data?.message ||
            "An error occurred while submitting your feedback.",
        });
      },
    });

  const handleSubmit = () => {
    const result = createFeedbackSchema.safeParse(sendFeedbackStore.createDto);
    if (!result.success) {
      sendFeedbackStore.set("errors", result.error.flatten().fieldErrors);
    } else {
      sendFeedback();
    }
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("settings.support.screens.send-feedback.title")}
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
        <View className="px-5 pt-4 pb-2">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            {t("settings.support.screens.send-feedback.description")}
          </Text>
        </View>
        <FormBuilder structure={feedbackFormStructure} className="px-2" />
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button
            size="lg"
            className="rounded-xl"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleSubmit();
            }}
            disabled={isSendFeedbackPending}
          >
            {isSendFeedbackPending ? (
              <React.Fragment>
                <Icon
                  as={Loader2}
                  size={18}
                  className="text-primary-foreground animate-spin"
                />
                <Text className="text-primary-foreground font-semibold">
                  {t(
                    "settings.support.screens.send-feedback.forms.actions.submit-feedback-pending",
                  )}
                </Text>
              </React.Fragment>
            ) : (
              <Text className="text-md font-bold">
                {t(
                  "settings.support.screens.send-feedback.forms.actions.submit-feedback",
                )}
              </Text>
            )}
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
