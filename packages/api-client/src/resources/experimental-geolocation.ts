import type { AxiosInstance } from "axios";
import type {
  ConnectExperimentalGeolocationUserDto,
  ExperimentalConnectedUserState,
  ExperimentalGeolocationState,
  UpdateExperimentalGeolocationFlagsDto,
  UpdateExperimentalGeolocationUserLocationDto,
} from "../types/experimental-geolocation";

export function createExperimentalGeolocationResource(http: AxiosInstance) {
  const getState = async (): Promise<ExperimentalGeolocationState> => {
    const response = await http.get<ExperimentalGeolocationState>(
      `/admin/experimental-geolocation`,
    );
    return response.data;
  };

  const updateFlags = async (
    dto: UpdateExperimentalGeolocationFlagsDto,
  ): Promise<{
    positionsVisibleToEveryone: boolean;
    includeConnectedUsers: boolean;
  }> => {
    const response = await http.put<{
      positionsVisibleToEveryone: boolean;
      includeConnectedUsers: boolean;
    }>(`/admin/experimental-geolocation/flags`, dto);
    return response.data;
  };

  const connectUser = async (
    userId: string,
    dto: ConnectExperimentalGeolocationUserDto = {},
  ): Promise<ExperimentalConnectedUserState> => {
    const response = await http.post<ExperimentalConnectedUserState>(
      `/admin/experimental-geolocation/users/${userId}/connect`,
      dto,
    );
    return response.data;
  };

  const disconnectUser = async (
    userId: string,
  ): Promise<ExperimentalConnectedUserState> => {
    const response = await http.post<ExperimentalConnectedUserState>(
      `/admin/experimental-geolocation/users/${userId}/disconnect`,
    );
    return response.data;
  };

  const updateUserLocation = async (
    userId: string,
    dto: UpdateExperimentalGeolocationUserLocationDto,
  ): Promise<{ userId: string; latitude: number; longitude: number }> => {
    const response = await http.put<{
      userId: string;
      latitude: number;
      longitude: number;
    }>(`/admin/experimental-geolocation/users/${userId}/location`, dto);
    return response.data;
  };

  return {
    getState,
    updateFlags,
    connectUser,
    disconnectUser,
    updateUserLocation,
  };
}

export type ExperimentalGeolocationResource = ReturnType<
  typeof createExperimentalGeolocationResource
>;
