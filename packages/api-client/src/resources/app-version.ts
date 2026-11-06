import type { AxiosInstance } from "axios";
import type { AppVersionPolicyDto } from "../types/configuration";

export function createAppVersionResource(http: AxiosInstance) {
  const getPolicy = async (): Promise<AppVersionPolicyDto> => {
    const response = await http.get("/public/app-version");
    return response.data;
  };

  return {
    getPolicy,
  };
}

export type AppVersionResource = ReturnType<typeof createAppVersionResource>;
