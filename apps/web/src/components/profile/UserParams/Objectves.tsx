import React, { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { api } from "@/api";
import { useUserRefParamsStore } from "@/hooks/stores/useUserRefParamsStore";
import { ResponseRefParamDto } from "@/types";
import { ObjectivesSection } from "./ObjectivesSection";

interface ObjectivesProps {
  className?: string;
  userId: string;
}

export const Objectives = ({ className, userId }: ObjectivesProps) => {
  const { t } = useTranslation("user-management");
  const queryClient = useQueryClient();
  const {
    objectives: selectedObjectiveIds,
    setObjectives,
    resetObjectives,
  } = useUserRefParamsStore();

  const hasInitialized = useRef(false);

  const { data: allObjectives = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["all-objectives"],
    queryFn: () => api.admin.refParam.findAllObjectifs(),
    select: (data) =>
      data.map((refParam: ResponseRefParamDto) => ({
        id: refParam.id,
        name: refParam.label,
      })),
  });

  const { data: userObjectives = [], isLoading: isLoadingUserObjectives } =
    useQuery({
      queryKey: ["user-objectives", userId],
      queryFn: async () => {
        const objectiveIds = await api.admin.user.getObjectives(userId);

        if (!objectiveIds || objectiveIds.length === 0) {
          return [];
        }

        const promises = objectiveIds.map(async (id) => {
          try {
            const refParam = await api.admin.refParam.findById(id);
            return {
              id: refParam.id,
              name: refParam.label,
            };
          } catch (error) {
            console.error(`Failed to fetch objective ID ${id}:`, error);
            return null;
          }
        });

        const results = await Promise.all(promises);
        return results.filter(
          (objective): objective is { id: number; name: string } =>
            objective !== null,
        );
      },
    });

  useEffect(() => {
    if (!hasInitialized.current && !isLoadingUserObjectives) {
      if (userObjectives && userObjectives.length > 0) {
        const ids = userObjectives.map((obj) => obj.id);
        setObjectives(ids);
        hasInitialized.current = true;
      } else {
        setObjectives([]);
        hasInitialized.current = true;
      }
    }
  }, [userObjectives, isLoadingUserObjectives, setObjectives]);

  useEffect(() => {
    return () => {
      hasInitialized.current = false;
    };
  }, [userId]);

  const { mutate: updateObjectives, isPending: isMutationPending } =
    useMutation({
      mutationFn: async (objectiveIds: number[]) => {
        return api.admin.user.updateIndustries(userId, objectiveIds);
      },
      onMutate: async (newObjectiveIds) => {
        await queryClient.cancelQueries({
          queryKey: ["user-objectives", userId],
        });

        const previousObjectives = queryClient.getQueryData([
          "user-objectives",
          userId,
        ]);

        const optimisticObjectives = allObjectives.filter((objective) =>
          newObjectiveIds.includes(objective.id),
        );

        queryClient.setQueryData(
          ["user-objectives", userId],
          optimisticObjectives,
        );
        setObjectives(newObjectiveIds);

        return { previousObjectives };
      },
      onSuccess: (data, newObjectiveIds) => {
        toast.success(
          t(
            "userManagement.inspect.books.ref-params.objective.messages.updatedSuccess",
          ),
        );
        const updatedObjectives = allObjectives.filter((objective) =>
          newObjectiveIds.includes(objective.id),
        );
        queryClient.setQueryData(
          ["user-objectives", userId],
          updatedObjectives,
        );
      },
      onError: (error, newObjectiveIds, context) => {
        queryClient.setQueryData(
          ["user-objectives", userId],
          context?.previousObjectives,
        );

        if (context?.previousObjectives) {
          const previousIds = (
            context.previousObjectives as Array<{ id: number; name: string }>
          ).map((obj) => obj.id);
          setObjectives(previousIds);
        } else {
          resetObjectives();
        }

        toast.error(error.message || t("messages.updateFailed"));
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["user-objectives", userId],
        });
      },
    });

  const handleSelectObjective = useCallback(
    (id: number) => {
      const newSelection = [...selectedObjectiveIds, id];
      updateObjectives(newSelection);
    },
    [selectedObjectiveIds, updateObjectives],
  );

  const handleRemoveObjective = useCallback(
    (id: number) => {
      const newSelection = selectedObjectiveIds.filter((i) => i !== id);
      updateObjectives(newSelection);
    },
    [selectedObjectiveIds, updateObjectives],
  );

  const handleReset = useCallback(() => {
    updateObjectives([]);
    resetObjectives();
  }, [updateObjectives, resetObjectives]);

  const isLoading = isLoadingAll || isLoadingUserObjectives;

  return (
    <div className={cn("w-full max-w-md", className)}>
      <ObjectivesSection
        allObjectives={allObjectives}
        selectedObjectiveIds={selectedObjectiveIds}
        isLoading={isLoading}
        isMutationPending={isMutationPending}
        onSelectObjective={handleSelectObjective}
        onRemoveObjective={handleRemoveObjective}
        onReset={handleReset}
      />
    </div>
  );
};
