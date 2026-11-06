import type { AxiosInstance } from "axios";
import type {
  Paginated,
  QueryParams,
  ResponseConfigurationNamespaceDto,
  ResponseUserBookmarkDto,
  ResponseUserDto,
  UpdateUserCoverDto,
  UpdateUserDto,
  UpdateUserMapConfigurationDto,
} from "../types";
import { listParams } from "./query";

export function createCurrentUserResource(http: AxiosInstance) {
  const find = async (): Promise<ResponseUserDto> => {
    const response = await http.get<ResponseUserDto>(`/current-user`);
    return response.data;
  };

  const update = async (
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseUserDto> => {
    const response = await http.put<ResponseUserDto>(
      `/current-user`,
      updateUserDto,
    );
    return response.data;
  };

  const updateCover = async (
    updateUserCoverDto: UpdateUserCoverDto,
  ): Promise<ResponseUserDto> => {
    const response = await http.put<ResponseUserDto>(
      `/current-user/cover`,
      updateUserCoverDto,
    );
    return response.data;
  };

  const remove = async (): Promise<ResponseUserDto> => {
    const response = await http.delete<ResponseUserDto>(`/current-user`);
    return response.data;
  };

  const getMapConfiguration =
    async (): Promise<ResponseConfigurationNamespaceDto> => {
      const response = await http.get<ResponseConfigurationNamespaceDto>(
        `/current-user/configurations/maps/current`,
      );
      return response.data;
    };

  const updateMapConfiguration = async (
    mapConfiguration: UpdateUserMapConfigurationDto,
  ): Promise<ResponseConfigurationNamespaceDto> => {
    const response = await http.put<ResponseConfigurationNamespaceDto>(
      `/current-user/configuration/maps/current`,
      mapConfiguration,
    );
    return response.data;
  };

  const findPaginatedBookmarks = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponseUserBookmarkDto>> => {
    const response = await http.get<Paginated<ResponseUserBookmarkDto>>(
      `/current-user/bookmarks/list`,
      { params: listParams(query) },
    );
    return response.data;
  };

  return {
    find,
    update,
    updateCover,
    remove,
    getMapConfiguration,
    updateMapConfiguration,
    findPaginatedBookmarks,
  };
}

export type CurrentUserResource = ReturnType<typeof createCurrentUserResource>;
