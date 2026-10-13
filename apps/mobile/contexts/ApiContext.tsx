import React, { createContext, useContext } from "react";
import { api, type MobileApi } from "@/lib/api";

const ApiContext = createContext<MobileApi | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi(): MobileApi {
  const value = useContext(ApiContext);
  if (!value) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return value;
}
