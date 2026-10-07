import React, { useCallback, useMemo, useState } from "react";

interface UIContextProps {
  enableMainOverflow: boolean;
  setEnableMainOverflow: (enable: boolean) => void;
  clearEnableMainOverflow: () => void;

  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  clearShowSidebar: () => void;

  enableContainer: boolean;
  setEnableContainer: (enable: boolean) => void;
  clearEnableContainer: () => void;
}

export const UIContext = React.createContext<Partial<UIContextProps>>({});

export const useUI = () => React.useContext(UIContext);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [enableMainOverflow, setEnableMainOverflow] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [enableContainer, setEnableContainer] = useState(false);

  const clearEnableMainOverflow = useCallback(
    () => setEnableMainOverflow(false),
    [],
  );
  const clearShowSidebar = useCallback(() => setShowSidebar(true), []);

  const clearEnableContainer = useCallback(() => setEnableContainer(false), []);

  const value = useMemo(
    () => ({
      enableMainOverflow,
      setEnableMainOverflow,
      clearEnableMainOverflow,
      showSidebar,
      setShowSidebar,
      clearShowSidebar,
      enableContainer,
      setEnableContainer,
      clearEnableContainer,
    }),
    [
      clearEnableContainer,
      clearEnableMainOverflow,
      clearShowSidebar,
      enableContainer,
      enableMainOverflow,
      showSidebar,
    ],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
