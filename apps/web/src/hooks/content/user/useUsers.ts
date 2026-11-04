import React from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useUsers = (enabled: boolean = true) => {
  const {
    isFetching: isFetchUsersPending,
    data: usersResp,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users-all"],
    queryFn: () => api.admin.user.findAll(),
    enabled,
  });

  const users = React.useMemo(() => {
    if (!usersResp) return [];
    return usersResp;
  }, [usersResp]);

  return {
    users,
    isFetchUsersPending,
    refetchUsers,
  };
};
