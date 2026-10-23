import { useApi } from "@/contexts/ApiContext";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useConfigurationProps {
  name: string;
  enabled?: boolean;
}

export const useConfiguration = ({ name, enabled }: useConfigurationProps) => {
  const api = useApi();
  const {
    data: configurationResponse,
    isPending: isConfigurationPending,
    refetch: refetchConfiguration,
  } = useQuery({
    queryKey: ["global-configuration", name],
    queryFn: () => api.admin.configuration.findGlobalOneByName(name),
    enabled,
  });

  const configuration = React.useMemo(
    () => configurationResponse || null,
    [configurationResponse],
  );

  return { configuration, isConfigurationPending, refetchConfiguration };
};
