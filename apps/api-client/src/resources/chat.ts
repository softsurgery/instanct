import type { AxiosInstance } from "axios";
import type {
  CreateConversationDto,
  CreateConversationReportDto,
  Paginated,
  QueryParams,
  ResponseConversationDto,
  ResponseMessageDto,
} from "../types";
import { listParams } from "./query";

export function createChatResource(http: AxiosInstance) {
  const findPaginatedUserConversations = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponseConversationDto>> => {
    const response = await http.get<Paginated<ResponseConversationDto>>(
      `/current-conversation/list`,
      { params: listParams(query) },
    );
    return response.data;
  };

  const findById = async (
    id: number,
    join?: string,
  ): Promise<ResponseConversationDto> => {
    const response = await http.get<ResponseConversationDto>(
      `/current-conversation/${id}`,
      { params: { join } },
    );
    return response.data;
  };

  const createConversation = async (
    payload: CreateConversationDto,
  ): Promise<ResponseConversationDto> => {
    const response = await http.post<ResponseConversationDto>(
      `/current-conversation`,
      payload,
    );
    return response.data;
  };

  const deleteConversation = async (id: number): Promise<void> => {
    await http.delete(`/current-conversation/${id}`);
  };

  const blockUser = async (userId: string): Promise<void> => {
    await http.post(`/user-block/${userId}`);
  };

  const reportConversation = async (
    id: number,
    payload: CreateConversationReportDto,
  ): Promise<void> => {
    await http.post(`/current-conversation/${id}/report`, payload);
  };

  const getUnreadCount = async (): Promise<number> => {
    const response = await http.get<{ count: number }>(
      `/current-conversation/unread-count`,
    );
    return response.data.count;
  };

  const findPaginatedConversationMessages = async (
    id: number,
    query: QueryParams = {},
  ): Promise<Paginated<ResponseMessageDto>> => {
    const response = await http.get<Paginated<ResponseMessageDto>>(
      `/message/${id}/list`,
      { params: listParams(query) },
    );
    return response.data;
  };

  return {
    conversation: {
      findPaginatedUserConversations,
      findById,
      createConversation,
      deleteConversation,
      blockUser,
      reportConversation,
      getUnreadCount,
    },
    message: {
      findPaginatedConversationMessages,
    },
  };
}

export type ChatResource = ReturnType<typeof createChatResource>;
