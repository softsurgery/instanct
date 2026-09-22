import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useContentPagesResponse {
  enabled: boolean;
}

export const useContentPages = ({ enabled }: useContentPagesResponse) => {
  const {
    data: contentPagesResponse,
    isPending: isContentPagesPending,
    refetch: refetchContentPages,
  } = useQuery({
    queryKey: ["content-pages"],
    queryFn: () => api.admin.contentPage.findAll(),
    enabled,
  });

  const contentPages = React.useMemo(
    () => contentPagesResponse || [],
    [contentPagesResponse],
  );

  return { contentPages, isContentPagesPending, refetchContentPages };
};
