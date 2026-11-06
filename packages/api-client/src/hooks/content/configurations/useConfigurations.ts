import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useApi } from "../../context/ApiContext";

export interface UseConfigurationsProps {
  enabled?: boolean;
  /** When true, loads global configurations (admin). Default false (mobile client list). */
  global?: boolean;
}

export const useConfigurations = (
  { enabled = true, global = false }: UseConfigurationsProps = {
    enabled: true,
    global: false,
  },
) => {
  const api = useApi();
  const {
    data: configurationsResponse,
    isPending: isConfigurationsPending,
    refetch: refetchConfigurations,
  } = useQuery({
    queryKey: ["configurations", global ? "global" : "all"],
    queryFn: () =>
      global
        ? api.admin.configuration.findAllGlobal()
        : api.admin.configuration.findAll(),
    enabled,
  });

  const configurations = React.useMemo(
    () => configurationsResponse || null,
    [configurationsResponse],
  );

  return { configurations, isConfigurationsPending, refetchConfigurations };
};
