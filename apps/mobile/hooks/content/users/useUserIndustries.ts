import { useApi } from "@/contexts/ApiContext";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useUserIndustriesProps {
  userId: string;
  enabled?: boolean;
}

export const useUserIndustries = ({
  userId,
  enabled = true,
}: useUserIndustriesProps) => {
  const api = useApi();
  const {
    data: userIndustriesResp,
    isPending: isUserIndustriesPending,
    refetch: refetchUserIndustries,
  } = useQuery({
    queryKey: ["user-industries", userId],
    queryFn: () => api.admin.user.getIndustries(userId),
    enabled,
  });

  const userIndustries = React.useMemo(() => {
    if (!userIndustriesResp) return [];
    return userIndustriesResp;
  }, [userIndustriesResp]);

  return {
    userIndustries,
    isUserIndustriesPending,
    refetchUserIndustries,
  };
};
