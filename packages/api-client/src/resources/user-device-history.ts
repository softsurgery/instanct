import type { AxiosInstance } from "axios";
import type { ResponseUserConnectionHistoryDto } from "../types/user-device-history";

export function createUserDeviceHistoryResource(http: AxiosInstance) {
  const getAll = async (): Promise<ResponseUserConnectionHistoryDto[]> => {
    const { data } = await http.get<ResponseUserConnectionHistoryDto[]>(
      "/auth/devices/history",
    );
    return data;
  };

  const getByDeviceId = async (
    deviceId: string,
  ): Promise<ResponseUserConnectionHistoryDto[]> => {
    const { data } = await http.get<ResponseUserConnectionHistoryDto[]>(
      `/auth/devices/history/${deviceId}`,
    );
    return data;
  };

  return {
    getAll,
    getByDeviceId,
  };
}

export type UserDeviceHistoryResource = ReturnType<
  typeof createUserDeviceHistoryResource
>;
