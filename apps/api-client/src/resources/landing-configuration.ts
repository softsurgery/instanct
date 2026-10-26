import type { AxiosInstance } from "axios";

export interface ResponseLandingConfigurationDto {
  contactEmail: string;
}

export function createLandingConfigurationResource(http: AxiosInstance) {
  const getConfiguration =
    async (): Promise<ResponseLandingConfigurationDto> => {
      const response = await http.get(`/public/landing-configuration`);
      return response.data;
    };

  return {
    getConfiguration,
  };
}

export type LandingConfigurationResource = ReturnType<
  typeof createLandingConfigurationResource
>;
