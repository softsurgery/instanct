import React from "react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useUserRefParamsStore } from "@/hooks/stores/useUserRefParamsStore";
import { SelectBox } from "@/components/shared/form-builder/SelectBox";
import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { mapToSelectOptions } from "@/components/shared/form-builder/utils/mapToSelectOptions";
import { api } from "@/api";
import { toast } from "sonner";

interface ObjectivesProps {
  className?: string;
  userId: string;
}

export const Objectives = ({ className, userId }: ObjectivesProps) => {
  const userRefParamStore = useUserRefParamsStore();
  const { t } = useTranslation("user-management");

  const { objectives, isObjectivesPending } = useObjectives();

  const handleSelectObjectif = (id: number | string) => {
    userRefParamStore.set("objectives", [...userRefParamStore.objectives, id]);
  };

  const handleRemoveObjectif = (id: number | string) => {
    userRefParamStore.set(
      "objectives",
      userRefParamStore.objectives.filter((i) => i !== id),
    );
  };

  const { mutate: updateObjectives, isPending: isMutationPending } =
    useMutation({
      mutationFn: async (objectifIds: number[]) =>
        api.admin.user.updateObjectives(userId, objectifIds),
      onSuccess: () => {
        toast.success(
          t(
            "userManagement.inspect.books.ref-params.objectif.messages.updatedSuccess",
          ),
        );
      },
      onError: (error) => {
        toast.error(error.message || t("messages.updateFailed"));
      },
    });

  const handleSave = () => {
    const ObjectifIds = userRefParamStore.objectives;
    updateObjectives(ObjectifIds);
  };

  const isPending = isObjectivesPending || isMutationPending;

  return (
    <div className={cn("w-full", className)}>
      <SelectBox
        params={mapToSelectOptions({
          data: objectives,
          labelKey: "label",
          valueKey: "id",
        })}
        selected={userRefParamStore.objectives}
        isPending={isPending}
        onSelectParam={handleSelectObjectif}
        onRemoveParam={handleRemoveObjectif}
        onSave={handleSave}
      />
    </div>
  );
};
