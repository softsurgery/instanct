import type { AxiosInstance } from "axios";
import type { UserDevice } from "../types";

export function createDevicesResource(http: AxiosInstance) {
  const getDevices = async (): Promise<UserDevice[]> => {
    const response = await http.get<UserDevice[]>("/auth/devices");
    return response.data;
  };

  const trustDevice = async (id: string): Promise<UserDevice> => {
    const response = await http.post<UserDevice>(`/auth/devices/${id}/trust`);
    return response.data;
  };

  const untrustDevice = async (id: string): Promise<UserDevice> => {
    const response = await http.post<UserDevice>(
      `/auth/devices/${id}/untrust`,
    );
    return response.data;
  };

  const revokeDevice = async (id: string): Promise<{ success: boolean }> => {
    const response = await http.delete<{ success: boolean }>(
      `/auth/devices/${id}`,
    );
    return response.data;
  };

  return {
    getDevices,
    trustDevice,
    untrustDevice,
    revokeDevice,
  };
}

export type DevicesResource = ReturnType<typeof createDevicesResource>;
