import type { AxiosInstance } from "axios";
import type { ResponseUserConnectionHistoryDto } from "../types/user-device-history";

export function createUserDeviceHistoryResource(http: AxiosInstance) {
  const getAll = async (params?: {
    userId?: string;
  }): Promise<ResponseUserConnectionHistoryDto[]> => {
    const { data } = await http.get<ResponseUserConnectionHistoryDto[]>(
      "/auth/devices/history",
      { params },
    );
    return data;
  };

  const getByUserId = async (
    userId: string,
  ): Promise<ResponseUserConnectionHistoryDto[]> => {
    return getAll({ userId });
  };

  const getByDeviceId = async (
    deviceId: string,
    params?: { userId?: string },
  ): Promise<ResponseUserConnectionHistoryDto[]> => {
    const { data } = await http.get<ResponseUserConnectionHistoryDto[]>(
      `/auth/devices/history/${deviceId}`,
      { params },
    );
    return data;
  };

  return {
    getAll,
    getByUserId,
    getByDeviceId,
  };
}

export type UserDeviceHistoryResource = ReturnType<
  typeof createUserDeviceHistoryResource
>;
