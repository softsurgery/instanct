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
  UpdateEducationDto,
} from "@softsurgery/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUpdateEducationFormStructure } from "./useUpdateEducationFormStructure";
import { updateEducationSchema } from "@/types/validations/education.validation";
import { View } from "react-native";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { toast } from "sonner-native";
import React from "react";
import { ActionSheetRef } from "react-native-actions-sheet";
import { DeleteEducationActionSheet } from "./DeleteEducationActionSheet";

interface UpdateEducationProps {
  className?: string;
}

export const UpdateEducation = ({ className }: UpdateEducationProps) => {
  const api = useApi();
  const { t } = useTranslation("common");
  const { t: tMenu } = useTranslation("menu");
  const userStore = useUserStore();
  const queryClient = useQueryClient();
  const isKeyboardVisible = useKeyboardVisible();
  const deleteSheetRef = React.useRef<ActionSheetRef>(null);

  const { structure } = useUpdateEducationFormStructure({
    store: userStore,
  });

  const { mutate: updateEducation, isPending } = useMutation({
    mutationFn: (data: { id: number; education: UpdateEducationDto }) =>
      api.education.update(data.id, data.education),
    onSuccess: () => {
      toast.success(tMenu("education.toasts.updated"), {
        description: tMenu("education.toasts.updatedDescription"),
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

  const { mutate: deleteEducation, isPending: isDeletePending } = useMutation({
    mutationFn: (id: number) => api.education.remove(id),
    onSuccess: () => {
      toast.success(tMenu("education.toasts.deleted"), {
        description: tMenu("education.toasts.deletedDescription"),
      });
      queryClient.invalidateQueries({
        queryKey: ["educations"],
      });
      deleteSheetRef.current?.hide();
      router.back();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message || tMenu("education.toasts.error"),
        {},
      );
    },
  });

  const onDeleteEducationPress = () => {
    deleteSheetRef.current?.show();
  };

  const onConfirmDeleteEducation = () => {
    const educationId = useUserStore.getState().responseEducation?.id;
    if (!educationId) {
      toast.error(tMenu("education.toasts.noSelection"));
      return;
    }
    deleteEducation(educationId);
  };

  const handleUpdateSubmit = () => {
    const state = useUserStore.getState();
    const educationId = state.responseEducation?.id;
    const result = updateEducationSchema.safeParse(state.updateEducationDto);

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

    if (!educationId) {
      toast.error(tMenu("education.toasts.noSelection"));
      return;
    }

    updateEducation({
      id: educationId,
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
            size="sm"
            className="rounded-xl"
            disabled={isPending || isDeletePending}
            onPress={handleUpdateSubmit}
          >
            <Text className="text-md font-bold">
              {tMenu("education.form.actions.update")}
            </Text>
          </Button>
          <Button
            size="sm"
            variant="destructive-outline"
            className="rounded-xl"
            disabled={isPending || isDeletePending}
            onPress={onDeleteEducationPress}
          >
            <Text className="text-md font-bold">
              {tMenu("education.delete.title")}
            </Text>
          </Button>
        </BottomButtonWrapper>
      )}

      <DeleteEducationActionSheet
        ref={deleteSheetRef}
        onConfirm={onConfirmDeleteEducation}
        onClose={() => deleteSheetRef.current?.hide()}
        isPending={isDeletePending}
      />
    </StableSafeAreaView>
  );
};
