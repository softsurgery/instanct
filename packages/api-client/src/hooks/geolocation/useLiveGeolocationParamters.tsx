import { useMapStore } from "../stores/useMapStore";
import { useGlobalMapConfiguration } from "../content/configurations/useGlobalMapConfiguration";
import { useCurrentMapConfiguration } from "../content/users/useCurrentMapConfiguration";
import React from "react";

interface useLiveGeolocationParameters {}

export function useLiveGeolocationParameters({}: useLiveGeolocationParameters = {}) {
  const set = useMapStore((s) => s.set);
  const setNested = useMapStore((s) => s.setNested);
  //global configuration
  const {
    mapConfiguration,
    isMapConfigurationPending,
    refetchMapConfiguration: refetchGlobalMapConfiguration,
  } = useGlobalMapConfiguration();

  //user map configuration
  const {
    mapConfiguration: userMapConfiguration,
    isMapConfigurationPending: isUserMapConfigurationPending,
    refetchMapConfiguration: refetchUserMapConfiguration,
  } = useCurrentMapConfiguration();

  React.useEffect(() => {
    if (userMapConfiguration && mapConfiguration) {
      // Always update global parameters
      setNested("parameters.rangeMin", mapConfiguration.rangeMin);
      setNested("parameters.rangeMax", mapConfiguration.rangeMax);
      setNested("parameters.radius", userMapConfiguration.radius);

      // Seed user settings from server on first load only
      if (!useMapStore.getState().hasInitializedParameters) {
        setNested("settings.radius", userMapConfiguration.radius);
        setNested("settings.showUsernames", userMapConfiguration.showUsernames);
        set("hasInitializedParameters", true);
      }
    }
  }, [userMapConfiguration, mapConfiguration, set, setNested]);

  const refetchMapConfiguration = React.useCallback(() => {
    refetchGlobalMapConfiguration();
    refetchUserMapConfiguration();
  }, [refetchGlobalMapConfiguration, refetchUserMapConfiguration]);

  return {
    refetchMapConfiguration,
    isPending: isMapConfigurationPending || isUserMapConfigurationPending,
  };
}
