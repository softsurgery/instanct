import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useApi } from "@/contexts/ApiContext";

export const useCurrentUser = () => {
  const api = useApi();
  const {
    data: currentUserResp,
    isPending: isCurrentUserPending,
    refetch: refetchCurrentUser,
  } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => api.currentUser.find(),
  });

  const currentUser = React.useMemo(() => {
    return currentUserResp || null;
  }, [currentUserResp]);

  return { currentUser, refetchCurrentUser, isCurrentUserPending };
};
