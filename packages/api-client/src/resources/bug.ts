import type { AxiosInstance } from "axios";
import {
  type CreateBugDto,
  type QueryParams,
  type Paginated,
  type ResponseBugDto,
} from "../types";

export function createBugResource(http: AxiosInstance) {
  return {
    create: async (createBugDto: CreateBugDto): Promise<ResponseBugDto> => {
      const { data } = await http.post<ResponseBugDto>(`/bug`, createBugDto);
      return data;
    },
    findPaginated: async (
      options?: QueryParams,
    ): Promise<Paginated<ResponseBugDto>> => {
      const { data } = await http.get<Paginated<ResponseBugDto>>(`/bug/list`, {
        params: options,
      });
      return data;
    },
    findAll: async (options?: QueryParams): Promise<ResponseBugDto[]> => {
      const { data } = await http.get<ResponseBugDto[]>(`/bug/all`, {
        params: options,
      });
      return data;
    },
    findOne: async (id: string): Promise<ResponseBugDto> => {
      const { data } = await http.get<ResponseBugDto>(`/bug/${id}`);
      return data;
    },
    updateStatus: async (
      id: string,
      status: string,
    ): Promise<ResponseBugDto> => {
      const { data } = await http.patch<ResponseBugDto>(`/bug/${id}/status`, {
        status,
      });
      return data;
    },
    delete: async (id: string): Promise<ResponseBugDto> => {
      const { data } = await http.delete<ResponseBugDto>(`/bug/${id}`);
      return data;
    },
  };
}

export type BugResource = ReturnType<typeof createBugResource>;
