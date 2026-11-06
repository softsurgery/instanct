import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useApi } from "../../context/ApiContext";

interface UseConfigurationByNameProps {
  name: string;
  enabled?: boolean;
}

export const useConfigurationByName = ({
  name,
  enabled,
}: UseConfigurationByNameProps) => {
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
