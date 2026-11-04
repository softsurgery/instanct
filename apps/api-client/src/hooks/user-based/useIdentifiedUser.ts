import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useApi } from "../context/ApiContext";

export interface UseIdentifiedUserProps {
  id?: string;
  join?: string;
  enabled?: boolean;
}

function normalizeProps(
  idOrProps?: string | UseIdentifiedUserProps,
  join?: string | string[],
  enabled?: boolean,
): UseIdentifiedUserProps {
  if (typeof idOrProps === "object" && idOrProps !== null) {
    return {
      enabled: true,
      ...idOrProps,
    };
  }

  const joinValue = Array.isArray(join) ? join.join(",") : join;

  return {
    id: idOrProps,
    join: joinValue ?? "",
    enabled: enabled ?? true,
  };
}

export const useIdentifiedUser = (
  idOrProps?: string | UseIdentifiedUserProps,
  join?: string | string[],
  enabled?: boolean,
) => {
  const {
    id,
    join: joinValue,
    enabled: isEnabled,
  } = normalizeProps(idOrProps, join, enabled);
  const api = useApi();
  const {
    data: userResp,
    isPending: isUserPending,
    isFetching: isFetchUserPending,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user", id, joinValue],
    queryFn: () => api.admin.user.findById(id!, joinValue),
    enabled: isEnabled && !!id,
  });

  const user = React.useMemo(() => userResp || null, [userResp]);

  return {
    user,
    refetchUser,
    isUserPending,
    isFetchUserPending,
  };
};
