import type { AxiosInstance } from "axios";
import type {
  ResponseUserDeviceDto,
  CreateUserDeviceDto,
  UpdateUserDeviceDto,
} from "../types/user-device";

export function createUserDevicesResource(http: AxiosInstance) {
  const getAll = async (params?: {
    userId?: string;
  }): Promise<ResponseUserDeviceDto[]> => {
    const { data } = await http.get<ResponseUserDeviceDto[]>("/auth/devices", {
      params,
    });
    return data;
  };

  const getByUserId = async (
    userId: string,
  ): Promise<ResponseUserDeviceDto[]> => {
    return getAll({ userId });
  };

  const getById = async (id: string): Promise<ResponseUserDeviceDto> => {
    const { data } = await http.get<ResponseUserDeviceDto>(
      `/auth/devices/${id}`,
    );
    return data;
  };

  const create = async (
    dto: CreateUserDeviceDto,
  ): Promise<ResponseUserDeviceDto> => {
    const { data } = await http.post<ResponseUserDeviceDto>(
      "/auth/devices",
      dto,
    );
    return data;
  };

  const update = async (
    id: string,
    dto: UpdateUserDeviceDto,
  ): Promise<ResponseUserDeviceDto> => {
    const { data } = await http.patch<ResponseUserDeviceDto>(
      `/auth/devices/${id}`,
      dto,
    );
    return data;
  };

  const trust = async (id: string): Promise<ResponseUserDeviceDto> => {
    const { data } = await http.post<ResponseUserDeviceDto>(
      `/auth/devices/${id}/trust`,
    );
    return data;
  };

  const untrust = async (id: string): Promise<ResponseUserDeviceDto> => {
    const { data } = await http.post<ResponseUserDeviceDto>(
      `/auth/devices/${id}/untrust`,
    );
    return data;
  };

  const revoke = async (id: string): Promise<{ success: boolean }> => {
    const { data } = await http.delete<{ success: boolean }>(
      `/auth/devices/${id}`,
    );
    return data;
  };

  const revokeAll = async (): Promise<{ success: boolean }> => {
    const { data } = await http.delete<{ success: boolean }>("/auth/devices");
    return data;
  };

  return {
    getAll,
    getByUserId,
    getById,
    create,
    update,
    trust,
    untrust,
    revoke,
    revokeAll,
  };
}

export type UserDevicesResource = ReturnType<typeof createUserDevicesResource>;
