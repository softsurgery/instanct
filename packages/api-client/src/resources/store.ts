import type { AxiosInstance } from "axios";
import type { Paginated, QueryParams, Store, UpdateStoreDto } from "../types";
import { listParams } from "./query";

export function createStoreResource(http: AxiosInstance) {
  const findPaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<Store>> => {
    const response = await http.get<Paginated<Store>>(`/store/list`, {
      params: listParams(query, { join: "permissions.permission" }),
    });
    return response.data;
  };

  const findAll = async (): Promise<Store[]> => {
    const response = await http.get<Store[]>(`/store/all`);
    return response.data;
  };

  const findById = async (id: string): Promise<Store> => {
    const response = await http.get<Store>(`/store/${id}`);
    return response.data;
  };

  const update = async (updateStoreDto: UpdateStoreDto): Promise<Store> => {
    const response = await http.put<Store>(`/store`, updateStoreDto);
    return response.data;
  };

  const updateMany = async (stores: UpdateStoreDto[]): Promise<Store[]> => {
    const response = await http.put<Store[]>(`/store/bulk`, stores);
    return response.data;
  };

  return {
    findPaginated,
    findAll,
    findById,
    update,
    updateMany,
  };
}

export type StoreResource = ReturnType<typeof createStoreResource>;
