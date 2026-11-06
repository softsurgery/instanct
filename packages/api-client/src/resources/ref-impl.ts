import type { AxiosInstance } from "axios";
import type { ResponseRefParamDto } from "../types";

export function createRefImplResource(http: AxiosInstance) {
  const findAllIndustries = async (): Promise<ResponseRefParamDto[]> => {
    const response = await http.get<ResponseRefParamDto[]>(
      `/reference-impl/industries`,
    );
    return response.data;
  };

  const findAllObjectives = async (): Promise<ResponseRefParamDto[]> => {
    const response = await http.get<ResponseRefParamDto[]>(
      `/reference-impl/objectives`,
    );
    return response.data;
  };

  return {
    findAllIndustries,
    findAllObjectives,
  };
}

export type RefImplResource = ReturnType<typeof createRefImplResource>;
