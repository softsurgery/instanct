import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UseQueryReorderProps<T> {
  queryKey: (string | undefined)[];
  reorderFn: (updates: { id: string; sortOrder: number }[]) => Promise<unknown>;
  onError?: (error: unknown) => void;
  errorMessage?: string;
}

export function useQueryReorder<T extends { id: string }>({
  queryKey,
  reorderFn,
  onError,
  errorMessage = "Failed to save order",
}: UseQueryReorderProps<T>) {
  const queryClient = useQueryClient();

  const handleReorder = async (newItems: T[]) => {
    // Directly mutate/update React Query cache without invalidating or refetching from network
    queryClient.setQueriesData({ queryKey }, () => newItems);

    const updates = newItems.map((item, index) => ({
      id: item.id,
      sortOrder: index,
    }));

    try {
      await reorderFn(updates);
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return { handleReorder };
}
