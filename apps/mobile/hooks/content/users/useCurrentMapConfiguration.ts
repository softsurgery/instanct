import { useApi } from "@/contexts/ApiContext";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface useCurrentMapConfigurationProps {
  enabled?: boolean;
}

export const useCurrentMapConfiguration = (
  { enabled = true }: useCurrentMapConfigurationProps = { enabled: true },
) => {
  const api = useApi();
  const {
    data: mapConfigurationResp,
    isPending: isMapConfigurationPending,
    refetch: refetchMapConfiguration,
  } = useQuery({
    queryKey: ["current-map-configuration"],
    queryFn: () => api.currentUser.getMapConfiguration(),
    enabled,
  });

  const mapConfiguration = React.useMemo(
    () => mapConfigurationResp || null,
    [mapConfigurationResp],
  );

  return {
    mapConfiguration: mapConfiguration
      ? {
          radius: Number(
            mapConfiguration?.params?.find((param) => param.name === "radius")
              ?.value,
          ),
          showUsernames:
            mapConfiguration?.params?.find(
              (param) => param.name === "showUsernames",
            )?.value === "true",
        }
      : null,
    isMapConfigurationPending,
    refetchMapConfiguration,
  };
};
