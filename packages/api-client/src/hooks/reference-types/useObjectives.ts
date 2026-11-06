import { useApi } from "../context/ApiContext";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  resolveRefLabel,
  type ResponseRefParamDto,
} from "../../types/reference-types";

interface useObjectivesProps {
  enabled?: boolean;
  locale?: string;
}

export const useObjectives = (
  { enabled, locale }: useObjectivesProps = { enabled: true },
) => {
  const api = useApi();
  const {
    data: objectivesSubTypeResp,
    isPending: isObjectivesSubTypePending,
    refetch: refetchObjectives,
  } = useQuery({
    queryKey: ["objectives"],
    queryFn: async () =>
      api.admin.refType.findAll({
        filter: "parentId||$eq||objectif",
        join: "params",
      }),
    enabled,
  });

  const objectives = React.useMemo(() => {
    if (!objectivesSubTypeResp) return [];
    const params = objectivesSubTypeResp.flatMap(
      (refType) => refType.params ?? [],
    ) as ResponseRefParamDto[];
    if (!locale) return params;
    return params.map((param) => ({
      ...param,
      label: resolveRefLabel(param.label, param.extras, locale),
    }));
  }, [objectivesSubTypeResp, locale]);

  return {
    objectivesSubTypeResp,
    objectives,
    isObjectivesSubTypePending,
    refetchObjectives,
  };
};
