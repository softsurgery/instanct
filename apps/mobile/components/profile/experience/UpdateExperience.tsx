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
import { useUserStore } from "@/stores/useUserStore";
import {
  ServerErrorResponse,
  UpdateExperienceDto,
} from "@softsurgery/api-client";
import { updateExperienceSchema } from "@/types/validations/experience.validation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUpdateExperienceFormStructure } from "./useUpdateExperienceFormStructure";
import { View } from "react-native";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { toast } from "sonner-native";
import React from "react";
import { ActionSheetRef } from "react-native-actions-sheet";
import { DeleteExperienceActionSheet } from "./DeleteExperienceActionSheet";

interface UpdateExperienceProps {
  className?: string;
}

export const UpdateExperience = ({ className }: UpdateExperienceProps) => {
  const api = useApi();
  const { t } = useTranslation("common");
  const { t: tMenu } = useTranslation("menu");
  const userStore = useUserStore();
  const queryClient = useQueryClient();
  const isKeyboardVisible = useKeyboardVisible();
  const deleteSheetRef = React.useRef<ActionSheetRef>(null);

  const { structure } = useUpdateExperienceFormStructure({
    store: userStore,
  });

  const { mutate: updateExperience, isPending } = useMutation({
    mutationFn: (data: { id: number; experience: UpdateExperienceDto }) =>
      api.experience.update(data.id, data.experience),
    onSuccess: () => {
      toast.success(tMenu("experience.toasts.updated"), {
        description: tMenu("experience.toasts.updatedDescription"),
      });
      queryClient.invalidateQueries({
        queryKey: ["experiences"],
      });
      router.back();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message || tMenu("experience.toasts.error"),
        {},
      );
    },
  });

  const { mutate: deleteExperience, isPending: isDeletePending } = useMutation({
    mutationFn: (id: number) => api.experience.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["experiences"],
      });
      toast.success(tMenu("experience.toasts.deleted"), {
        description: tMenu("experience.toasts.deletedDescription"),
      });
      deleteSheetRef.current?.hide();
      router.back();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message || tMenu("experience.toasts.error"),
        {},
      );
    },
  });

  const onDeleteExperiencePress = () => {
    deleteSheetRef.current?.show();
  };

  const onConfirmDeleteExperience = () => {
    const experienceId = useUserStore.getState().responseExperience?.id;
    if (!experienceId) {
      toast.error(tMenu("experience.toasts.noSelection"));
      return;
    }
    deleteExperience(experienceId);
  };

  const handleUpdateSubmit = () => {
    const state = useUserStore.getState();
    const experienceId = state.responseExperience?.id;
    const data = state.present
      ? { ...state.updateExperienceDto, endDate: null }
      : state.updateExperienceDto;
    const result = updateExperienceSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      state.set("experienceErrors", fieldErrors);
      const firstError = Object.values(fieldErrors).find(
        (messages) => messages?.[0],
      )?.[0];
      toast.error(
        firstError ? tMenu(firstError) : tMenu("experience.toasts.error"),
      );
      return;
    }

    if (!experienceId) {
      toast.error(tMenu("experience.toasts.noSelection"));
      return;
    }

    updateExperience({
      id: experienceId,
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
        title={t("screens.experience")}
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
            {tMenu("experience.form.description")}
          </Text>
        </View>
        <FormBuilder structure={structure} className="px-2" />
      </StableKeyboardAwareScrollView>

      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button
            size="sm"
            className="rounded-xl"
            disabled={isPending || isDeletePending}
            onPress={handleUpdateSubmit}
          >
            <Text className="text-md font-bold">
              {tMenu("experience.form.actions.update")}
            </Text>
          </Button>
          <Button
            size="sm"
            variant="destructive-outline"
            className="rounded-xl"
            disabled={isPending || isDeletePending}
            onPress={onDeleteExperiencePress}
          >
            <Text className="text-md font-bold">
              {tMenu("experience.delete.title")}
            </Text>
          </Button>
        </BottomButtonWrapper>
      )}

      <DeleteExperienceActionSheet
        ref={deleteSheetRef}
        onConfirm={onConfirmDeleteExperience}
        onClose={() => deleteSheetRef.current?.hide()}
        isPending={isDeletePending}
      />
    </StableSafeAreaView>
  );
};
