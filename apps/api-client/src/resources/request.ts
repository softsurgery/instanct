import type { AxiosInstance } from "axios";
import type {
  CreateRequestDto,
  Paginated,
  QueryParams,
  RequestEvent,
  ResponseRequestDto,
  ResponseRequestWorkflowDto,
  UpdateRequestDto,
} from "../types";
import { listParams } from "./query";

export function createRequestResource(http: AxiosInstance) {
  const findAllPaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponseRequestDto>> => {
    const response = await http.get<Paginated<ResponseRequestDto>>(
      `/requests/list`,
      { params: listParams(query, { join: "session" }) },
    );
    return response.data;
  };

  const findAllIncomingPaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponseRequestDto>> => {
    const response = await http.get<Paginated<ResponseRequestDto>>(
      `/requests/incoming/list`,
      { params: listParams(query) },
    );
    return response.data;
  };

  const findAllOutgoingPaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponseRequestDto>> => {
    const response = await http.get<Paginated<ResponseRequestDto>>(
      `/requests/outgoing/list`,
      { params: listParams(query) },
    );
    return response.data;
  };

  const findOneById = async (
    id: string,
    join?: string,
  ): Promise<ResponseRequestDto> => {
    const response = await http.get<ResponseRequestDto>(`/requests/${id}`, {
      params: { join },
    });
    return response.data;
  };

  const send = async (
    createRequestDto: CreateRequestDto,
  ): Promise<ResponseRequestDto> => {
    const response = await http.post<ResponseRequestDto>(
      `/requests`,
      createRequestDto,
    );
    return response.data;
  };

  const updateStatus = async (
    id: number,
    event: RequestEvent,
  ): Promise<ResponseRequestWorkflowDto> => {
    const response = await http.post<ResponseRequestWorkflowDto>(
      `/request-workflow/${id}/next`,
      { event },
    );
    return response.data;
  };

  const update = async (
    id: string,
    updateRequestDto: UpdateRequestDto,
  ): Promise<ResponseRequestDto> => {
    const response = await http.put<ResponseRequestDto>(
      `/requests/${id}`,
      updateRequestDto,
    );
    return response.data;
  };

  return {
    findAllPaginated,
    findOneById,
    findAllIncomingPaginated,
    findAllOutgoingPaginated,
    send,
    update,
    updateStatus,
  };
}

export type RequestResource = ReturnType<typeof createRequestResource>;
