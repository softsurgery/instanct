import React from "react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useUserRefParamsStore } from "@/hooks/stores/useUserRefParamsStore";
import { TreeSelectBox } from "@instanct/form-builder";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface IndustriesProps {
  className?: string;
  userId: string;
}

export const Industries = ({ className, userId }: IndustriesProps) => {
  const { industries: selectedIndustries, set } = useUserRefParamsStore();
  const { t } = useTranslation("user-management");

  const { industries: treeData, isIndustriesPending } = useIndustries();

  const handleSelectIndustry = (id: number | string) => {
    set("industries", [...selectedIndustries, id as number]);
  };

  const handleRemoveIndustry = (id: number | string) => {
    set(
      "industries",
      selectedIndustries.filter((i) => i !== id),
    );
  };

  const { mutate: updateIndustries, isPending: isMutationPending } =
    useMutation({
      mutationFn: async (industryIds: number[]) =>
        api.admin.user.updateIndustries(userId, industryIds),
      onSuccess: () => {
        toast.success(
          t(
            "userManagement.inspect.books.ref-params.industry.messages.updatedSuccess",
          ),
        );
      },
      onError: (error) => {
        toast.error(error.message || t("messages.updateFailed"));
      },
    });

  const handleSave = () => {
    updateIndustries(selectedIndustries);
  };

  const isPending = isIndustriesPending || isMutationPending;

  return (
    <div className={cn("w-full", className)}>
      <TreeSelectBox
        params={treeData}
        selected={selectedIndustries}
        isPending={isPending}
        onSelectParam={handleSelectIndustry}
        onRemoveParam={handleRemoveIndustry}
        onSave={handleSave}
      />
    </div>
  );
};
