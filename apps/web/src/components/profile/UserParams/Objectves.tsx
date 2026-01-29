import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { api } from "@/api";
import { useUserRefParamsStore } from "@/hooks/stores/useUserRefParamsStore";
import { ResponseRefParamDto } from "@/types";
import { SelectBox } from "@/components/shared/SelectBox";

interface ObjectivesProps {
  className?: string;
  userId: string;
}

export const Objectives = ({ className, userId }: ObjectivesProps) => {
  const { t } = useTranslation("user-management");
  const queryClient = useQueryClient();
  const { objectives: savedObjectiveIds, setObjectives } =
    useUserRefParamsStore();

  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
        setLocalSelectedIds(ids);
        setObjectives(ids);
        hasInitialized.current = true;
      } else {
        setLocalSelectedIds([]);
        setObjectives([]);
        hasInitialized.current = true;
      }
    }
  }, [userObjectives, isLoadingUserObjectives, setObjectives]);

  useEffect(() => {
    // Check for unsaved changes
    const arraysEqual = (a: number[], b: number[]) => {
      if (a.length !== b.length) return false;
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      return sortedA.every((value, index) => value === sortedB[index]);
    };

    setHasUnsavedChanges(!arraysEqual(localSelectedIds, savedObjectiveIds));
  }, [localSelectedIds, savedObjectiveIds]);

  useEffect(() => {
    return () => {
      hasInitialized.current = false;
    };
  }, [userId]);

  const { mutate: updateObjectives, isPending: isMutationPending } =
    useMutation({
      mutationFn: async (objectiveIds: number[]) => {
        return api.admin.user.updateObjectives(userId, objectiveIds);
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

        return { previousObjectives };
      },
      onSuccess: (data, newObjectiveIds) => {
        toast.success(
          t(
            "userManagement.inspect.books.ref-params.objective.messages.updatedSuccess",
          ),
        );

        // Update local state and store with saved data
        setLocalSelectedIds(newObjectiveIds);
        setObjectives(newObjectiveIds);
        setHasUnsavedChanges(false);

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

        // Reset to previous state on error
        if (context?.previousObjectives) {
          const previousIds = (
            context.previousObjectives as Array<{ id: number; name: string }>
          ).map((obj) => obj.id);
          setLocalSelectedIds(previousIds);
          setObjectives(previousIds);
        }

        toast.error(error.message || t("messages.updateFailed"));
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["user-objectives", userId],
        });
      },
    });

  const handleSelectParam = useCallback((id: number) => {
    setLocalSelectedIds((prev) => {
      const newSelection = [...prev, id];
      return newSelection;
    });
  }, []);

  const handleRemoveParam = useCallback((id: number) => {
    setLocalSelectedIds((prev) => {
      const newSelection = prev.filter((i) => i !== id);
      return newSelection;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!isMutationPending && hasUnsavedChanges) {
      updateObjectives(localSelectedIds);
    }
  }, [
    localSelectedIds,
    updateObjectives,
    isMutationPending,
    hasUnsavedChanges,
  ]);

  const handleReset = useCallback(() => {
    if (!isMutationPending) {
      setLocalSelectedIds([]);
    }
  }, [isMutationPending]);

  const handleCancel = useCallback(() => {
    if (!isMutationPending && hasUnsavedChanges) {
      // Reset to last saved state
      setLocalSelectedIds(savedObjectiveIds);
      setHasUnsavedChanges(false);
    }
  }, [savedObjectiveIds, isMutationPending, hasUnsavedChanges]);

  const isLoading = isLoadingAll || isLoadingUserObjectives;

  return (
    <div className={cn("w-full max-w-md", className)}>
      <SelectBox
        allParams={allObjectives}
        selectedParamIds={localSelectedIds}
        isLoading={isLoading}
        isMutationPending={isMutationPending}
        hasUnsavedChanges={hasUnsavedChanges}
        onSelectParam={handleSelectParam}
        onRemoveParam={handleRemoveParam}
        onSave={handleSave}
        onReset={handleReset}
        onCancel={handleCancel}
      />
    </div>
  );
};
