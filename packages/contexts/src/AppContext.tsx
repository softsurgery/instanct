import React, { createContext, useContext } from "react";
import type { ApiResources } from "@instanct/api-client";

export type AppType = "admin" | "web";

export interface AppContextValue {
  appType: AppType;
  api: ApiResources;
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
