import type { AxiosInstance } from "axios";
import {
  type QueryParams,
  type Paginated,
  type ResponseFeedbackDto,
} from "../types";

export function createFeedbackResource(http: AxiosInstance) {
  return {
    findPaginated: async (
      options?: QueryParams
    ): Promise<Paginated<ResponseFeedbackDto>> => {
      const { data } = await http.get<Paginated<ResponseFeedbackDto>>(`/feedback/list`, {
        params: options,
      });
      return data;
    },
    findAll: async (options?: QueryParams): Promise<ResponseFeedbackDto[]> => {
      const { data } = await http.get<ResponseFeedbackDto[]>(`/feedback/all`, {
        params: options,
      });
      return data;
    },
    findOne: async (id: string): Promise<ResponseFeedbackDto> => {
      const { data } = await http.get<ResponseFeedbackDto>(`/feedback/${id}`);
      return data;
    },
    delete: async (id: string): Promise<ResponseFeedbackDto> => {
      const { data } = await http.delete<ResponseFeedbackDto>(`/feedback/${id}`);
      return data;
    },
  };
}

export type FeedbackResource = ReturnType<typeof createFeedbackResource>;
