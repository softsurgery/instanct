import React, { createContext, useContext } from "react";
import type { createApiClient } from "../../index";

export type ApiClient = ReturnType<typeof createApiClient>;

const ApiContext = createContext<ApiClient | null>(null);

export function ApiProvider({
  value,
  children,
}: {
  value: ApiClient;
  children: React.ReactNode;
}) {
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiClient {
  const value = useContext(ApiContext);
  if (!value) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return value;
}
