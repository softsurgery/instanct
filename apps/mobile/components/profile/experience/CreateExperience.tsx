import { useApi } from "@/contexts/ApiContext";
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
import { CreateExperienceDto, ServerErrorResponse } from "api-client";
import { createExperienceSchema } from "@/types/validations/experience.validation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useKeyboardVisible } from "@softsurgery/mobile-hooks";
import { useCreateExperienceFormStructure } from "./useCreateExperienceFormStructure";
import { toast } from "sonner-native";
import React from "react";

interface CreateExperienceProps {
  className?: string;
}

export const CreateExperience = ({ className }: CreateExperienceProps) => {
  const api = useApi();
  const { t } = useTranslation("menu");
  const isKeyboardVisible = useKeyboardVisible();
  const userStore = useUserStore();
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const { structure } = useCreateExperienceFormStructure({
    store: userStore,
  });

  const { mutate: createExperience, isPending } = useMutation({
    mutationFn: (data: { id: string; experience: CreateExperienceDto }) =>
      api.experience.create(data.id, data.experience),
    onSuccess: () => {
      toast.success(t("experience.toasts.created"), {
        description: t("experience.toasts.createdDescription"),
      });
      queryClient.invalidateQueries({
        queryKey: ["experiences"],
      });
      router.back();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message || t("experience.toasts.error"),
        {},
      );
    },
  });

  const handleCreateSubmit = () => {
    const state = useUserStore.getState();
    const data = state.present
      ? { ...state.createExperienceDto, endDate: null }
      : state.createExperienceDto;
    const result = createExperienceSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      state.set("experienceErrors", fieldErrors);
      const firstError = Object.values(fieldErrors).find(
        (messages) => messages?.[0],
      )?.[0];
      toast.error(firstError ? t(firstError) : t("experience.toasts.error"));
      return;
    }

    if (!currentUser?.id) {
      toast.error(t("experience.toasts.error"));
      return;
    }

    createExperience({
      id: currentUser.id,
      experience: result.data,
    });
  };

  React.useEffect(() => {
    return () => {
      useUserStore.getState().resetExperienceDraft();
    };
  }, []);

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("experience.form.createHeader")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />

      {/* Scrollable content */}
      <StableKeyboardAwareScrollView className="flex-1 bg-background">
        <View className="p-4">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            {t("experience.form.description")}
          </Text>
        </View>
        <FormBuilder structure={structure} className="px-2" />
      </StableKeyboardAwareScrollView>

      {/* Sticky bottom button */}
      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button
            size="lg"
            className="rounded-xl"
            disabled={isPending}
            onPress={handleCreateSubmit}
          >
            <Text className="text-md font-bold">
              {t("experience.form.actions.create")}
            </Text>
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
