import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../context/ApiContext";

export const usePermissions = () => {
  const api = useApi();
  const { isFetching: isFetchPermissionsPending, data: permissionsResp } =
    useQuery({
      queryKey: ["permissions"],
      queryFn: () => api.admin.permission.findAll(),
    });

  const permissions = React.useMemo(() => {
    if (!permissionsResp) return [];
    return permissionsResp;
  }, [permissionsResp]);

  return {
    permissions,
    isFetchPermissionsPending,
  };
};
