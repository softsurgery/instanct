import { cn } from "@softsurgery/lib";
import { useScreenOrientation } from "@softsurgery/mobile-hooks";
import React from "react";

export const useLayoutConfig = () => {
  const { isLandscape } = useScreenOrientation();

  const safeAreaClassNames = React.useMemo(() => {
    if (isLandscape) {
      return {
        safearea: cn("bg-background"),
        wrapper: cn("bg-card border border-border rounded-xl"),
      };
    } else {
      return {
        safearea: cn("bg-card"),
        wrapper: cn("bg-card"),
      };
    }
  }, [isLandscape]);

  const applicationHeaderClassNames = React.useMemo(() => {
    if (isLandscape) {
      return {
        wrapper: cn("border-b border-border pb-2"),
      };
    } else {
      return {
        wrapper: cn("border-b border-x border-border bg-card pb-2"),
      };
    }
  }, [isLandscape]);

  return {
    safeAreaClassNames,
    applicationHeaderClassNames,
  };
};
