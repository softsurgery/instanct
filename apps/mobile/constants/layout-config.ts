import React from "react";
import { cn } from "@softsurgery/lib";
import { useScreenOrientation } from "@softsurgery/mobile-hooks";
import type { LayoutConfigValue } from "@softsurgery/contexts";

export function useBootstrapLayoutConfig(): LayoutConfigValue {
  const { isLandscape } = useScreenOrientation();

  return React.useMemo(
    () =>
      isLandscape
        ? {
            safeAreaClassNames: {
              safearea: cn("bg-background"),
              wrapper: cn("bg-card border border-border rounded-xl"),
            },
            applicationHeaderClassNames: {
              wrapper: cn("border-b border-border pb-2"),
            },
          }
        : {
            safeAreaClassNames: {
              safearea: cn("bg-card"),
              wrapper: cn("bg-card"),
            },
            applicationHeaderClassNames: {
              wrapper: cn("border-b border-x border-border bg-card pb-2"),
            },
          },
    [isLandscape],
  );
}
