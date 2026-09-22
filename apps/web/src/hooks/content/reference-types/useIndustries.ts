import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface TreeOption {
  value: string | number;
  label: string;
  children?: TreeOption[];
}

interface UseIndustriesProps {
  enabled?: boolean;
}

export const useIndustries = ({ enabled = true }: UseIndustriesProps = {}) => {
  const { data: types, isFetching: isTypesPending } = useQuery({
    queryKey: ["ref-types"],
    queryFn: api.admin.refType.findAll,
    enabled,
  });

  const { data: params, isFetching: isParamsPending } = useQuery({
    queryKey: ["ref-params"],
    queryFn: api.admin.refParam.findAll,
    enabled,
  });

  const industries = React.useMemo<TreeOption[]>(() => {
    if (!types || !params) {
      return [];
    }

    const industryParent = types.find(
      (t) => t.label.toLowerCase() === "industry",
    );

    if (!industryParent) {
      return [];
    }

    const industryTypes = types.filter((t) => t.parentId === industryParent.id);

    const tree = industryTypes.map((type) => {
      const typeParams = params.filter((p) => p.refTypeId === type.id);

      const children = typeParams.map((p) => ({
        value: p.id,
        label: p.label,
      }));

      return {
        value: type.id,
        label: type.label,
        children,
      };
    });

    return tree;
  }, [types, params]);

  return {
    industries,
    isIndustriesPending: isTypesPending || isParamsPending,
  };
};
