import type { AxiosInstance } from "axios";
import type {
  CreateRefParamDto,
  Paginated,
  QueryParams,
  ResponseRefParamDto,
  UpdateRefParamDto,
} from "../types";
import { listParams } from "./query";

export function createRefParamResource(http: AxiosInstance) {
  const findPaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponseRefParamDto>> => {
    const response = await http.get<Paginated<ResponseRefParamDto>>(
      `/ref-param/list`,
      { params: listParams(query) },
    );
    return response.data;
  };

  const findAll = async (): Promise<ResponseRefParamDto[]> => {
    const response = await http.get<ResponseRefParamDto[]>(`/ref-param/all`);
    return response.data;
  };

  const findById = async (id: number): Promise<ResponseRefParamDto> => {
    const response = await http.get<ResponseRefParamDto>(`/ref-param/${id}`);
    return response.data;
  };

  const create = async (
    dto: CreateRefParamDto,
  ): Promise<ResponseRefParamDto> => {
    const response = await http.post("/ref-param", dto);
    return response.data;
  };

  const update = async (
    id?: number,
    refParam?: UpdateRefParamDto,
  ): Promise<ResponseRefParamDto> => {
    const response = await http.put(`/ref-param/${id}`, refParam);
    return response.data;
  };

  const remove = async (id?: number): Promise<ResponseRefParamDto> => {
    const response = await http.delete(`/ref-param/${id}`);
    return response.data;
  };

  return {
    findPaginated,
    findAll,
    findById,
    create,
    update,
    remove,
  };
}

export type RefParamResource = ReturnType<typeof createRefParamResource>;
