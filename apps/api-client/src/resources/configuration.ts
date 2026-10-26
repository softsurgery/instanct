import type { AxiosInstance } from "axios";
import type {
  ResponseConfigurationNamespaceDto,
  UpdateConfigurationParameterDto,
} from "../types";

export function createConfigurationResource(http: AxiosInstance) {
  const findGlobalOneByName = async (
    name: string,
  ): Promise<ResponseConfigurationNamespaceDto> => {
    const response = await http.get<ResponseConfigurationNamespaceDto>(
      `/configuration/namespace/global/name/${name}`,
    );
    return response.data;
  };

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

  const createNamespace = async (data: {
    name: string;
    description?: string;
  }): Promise<ResponseConfigurationNamespaceDto> => {
    const response = await http.post(`/configuration/namespace`, data);
    return response.data;
  };

  const deleteNamespace = async (
    id: string,
  ): Promise<ResponseConfigurationNamespaceDto | null> => {
    const response = await http.delete(`/configuration/namespace/${id}`);
    return response.data;
  };

  return {
    findGlobalOneByName,
    findOneById,
    findAll,
    findAllGlobal,
    update,
    createNamespace,
    deleteNamespace,
  };
}

export type ConfigurationResource = ReturnType<
  typeof createConfigurationResource
>;
