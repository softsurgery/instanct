import React from "react";
import { getDeviceId } from "@/lib/device-id";

/**
 * Hook to retrieve and cache the current device identifier asynchronously.
 */
export function useCurrentDeviceId(): string | null {
  const [currentDeviceId, setCurrentDeviceId] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    let isMounted = true;
    getDeviceId()
      .then((id) => {
        if (isMounted) setCurrentDeviceId(id);
      })
      .catch(() => {
        if (isMounted) setCurrentDeviceId(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return currentDeviceId;
}
