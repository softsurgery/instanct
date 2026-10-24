import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApi } from "@/contexts/ApiContext";
import { View } from "react-native";
import { Loader2 } from "lucide-react-native";
import { Text, Button, Icon } from "@softsurgery/mobile-ui";
import { createFeedbackSchema } from "~/types/validations/system-reports.validation";
import { FormBuilder } from "@softsurgery/mobile-form-builder";
import { useSendFeedbackFormStructure } from "./useSendFeedbackFormStructure";
import { cn } from "@softsurgery/lib";
import {
  StableKeyboardAwareScrollView,
  StableSafeAreaView,
  ApplicationHeader,
  BottomButtonWrapper,
  AppHeaderBack,
} from "@softsurgery/mobile-components";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSendFeedbackStore } from "@/stores/useFeedbackStore";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import {
  ServerErrorResponse,
  ResponseUserDeviceDto,
  CreateFeedbackDto,
} from "@softsurgery/api-client";
import { toast } from "sonner-native";
import * as Haptics from "expo-haptics";

import { useCurrentDeviceMac } from "@/hooks/useCurrentDeviceMac";
import { getCurrentDevice } from "@/lib/device";

interface SendFeedbackPortalProps {
  className?: string;
}

export const SendFeedbackPortal = ({ className }: SendFeedbackPortalProps) => {
  const api = useApi();
  const { t } = useTranslation("settings");
  const isKeyboardVisible = useKeyboardVisible();
  const sendFeedbackStore = useSendFeedbackStore();
  const currentMacAddress = useCurrentDeviceMac();

  const { data: devices = [] } = useQuery<ResponseUserDeviceDto[]>({
    queryKey: ["user-devices"],
    queryFn: async () => api.userDevices.getAll(),
  });

  const currentDevice = React.useMemo(
    () => getCurrentDevice(devices, currentMacAddress),
    [devices, currentMacAddress],
  );

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
      mutationFn: async (payload: CreateFeedbackDto) =>
        api.admin.feedback.create(payload),
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
    const payload: CreateFeedbackDto = {
      ...sendFeedbackStore.createDto,
      deviceId: currentDevice?.id,
    };
    const result = createFeedbackSchema.safeParse(payload);
    if (!result.success) {
      sendFeedbackStore.set("errors", result.error.flatten().fieldErrors);
    } else {
      sendFeedback(payload);
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
        <View className="p-4">
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
