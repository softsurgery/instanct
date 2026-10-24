import {
  ApplicationHeader,
  StableKeyboardAwareScrollView,
  StableSafeAreaView,
  AppHeaderBack,
  BottomButtonWrapper,
} from "@softsurgery/mobile-components";
import { FormBuilder } from "@softsurgery/mobile-form-builder";
import { Button, Text } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useUserStore } from "@/stores/useUserStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCreateEducationFormStructure } from "./useCreateEducationFormStructure";
import {
  CreateEducationDto,
  ServerErrorResponse,
} from "@softsurgery/api-client";
import { useApi } from "@/contexts/ApiContext";
import { useTranslation } from "react-i18next";
import { createEducationSchema } from "@/types/validations/education.validation";
import { View } from "react-native";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { toast } from "sonner-native";
import React from "react";

interface CreateEducationProps {
  className?: string;
}

export const CreateEducation = ({ className }: CreateEducationProps) => {
  const api = useApi();
  const { t } = useTranslation("common");
  const { t: tMenu } = useTranslation("menu");
  const userStore = useUserStore();
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const isKeyboardVisible = useKeyboardVisible();

  const { structure } = useCreateEducationFormStructure({
    store: userStore,
  });

  const { mutate: createEducation, isPending } = useMutation({
    mutationFn: (data: { id: string; education: CreateEducationDto }) =>
      api.education.create(data.id, data.education),
    onSuccess: () => {
      toast.success(tMenu("education.toasts.created"), {
        description: tMenu("education.toasts.createdDescription"),
      });
      queryClient.invalidateQueries({
        queryKey: ["educations"],
      });
      router.back();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message || tMenu("education.toasts.error"),
        {},
      );
    },
  });

  const handleCreateSubmit = () => {
    const state = useUserStore.getState();
    const result = createEducationSchema.safeParse(state.createEducationDto);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      state.set("educationErrors", fieldErrors);
      const firstError = Object.values(fieldErrors).find(
        (messages) => messages?.[0],
      )?.[0];
      toast.error(
        firstError ? tMenu(firstError) : tMenu("education.toasts.error"),
      );
      return;
    }

    if (!currentUser?.id) {
      toast.error(tMenu("education.toasts.error"));
      return;
    }

    createEducation({
      id: currentUser.id,
      education: result.data,
    });
  };

  React.useEffect(() => {
    return () => {
      useUserStore.getState().resetEducationDraft();
    };
  }, []);

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.education")}
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
            {tMenu("education.form.description")}
          </Text>
        </View>
        <FormBuilder structure={structure} className="px-2" />
      </StableKeyboardAwareScrollView>
      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button
            size="lg"
            className="rounded-xl"
            disabled={isPending}
            onPress={handleCreateSubmit}
          >
            <Text className="text-md font-bold">
              {tMenu("education.form.actions.create")}
            </Text>
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
