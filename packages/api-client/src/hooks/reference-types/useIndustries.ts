import { useApi } from "../context/ApiContext";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  resolveRefLabel,
  type ResponseRefParamDto,
} from "../../types/reference-types";

interface useIndustriesProps {
  enabled?: boolean;
  locale?: string;
}

export const useIndustries = (
  { enabled, locale }: useIndustriesProps = { enabled: true },
) => {
  const api = useApi();
  const {
    data: industriesSubTypeResp,
    isPending: isIndustriesSubTypePending,
    refetch: refetchIndustries,
  } = useQuery({
    queryKey: ["industries"],
    queryFn: async () =>
      api.admin.refType.findAll({
        filter: "parentId||$eq||industry",
        join: "params",
      }),
    enabled,
  });

  const industries = React.useMemo(() => {
    if (!industriesSubTypeResp) return [];
    const params = industriesSubTypeResp.flatMap(
      (refType) => refType.params ?? [],
    ) as ResponseRefParamDto[];
    if (!locale) return params;
    return params.map((param) => ({
      ...param,
      label: resolveRefLabel(param.label, param.extras, locale),
    }));
  }, [industriesSubTypeResp, locale]);

  return {
    industriesSubTypeResp,
    industries,
    isIndustriesSubTypePending,
    refetchIndustries,
  };
};
