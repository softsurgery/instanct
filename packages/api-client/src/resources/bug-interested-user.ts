import type { AxiosInstance } from "axios";
import {
  type CreateBugInterestedUserDto,
  type QueryParams,
  type Paginated,
  type ResponseBugInterestedUserDto,
} from "../types";

export function createBugInterestedUserResource(http: AxiosInstance) {
  return {
    create: async (
      dto: CreateBugInterestedUserDto,
    ): Promise<ResponseBugInterestedUserDto> => {
      const { data } = await http.post<ResponseBugInterestedUserDto>(
        `/bug-interested-user`,
        dto,
      );
      return data;
    },
    findPaginated: async (
      options?: QueryParams,
    ): Promise<Paginated<ResponseBugInterestedUserDto>> => {
      const { data } = await http.get<Paginated<ResponseBugInterestedUserDto>>(
        `/bug-interested-user/list`,
        { params: options },
      );
      return data;
    },
    findAll: async (
      options?: QueryParams,
    ): Promise<ResponseBugInterestedUserDto[]> => {
      const { data } = await http.get<ResponseBugInterestedUserDto[]>(
        `/bug-interested-user/all`,
        { params: options },
      );
      return data;
    },
    findByBugId: async (
      bugId: number,
    ): Promise<ResponseBugInterestedUserDto[]> => {
      const { data } = await http.get<ResponseBugInterestedUserDto[]>(
        `/bug-interested-user/bug/${bugId}`,
      );
      return data;
    },
    findOne: async (id: number): Promise<ResponseBugInterestedUserDto> => {
      const { data } = await http.get<ResponseBugInterestedUserDto>(
        `/bug-interested-user/${id}`,
      );
      return data;
    },
    delete: async (id: number): Promise<ResponseBugInterestedUserDto> => {
      const { data } = await http.delete<ResponseBugInterestedUserDto>(
        `/bug-interested-user/${id}`,
      );
      return data;
    },
    removeByBugAndUser: async (
      bugId: number,
      userId: string,
    ): Promise<ResponseBugInterestedUserDto> => {
      const { data } = await http.delete<ResponseBugInterestedUserDto>(
        `/bug-interested-user/bug/${bugId}/user/${userId}`,
      );
      return data;
    },
  };
}

export type BugInterestedUserResource = ReturnType<
  typeof createBugInterestedUserResource
>;
