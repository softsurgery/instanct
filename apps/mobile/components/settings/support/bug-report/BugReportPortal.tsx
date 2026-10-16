import React from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react-native";
import { useApi } from "@/contexts/ApiContext";
import { Button } from "@softsurgery/mobile-ui";
import { Text } from "@softsurgery/mobile-ui";
import { View } from "react-native";
import { useBugReportFormStructure } from "./useBugReportFormStructure";
import { FormBuilder } from "@softsurgery/mobile-form-builder";
import { cn } from "@softsurgery/lib";
import { StableKeyboardAwareScrollView } from "@softsurgery/mobile-components";
import { router } from "expo-router";
import { StableSafeAreaView } from "@softsurgery/mobile-components";
import { ApplicationHeader } from "@softsurgery/mobile-components";
import { useTranslation } from "react-i18next";
import { createBugSchema } from "@/types/validations/system-reports.validation";
import { useReportBugStore } from "@/stores/useReportBugStore";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { toast } from "sonner-native";
import { ServerErrorResponse } from "@softsurgery/api-client";
import { Icon } from "@softsurgery/mobile-ui";
import * as Haptics from "expo-haptics";
import { BottomButtonWrapper } from "@softsurgery/mobile-components";

import { AppHeaderBack } from "@softsurgery/mobile-components";
interface BugReportPortalProps {
  className?: string;
}

export const BugReportPortal = ({ className }: BugReportPortalProps) => {
  const api = useApi();
  const { t } = useTranslation("settings");
  const isKeyboardVisible = useKeyboardVisible();
  const bugStore = useReportBugStore();

  React.useEffect(() => {
    return () => {
      bugStore.reset();
    };
  }, []);

  const { bugFormStructure } = useBugReportFormStructure({ store: bugStore });

  const { mutate: reportBug, isPending: isReportBugPending } = useMutation({
    mutationFn: async () => api.admin.bugReport.create(bugStore.createDto),
    onSuccess: () => {
      toast.success("Bug reported successfully", {
        description: "Your bug report has been successfully submitted.",
      });
      router.back();
      bugStore.reset();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error("Oops! Failed to submit bug report", {
        description:
          error.response?.data?.message ||
          "An error occurred while submitting your bug report.",
      });
    },
  });

  const handleSubmit = () => {
    const result = createBugSchema.safeParse(bugStore.createDto);
    if (!result.success) {
      bugStore.set("errors", result.error.flatten().fieldErrors);
    } else {
      reportBug();
    }
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("settings.support.screens.report-bug.forms.title")}
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
            {t("settings.support.screens.report-bug.forms.description")}
          </Text>
        </View>
        <FormBuilder structure={bugFormStructure} className="px-2" />
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
            disabled={isReportBugPending}
          >
            {isReportBugPending ? (
              <React.Fragment>
                <Icon
                  as={Loader2}
                  size={18}
                  className="text-primary-foreground animate-spin"
                />
                <Text className="text-primary-foreground font-semibold">
                  {t(
                    "settings.support.screens.report-bug.forms.actions.submit-bug-pending",
                  )}
                </Text>
              </React.Fragment>
            ) : (
              <Text className="text-md font-bold">
                {t(
                  "settings.support.screens.report-bug.forms.actions.submit-bug",
                )}
              </Text>
            )}
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
