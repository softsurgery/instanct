import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../context/ApiContext";

export const useRefTypes = () => {
  const api = useApi();
  const { data: refTypesResp, isFetching: isRefTypesPending } = useQuery({
    queryKey: ["ref-types"],
    queryFn: () => api.admin.refType.findAll(),
  });

  const refTypes = React.useMemo(() => {
    if (!refTypesResp) return [];
    return refTypesResp;
  }, [refTypesResp]);

  return {
    refTypes,
    isRefTypesPending,
  };
};
