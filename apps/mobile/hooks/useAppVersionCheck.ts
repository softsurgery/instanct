import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/contexts/ApiContext";
import { useVersionPersistStore } from "@/stores/useVersionPersistStore";
import { getAppVersionInfo } from "@/lib/app-version";
import { isVersionOutdated } from "@/lib/semver";

export interface UseAppVersionCheckReturn {
  isChecking: boolean;
  hasConfirmedMandatoryUpdate: boolean;
  installedVersion: string;
  requiredMinVersion: string | null;
  storeUrl: string | null;
  refetchPolicy: () => Promise<void>;
}

export function useAppVersionCheck(): UseAppVersionCheckReturn {
  const api = useApi();
  const versionStore = useVersionPersistStore();
  const { installedVersion, platform } = React.useMemo(
    () => getAppVersionInfo(),
    [],
  );

  const hasBootstrappedColdLaunch = React.useRef(false);

  // Cold launch bootstrap: evaluate local state (promotes pending updates, recovers updated apps)
  React.useEffect(() => {
    if (versionStore.isReady && !hasBootstrappedColdLaunch.current) {
      versionStore.bootstrapColdLaunch(installedVersion);
    }
  }, [versionStore.isReady, installedVersion]);

  const {
    data: policy,
    isFetching,
    isFetched,
    refetch,
  } = useQuery({
    queryKey: ["app-version-policy"],
    queryFn: async () => {
      try {
        const response = await api.appVersion.getPolicy();
        return response;
      } catch (error) {
        // Network outage or API failure: do not invent a lockout
        return null;
      }
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
    enabled: versionStore.isReady,
  });

  // Mark cold launch bootstrap complete once the initial network query attempt has settled
  React.useEffect(() => {
    if (isFetched && !hasBootstrappedColdLaunch.current) {
      if (!policy) {
        // Offline / failure on startup: close the cold launch window so subsequent reconnects do not disrupt session
        hasBootstrappedColdLaunch.current = true;
      }
    }
  }, [isFetched, policy]);

  // Evaluate policy whenever it resolves
  React.useEffect(() => {
    if (!versionStore.isReady || !policy) return;

    // Cache the policy response
    versionStore.setCachedPolicy(policy);

    // Resolve target platform policy
    const platformPolicy =
      platform === "ios"
        ? policy.ios
        : platform === "android"
          ? policy.android
          : null;

    if (!platformPolicy || !platformPolicy.minVersion) {
      return;
    }

    const { minVersion, storeUrl } = platformPolicy;
    const isOutdated = isVersionOutdated(installedVersion, minVersion);

    if (versionStore.hasConfirmedMandatoryUpdate) {
      // User is currently at the update gate.
      // Refresh policy or unlock if now supported
      if (isOutdated) {
        versionStore.confirmMandatoryUpdate(minVersion, storeUrl);
      } else {
        versionStore.clearMandatoryUpdate();
      }
      hasBootstrappedColdLaunch.current = true;
    } else if (!hasBootstrappedColdLaunch.current) {
      // COLD LAUNCH: Enforce policy immediately before main app interface is used
      hasBootstrappedColdLaunch.current = true;

      if (isOutdated) {
        versionStore.confirmMandatoryUpdate(minVersion, storeUrl);
      } else {
        // App is up to date (or user updated through store and relaunched): unlock immediately
        versionStore.clearMandatoryUpdate();
      }
    } else {
      // ACTIVE SESSION: Policy changed while the user was already using the app.
      // CRITICAL REQUIREMENT: Do NOT interrupt the current session!
      // Stage the mandatory update for the NEXT cold launch only.
      if (isOutdated) {
        versionStore.stageMandatoryUpdateForNextLaunch(minVersion, storeUrl);
      } else {
        versionStore.clearMandatoryUpdate();
      }
    }
  }, [
    policy,
    versionStore.isReady,
    versionStore.hasConfirmedMandatoryUpdate,
    installedVersion,
    platform,
  ]);

  const handleManualRefetch = React.useCallback(async () => {
    const result = await refetch();
    if (result.data) {
      const platformPolicy =
        platform === "ios"
          ? result.data.ios
          : platform === "android"
            ? result.data.android
            : null;

      if (platformPolicy?.minVersion) {
        const isOutdated = isVersionOutdated(
          installedVersion,
          platformPolicy.minVersion,
        );
        if (isOutdated) {
          versionStore.confirmMandatoryUpdate(
            platformPolicy.minVersion,
            platformPolicy.storeUrl,
          );
        } else {
          versionStore.clearMandatoryUpdate();
        }
      }
    }
  }, [refetch, platform, installedVersion, versionStore]);

  return {
    isChecking: isFetching && !hasBootstrappedColdLaunch.current,
    hasConfirmedMandatoryUpdate: versionStore.hasConfirmedMandatoryUpdate,
    installedVersion,
    requiredMinVersion: versionStore.confirmedMinVersion,
    storeUrl: versionStore.confirmedStoreUrl,
    refetchPolicy: handleManualRefetch,
  };
}
