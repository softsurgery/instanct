import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../context/ApiContext";

export const useUsers = (enabled: boolean = true) => {
  const api = useApi();
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
