import React from "react";
import {
  ApiProvider as BaseApiProvider,
  useApi,
  type ApiClient,
} from "api-client/hooks/context";
import { api } from "@/lib/api";

export { useApi, type ApiClient };

export function ApiProvider({ children }: { children: React.ReactNode }) {
  return <BaseApiProvider value={api as ApiClient}>{children}</BaseApiProvider>;
}
