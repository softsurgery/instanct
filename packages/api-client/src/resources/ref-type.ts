import type { AxiosInstance } from "axios";
import type {
  CreateRefTypeDto,
  Paginated,
  QueryParams,
  ResponseRefTypeDto,
  UpdateRefTypeDto,
} from "../types";
import { listParams } from "./query";

export function createRefTypeResource(http: AxiosInstance) {
  const findPaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponseRefTypeDto>> => {
    const response = await http.get<Paginated<ResponseRefTypeDto>>(
      `/ref-type/list`,
      { params: listParams(query) },
    );
    return response.data;
  };

  const findAll = async (): Promise<ResponseRefTypeDto[]> => {
    const response = await http.get<ResponseRefTypeDto[]>(`/ref-type/all`);
    return response.data;
  };

  const findById = async (id: number): Promise<ResponseRefTypeDto> => {
    const response = await http.get<ResponseRefTypeDto>(`/ref-type/${id}`);
    return response.data;
  };

  const create = async (dto: CreateRefTypeDto): Promise<ResponseRefTypeDto> => {
    const response = await http.post("/ref-type", dto);
    return response.data;
  };

  const update = async (
    id?: number,
    refType?: UpdateRefTypeDto,
  ): Promise<ResponseRefTypeDto> => {
    const response = await http.put(`/ref-type/${id}`, refType);
    return response.data;
  };

  const remove = async (id?: number): Promise<ResponseRefTypeDto> => {
    const response = await http.delete(`/ref-type/${id}`);
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

export type RefTypeResource = ReturnType<typeof createRefTypeResource>;
