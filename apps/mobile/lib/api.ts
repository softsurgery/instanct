import "./persist-storage";
import { createApiClient, type AxiosAuthAdapter } from "api-client";
import { useAuthPersistStore } from "@softsurgery/hooks/stores";
import { bindMobileClientAuth } from "@/lib/client-auth";
import { performLogout } from "@/lib/logout";
import { bindBackgroundApi } from "@/lib/background-api-holder";
import { createMobileUpload } from "@/lib/upload";

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || "";
const delayMs = process.env.EXPO_PUBLIC_GLOBAL_DELAY
  ? parseInt(process.env.EXPO_PUBLIC_GLOBAL_DELAY, 10)
  : 0;

const auth: AxiosAuthAdapter = {
  getAccessToken: () => useAuthPersistStore.getState().accessToken || undefined,
  getRefreshToken: () =>
    useAuthPersistStore.getState().refreshToken || undefined,
  setTokens: (accessToken, refreshToken) =>
    useAuthPersistStore.getState().setTokens(accessToken, refreshToken),
  logout: () => useAuthPersistStore.getState().logout(),
  isAuthenticated: () => {
    const store = useAuthPersistStore.getState();
    return store.isAuthenticated || !!store.accessToken;
  },
};

export function createMobileApi() {
  const client = createApiClient({
    baseURL,
    delayMs,
    refreshPath: "/client-auth/refresh-token",
    auth,
    includeLocale: false,
    logoutOnMissingRefresh: false,
    onUnauthorized: () => {
      performLogout();
    },
  });

  return {
    ...client,
    clientAuth: bindMobileClientAuth(client.clientAuth),
    upload: createMobileUpload(client.http),
  };
}

export type MobileApi = ReturnType<typeof createMobileApi>;

export const api = createMobileApi();
bindBackgroundApi(api);
