import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useApi } from "../context/ApiContext";

export interface UseCurrentUserOptions {
  enabled?: boolean;
}

export const useCurrentUser = (
  { enabled = true }: UseCurrentUserOptions = { enabled: true },
) => {
  const api = useApi();
  const {
    data: currentUserResp,
    isPending: isCurrentUserPending,
    refetch: refetchCurrentUser,
  } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => api.currentUser.find(),
    enabled,
  });

  const currentUser = React.useMemo(() => {
    return currentUserResp || null;
  }, [currentUserResp]);

  return { currentUser, refetchCurrentUser, isCurrentUserPending };
};
