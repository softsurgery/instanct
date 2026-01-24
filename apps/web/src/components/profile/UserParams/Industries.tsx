import React, { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { api } from "@/api";
import { useUserRefParamsStore } from "@/hooks/stores/useUserRefParamsStore";
import { ResponseRefParamDto } from "@/types";
import { IndustriesSection } from "./IndustriesSection";

interface IndustriesProps {
  className?: string;
  userId: string;
}

export const Industries = ({ className, userId }: IndustriesProps) => {
  const { t } = useTranslation("industries");
  const queryClient = useQueryClient();
  const {
    industries: selectedIndustryIds,
    setIndustries,
    resetIndustries,
  } = useUserRefParamsStore();

  const hasInitialized = useRef(false);

  const { data: allIndustries = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["all-industries"],
    queryFn: () => api.admin.refParam.findAll(),
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
        setIndustries(ids);
        hasInitialized.current = true;
      } else {
        setIndustries([]);
        hasInitialized.current = true;
      }
    }
  }, [userIndustries, isLoadingUserIndustries, setIndustries]);

  useEffect(() => {
    return () => {
      hasInitialized.current = false;
    };
  }, [userId]);

  const { mutate: updateIndustries, isPending: isMutationPending } =
    useMutation({
      mutationFn: async (industryIds: number[]) => {
        return api.admin.user.updateIndustries(userId, {
          industries: industryIds,
        });
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
        setIndustries(newIndustryIds);

        return { previousIndustries };
      },
      onSuccess: (data, newIndustryIds) => {
        toast.success(t("ref-params.industry.messages.updatedSuccess"));
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
          setIndustries(previousIds);
        } else {
          resetIndustries();
        }

        toast.error(error.message || t("messages.updateFailed"));
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["user-industries", userId],
        });
      },
    });

  const handleSelectIndustry = useCallback(
    (id: number) => {
      const newSelection = [...selectedIndustryIds, id];
      updateIndustries(newSelection);
    },
    [selectedIndustryIds, updateIndustries],
  );

  const handleRemoveIndustry = useCallback(
    (id: number) => {
      const newSelection = selectedIndustryIds.filter((i) => i !== id);
      updateIndustries(newSelection);
    },
    [selectedIndustryIds, updateIndustries],
  );

  const handleReset = useCallback(() => {
    updateIndustries([]);
    resetIndustries();
  }, [updateIndustries, resetIndustries]);

  const isLoading = isLoadingAll || isLoadingUserIndustries;

  return (
    <div className={cn("w-full max-w-md", className)}>
      <IndustriesSection
        allIndustries={allIndustries}
        selectedIndustryIds={selectedIndustryIds}
        isLoading={isLoading}
        isMutationPending={isMutationPending}
        onSelectIndustry={handleSelectIndustry}
        onRemoveIndustry={handleRemoveIndustry}
        onReset={handleReset}
      />
    </div>
  );
};
