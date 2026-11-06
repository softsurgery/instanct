import type { AxiosInstance } from "axios";
import type {
  Paginated,
  QueryParams,
  ResponsePermissionDto,
} from "../types";
import { listParams } from "./query";

export function createPermissionResource(http: AxiosInstance) {
  const findPaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponsePermissionDto>> => {
    const response = await http.get<Paginated<ResponsePermissionDto>>(
      `/admin/permission/list`,
      { params: listParams(query) },
    );
    return response.data;
  };

  const findAll = async (): Promise<ResponsePermissionDto[]> => {
    const response = await http.get<ResponsePermissionDto[]>(
      `/admin/permission/all`,
    );
    return response.data;
  };

  const findById = async (id: string): Promise<ResponsePermissionDto> => {
    const response = await http.get<ResponsePermissionDto>(
      `/admin/permission/${id}`,
    );
    return response.data;
  };

  const remove = async (id: string): Promise<void> => {
    await http.delete(`/api/permissions/${id}`);
  };

  return {
    findPaginated,
    findAll,
    findById,
    remove,
  };
}

export type PermissionResource = ReturnType<typeof createPermissionResource>;
