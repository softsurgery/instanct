import type { AxiosInstance } from "axios";
import type {
  ResponseConfigurationNamespaceDto,
  UpdateConfigurationParameterDto,
} from "../types";

export function createConfigurationResource(http: AxiosInstance) {
  const findOneById = async (
    id: string,
  ): Promise<ResponseConfigurationNamespaceDto> => {
    const response = await http.get(`/configuration/namespace/${id}`);
    return response.data;
  };

  const findAll = async (): Promise<ResponseConfigurationNamespaceDto[]> => {
    const response = await http.get(`/configuration/all`);
    return response.data;
  };

  const findAllGlobal = async (): Promise<
    ResponseConfigurationNamespaceDto[]
  > => {
    const response = await http.get(`/configuration/all/global`);
    return response.data;
  };

  const update = async (data: UpdateConfigurationParameterDto[]) => {
    const response = await http.put(`/configuration`, data);
    return response.data;
  };

  return {
    findOneById,
    findAll,
    findAllGlobal,
    update,
  };
}

export type ConfigurationResource = ReturnType<
  typeof createConfigurationResource
>;
