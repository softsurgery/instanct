import React from "react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useUserRefParamsStore } from "@/hooks/stores/useUserRefParamsStore";
import { SelectBox } from "@/components/shared/form-builder/SelectBox";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { mapToSelectOptions } from "@/components/shared/form-builder/utils/mapToSelectOptions";

interface IndustriesProps {
  className?: string;
}

export const Industries = ({ className }: IndustriesProps) => {
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

  const handleSave = () => {};

  const isPending = isIndustriesPending;

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
