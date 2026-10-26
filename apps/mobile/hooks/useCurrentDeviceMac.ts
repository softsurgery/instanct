import React from "react";
import { getDeviceMacAddress } from "@/lib/device-mac";

/**
 * Hook to retrieve and cache the current device MAC address asynchronously.
 */
export function useCurrentDeviceMac(): string | null {
  const [currentMacAddress, setCurrentMacAddress] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    let isMounted = true;
    getDeviceMacAddress()
      .then((mac) => {
        if (isMounted) setCurrentMacAddress(mac);
      })
      .catch(() => {
        if (isMounted) setCurrentMacAddress(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return currentMacAddress;
}
