import { createApiClient } from "@instanct/api-client";
import { signOut } from "next-auth/react";

const baseURL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BASE_URL
    : process.env.BASE_URL;

export const api = createApiClient({
  baseURL: baseURL || "http://localhost:5000/api",
  refreshPath: "/auth/refresh-token",
  onUnauthorized: () => {
    if (typeof window !== "undefined") {
      void signOut({ callbackUrl: "/auth" });
    }
  },
});

export default api.http;
