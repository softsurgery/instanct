import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useApi } from "../../context/ApiContext";

interface UseConfigurationByIdProps {
  id: string;
  enabled?: boolean;
}

export const useConfigurationById = ({
  id,
  enabled,
}: UseConfigurationByIdProps) => {
  const api = useApi();
  const {
    data: configurationResponse,
    isPending: isConfigurationPending,
    refetch: refetchConfiguration,
  } = useQuery({
    queryKey: ["configuration", id],
    queryFn: () => api.admin.configuration.findOneById(id),
    enabled,
  });

  const configuration = React.useMemo(
    () => configurationResponse || null,
    [configurationResponse],
  );

  return { configuration, isConfigurationPending, refetchConfiguration };
};
