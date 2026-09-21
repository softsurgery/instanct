import React, { createContext, useContext } from "react";

export type AppType = string;

export interface AppContextValue {
  appType: AppType;
}

export const AppContext = createContext<AppContextValue | null>(null);

export interface AppProviderProps {
  value: AppContextValue;
  children: React.ReactNode;
}

export function AppProvider({ value, children }: AppProviderProps) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
