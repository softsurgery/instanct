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
            hasBackground: true,
            safeAreaClassNames: {
              safearea: cn("bg-transparent"),
              wrapper: cn("bg-transparent border border-border rounded-xl"),
            },
            applicationHeaderClassNames: {
              wrapper: cn("border-b border-border pb-2"),
            },
          }
        : {
            hasBackground: true,
            safeAreaClassNames: {
              safearea: cn("bg-transparent"),
              wrapper: cn("bg-transparent"),
            },
            applicationHeaderClassNames: {
              wrapper: cn("border-b border-x border-border bg-transparent pb-2"),
            },
          },
    [isLandscape],
  );
}
