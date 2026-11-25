import React from "react";
import { ConfigurationNamespaces } from "api-client";
import { useConfigurationByName } from "./useConfigurationByName";

interface UseGlobalMapConfigurationProps {
  enabled?: boolean;
}

export const useGlobalMapConfiguration = (
  { enabled = true }: UseGlobalMapConfigurationProps = { enabled: true },
) => {
  const { configuration, isConfigurationPending, refetchConfiguration } =
    useConfigurationByName({
      name: ConfigurationNamespaces.MAPS,
      enabled,
    });

  const mapConfiguration = React.useMemo(() => {
    if (!configuration) return null;
    return {
      rangeMax: Number(
        configuration.params?.find((p) => p.name === "range.max")?.value,
      ),
      rangeMin: Number(
        configuration.params?.find((p) => p.name === "range.min")?.value,
      ),
    };
  }, [configuration]);

  return {
    mapConfiguration,
    isMapConfigurationPending: isConfigurationPending,
    refetchMapConfiguration: refetchConfiguration,
  };
};
