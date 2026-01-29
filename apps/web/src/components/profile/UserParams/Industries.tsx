import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { api } from "@/api";
import { useUserRefParamsStore } from "@/hooks/stores/useUserRefParamsStore";
import { ResponseRefParamDto } from "@/types";
import { SelectBox } from "@/components/shared/SelectBox";

interface IndustriesProps {
  className?: string;
  userId: string;
}

export const Industries = ({ className, userId }: IndustriesProps) => {
  const { t } = useTranslation("user-management");
  const queryClient = useQueryClient();
  const { industries: selectedIndustryIds, setIndustries } =
    useUserRefParamsStore();

  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasInitialized = useRef(false);

  const { data: allIndustries = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["all-industries"],
    queryFn: () => api.admin.refParam.findAllIndustries(),
    select: (data) =>
      data.map((refParam: ResponseRefParamDto) => ({
        id: refParam.id,
        name: refParam.label,
      })),
  });

  const { data: userIndustries = [], isLoading: isLoadingUserIndustries } =
    useQuery({
      queryKey: ["user-industries", userId],
      queryFn: async () => {
        const industryIds = await api.admin.user.getIndustries(userId);

        if (!industryIds || industryIds.length === 0) {
          return [];
        }

        const promises = industryIds.map(async (id) => {
          try {
            const refParam = await api.admin.refParam.findById(id);
            return {
              id: refParam.id,
              name: refParam.label,
            };
          } catch (error) {
            console.error(`Failed to fetch industry ID ${id}:`, error);
            return null;
          }
        });

        const results = await Promise.all(promises);
        return results.filter(
          (industry): industry is { id: number; name: string } =>
            industry !== null,
        );
      },
    });

  useEffect(() => {
    if (!hasInitialized.current && !isLoadingUserIndustries) {
      if (userIndustries && userIndustries.length > 0) {
        const ids = userIndustries.map((ind) => ind.id);
        setLocalSelectedIds(ids);
        setIndustries(ids);
        hasInitialized.current = true;
      } else {
        setLocalSelectedIds([]);
        setIndustries([]);
        hasInitialized.current = true;
      }
    }
  }, [userIndustries, isLoadingUserIndustries, setIndustries]);

  const { mutate: updateIndustries, isPending: isMutationPending } =
    useMutation({
      mutationFn: async (industryIds: number[]) => {
        return api.admin.user.updateIndustries(userId, industryIds);
      },
      onMutate: async (newIndustryIds) => {
        await queryClient.cancelQueries({
          queryKey: ["user-industries", userId],
        });

        const previousIndustries = queryClient.getQueryData([
          "user-industries",
          userId,
        ]);

        const optimisticIndustries = allIndustries.filter((industry) =>
          newIndustryIds.includes(industry.id),
        );

        queryClient.setQueryData(
          ["user-industries", userId],
          optimisticIndustries,
        );

        return { previousIndustries };
      },
      onSuccess: (data, newIndustryIds) => {
        toast.success(
          t(
            "userManagement.inspect.books.ref-params.industry.messages.updatedSuccess",
          ),
        );

        setLocalSelectedIds(newIndustryIds);
        setIndustries(newIndustryIds);
        setHasUnsavedChanges(false);

        const updatedIndustries = allIndustries.filter((industry) =>
          newIndustryIds.includes(industry.id),
        );
        queryClient.setQueryData(
          ["user-industries", userId],
          updatedIndustries,
        );
      },
      onError: (error, newIndustryIds, context) => {
        queryClient.setQueryData(
          ["user-industries", userId],
          context?.previousIndustries,
        );

        if (context?.previousIndustries) {
          const previousIds = (
            context.previousIndustries as Array<{ id: number; name: string }>
          ).map((ind) => ind.id);
          setLocalSelectedIds(previousIds);
          setIndustries(previousIds);
        }

        toast.error(error.message || t("messages.updateFailed"));
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["user-industries", userId],
        });
      },
    });

  const handleSelectIndustry = useCallback((id: number) => {
    setLocalSelectedIds((prev) => {
      const newSelection = [...prev, id];
      setHasUnsavedChanges(true);
      return newSelection;
    });
  }, []);

  const handleRemoveIndustry = useCallback((id: number) => {
    setLocalSelectedIds((prev) => {
      const newSelection = prev.filter((i) => i !== id);
      setHasUnsavedChanges(true);
      return newSelection;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!isMutationPending && hasUnsavedChanges) {
      updateIndustries(localSelectedIds);
    }
  }, [
    localSelectedIds,
    updateIndustries,
    isMutationPending,
    hasUnsavedChanges,
  ]);

  const handleReset = useCallback(() => {
    if (!isMutationPending) {
      setLocalSelectedIds([]);
      setHasUnsavedChanges(true);
    }
  }, [isMutationPending]);

  const handleCancel = useCallback(() => {
    if (!isMutationPending && hasUnsavedChanges) {
      setLocalSelectedIds(selectedIndustryIds);
      setHasUnsavedChanges(false);
    }
  }, [selectedIndustryIds, isMutationPending, hasUnsavedChanges]);

  const isLoading = isLoadingAll || isLoadingUserIndustries;

  return (
    <div className={cn("w-full max-w-md", className)}>
      <SelectBox
        allParams={allIndustries}
        selectedParamIds={localSelectedIds}
        isLoading={isLoading}
        isMutationPending={isMutationPending}
        //should i keep this ??? hasUnsavedChanges ig yes it helps
        hasUnsavedChanges={hasUnsavedChanges}
        onSelectParam={handleSelectIndustry}
        onRemoveParam={handleRemoveIndustry}
        onSave={handleSave}
        onReset={handleReset}
        onCancel={handleCancel}
      />
    </div>
  );
};
