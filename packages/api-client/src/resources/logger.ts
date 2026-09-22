import type { AxiosInstance } from "axios";
import type { Paginated, QueryParams, ResponseLogDto } from "../types";
import { listParams } from "./query";

export function createLoggerResource(http: AxiosInstance) {
  const findPaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponseLogDto>> => {
    const response = await http.get<Paginated<ResponseLogDto>>(
      `/admin/logger/list`,
      { params: listParams(query, { join: "user" }) },
    );
    return response.data;
  };

  const findAll = async (): Promise<ResponseLogDto[]> => {
    const response = await http.get<ResponseLogDto[]>(`/admin/logger/all`);
    return response.data;
  };

  const findById = async (id: string | number): Promise<ResponseLogDto> => {
    const response = await http.get<ResponseLogDto>(`/admin/logger/${id}`);
    return response.data;
  };

  return {
    findPaginated,
    findAll,
    findById,
  };
}

export type LoggerResource = ReturnType<typeof createLoggerResource>;
