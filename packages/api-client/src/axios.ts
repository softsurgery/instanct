import _axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { delay } from "@instanct/lib";
import { useAuthPersistStore } from "@instanct/hooks";

export interface AxiosAuthAdapter {
  getAccessToken: () => string | undefined;
  getRefreshToken: () => string | undefined;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export interface CreateAxiosConfig {
  baseURL: string;
  delayMs?: number;
  refreshPath?: string;
  onUnauthorized?: () => void;
  auth?: AxiosAuthAdapter;
  includeLocale?: boolean;
  logoutOnMissingRefresh?: boolean;
}

const defaultAuth: AxiosAuthAdapter = {
  getAccessToken: () => useAuthPersistStore.getState().accessToken || undefined,
  getRefreshToken: () =>
    useAuthPersistStore.getState().refreshToken || undefined,
  setTokens: (accessToken, refreshToken) =>
    useAuthPersistStore.getState().setTokens(accessToken, refreshToken),
  logout: () => useAuthPersistStore.getState().logout(),
  isAuthenticated: () => {
    const state = useAuthPersistStore.getState();
    return state.isAuthenticated || !!state.accessToken;
  },
};

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function joinUrl(baseURL: string, path: string) {
  const base = baseURL.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function createAxios({
  baseURL,
  delayMs = 0,
  refreshPath = "/auth/refresh-token",
  onUnauthorized,
  auth = defaultAuth,
  includeLocale = true,
  logoutOnMissingRefresh = true,
}: CreateAxiosConfig): AxiosInstance {
  const axios = _axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  axios.interceptors.request.use(
    async (config) => {
      if (delayMs > 0) {
        await delay(delayMs);
      }

      const accessToken = auth.getAccessToken();
      if (accessToken) {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) {
        config.headers.set("x-timezone", timezone);
      }

      if (includeLocale && typeof window !== "undefined") {
        const locale = window.localStorage.getItem("locale") || "en";
        config.headers.set("x-custom-lang", locale);
      }

      if (config.data instanceof FormData) {
        config.headers.delete("Content-Type");
      }

      return config;
    },
    (err) => Promise.reject(err),
  );

  axios.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | RetryableRequestConfig
        | undefined;
      const refreshToken = auth.getRefreshToken();
      const authenticated = auth.isAuthenticated();

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        if (refreshToken) {
          try {
            const response = await _axios.post(joinUrl(baseURL, refreshPath), {
              refresh_token: refreshToken,
            });

            const { access_token, refresh_token } = response.data as {
              access_token: string;
              refresh_token?: string;
            };

            auth.setTokens(access_token, refresh_token);
            originalRequest.headers.set(
              "Authorization",
              `Bearer ${access_token}`,
            );

            return axios(originalRequest);
          } catch (err) {
            auth.logout();
            onUnauthorized?.();
            return Promise.reject(err);
          }
        }

        if (logoutOnMissingRefresh && authenticated) {
          auth.logout();
          onUnauthorized?.();
        }
      }

      return Promise.reject(error);
    },
  );

  return axios;
}
