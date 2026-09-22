import _axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { delay } from "@instanct/lib";
import { useAuthPersistStore } from "@instanct/hooks/stores";

export interface CreateAxiosConfig {
  baseURL: string;
  delayMs?: number;
  refreshPath?: string;
  onUnauthorized?: () => void;
}

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

      const { accessToken } = useAuthPersistStore.getState();
      if (accessToken) {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) {
        config.headers.set("x-timezone", timezone);
      }

      if (typeof window !== "undefined") {
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
      const authStore = useAuthPersistStore.getState();

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        if (authStore.refreshToken) {
          try {
            const response = await _axios.post(joinUrl(baseURL, refreshPath), {
              refresh_token: authStore.refreshToken,
            });

            const { access_token, refresh_token } = response.data as {
              access_token: string;
              refresh_token?: string;
            };

            authStore.setTokens(access_token, refresh_token);
            originalRequest.headers.set(
              "Authorization",
              `Bearer ${access_token}`,
            );

            return axios(originalRequest);
          } catch (err) {
            authStore.logout();
            onUnauthorized?.();
            return Promise.reject(err);
          }
        }

        if (authStore.isAuthenticated || authStore.accessToken) {
          authStore.logout();
          onUnauthorized?.();
        }
      }

      return Promise.reject(error);
    },
  );

  return axios;
}
