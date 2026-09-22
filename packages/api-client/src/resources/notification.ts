import type { AxiosInstance } from "axios";
import type {
  Paginated,
  QueryParams,
  ResponseNotificationDto,
} from "../types";
import { listParams } from "./query";

export function createNotificationResource(http: AxiosInstance) {
  const findPaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponseNotificationDto>> => {
    const response = await http.get<Paginated<ResponseNotificationDto>>(
      `/notification/list`,
      { params: listParams(query, { join: "user" }) },
    );
    return response.data;
  };

  const findPaginatedByUser = async (
    userId: string,
    query: QueryParams = {},
  ): Promise<Paginated<ResponseNotificationDto>> => {
    const response = await http.get<Paginated<ResponseNotificationDto>>(
      `/notification/list/${userId}`,
      { params: listParams(query) },
    );
    return response.data;
  };

  const findAll = async (): Promise<ResponseNotificationDto[]> => {
    const response = await http.get<ResponseNotificationDto[]>(
      `/notification/all`,
    );
    return response.data;
  };

  const findById = async (
    id: string | number,
  ): Promise<ResponseNotificationDto> => {
    const response = await http.get<ResponseNotificationDto>(
      `/notification/${id}`,
    );
    return response.data;
  };

  const testNotify = async (id: string) => {
    const response = await http.post<ResponseNotificationDto>(
      `/notification/test/${id}`,
      {},
    );
    return response.data;
  };

  return {
    findPaginated,
    findPaginatedByUser,
    findAll,
    findById,
    testNotify,
  };
}

export type NotificationResource = ReturnType<typeof createNotificationResource>;
