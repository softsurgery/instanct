import React from "react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useUserRefParamsStore } from "@/hooks/stores/useUserRefParamsStore";
import { SelectBox } from "@/components/shared/form-builder/SelectBox";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { mapToSelectOptions } from "@/components/shared/form-builder/utils/mapToSelectOptions";
import { api } from "@/api";
import { toast } from "sonner";

interface IndustriesProps {
  className?: string;
  userId: string;
}

export const Industries = ({ className, userId }: IndustriesProps) => {
  const userRefParamStore = useUserRefParamsStore();
  const queryClient = useQueryClient();
  const { t } = useTranslation("user-management");

  const { industries, isIndustriesPending } = useIndustries();

  const handleSelectIndustry = (id: number | string) => {
    userRefParamStore.set("industries", [...userRefParamStore.industries, id]);
  };

  const handleRemoveIndustry = (id: number | string) => {
    userRefParamStore.set(
      "industries",
      userRefParamStore.industries.filter((i) => i !== id),
    );
  };

  const { mutate: updateIndustries, isPending: isMutationPending } =
    useMutation({
      mutationFn: async (industryIds: number[]) => {
        return api.admin.user.updateIndustries(userId, industryIds);
      },
      onSuccess: () => {
        toast.success(
          t(
            "userManagement.inspect.books.ref-params.industry.messages.updatedSuccess",
          ),
        );
        queryClient.invalidateQueries({
          queryKey: ["identified-user", userId],
        });
      },
      onError: (error) => {
        toast.error(error.message || t("messages.updateFailed"));
      },
    });

  const handleSave = () => {
    const industryIds = userRefParamStore.industries.map((id) =>
      typeof id === "string" ? parseInt(id, 10) : id,
    );
    updateIndustries(industryIds);
  };

  const isPending = isIndustriesPending || isMutationPending;

  return (
    <div className={cn("w-full max-w-md", className)}>
      <SelectBox
        params={mapToSelectOptions({
          data: industries,
          labelKey: "label",
          valueKey: "id",
        })}
        selected={userRefParamStore.industries}
        isPending={isPending}
        onSelectParam={handleSelectIndustry}
        onRemoveParam={handleRemoveIndustry}
        onSave={handleSave}
      />
    </div>
  );
};
