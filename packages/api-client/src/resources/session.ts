import type { AxiosInstance } from "axios";
import type {
  CreateSessionDto,
  Paginated,
  QueryParams,
  ResponseSessionDto,
  UpdateSessionDto,
} from "../types";
import { filterParams, listParams } from "./query";

export function createSessionResource(http: AxiosInstance) {
  const findAllPaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponseSessionDto>> => {
    const response = await http.get<Paginated<ResponseSessionDto>>(
      `/current-session/list`,
      { params: listParams(query) },
    );
    return response.data;
  };

  const findAll = async (
    query: Pick<QueryParams, "join"> = {},
  ): Promise<ResponseSessionDto[]> => {
    const response = await http.get<ResponseSessionDto[]>(
      `/current-session/all`,
      { params: filterParams(query) },
    );
    return response.data;
  };

  const findAllActivePaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponseSessionDto>> => {
    const response = await http.get<Paginated<ResponseSessionDto>>(
      `/current-session/active-list`,
      { params: listParams(query) },
    );
    return response.data;
  };

  const findAllActive = async (
    query: Pick<QueryParams, "join"> = {},
  ): Promise<ResponseSessionDto[]> => {
    const response = await http.get<ResponseSessionDto[]>(
      `/current-session/active-all`,
      { params: filterParams(query) },
    );
    return response.data;
  };

  const start = async (
    createSessionDto: CreateSessionDto,
  ): Promise<ResponseSessionDto> => {
    const response = await http.post<ResponseSessionDto>(
      `/current-session/start`,
      createSessionDto,
    );
    return response.data;
  };

  const update = async (
    sessionId: number,
    updateSessionDto: UpdateSessionDto,
  ): Promise<ResponseSessionDto> => {
    const response = await http.put<ResponseSessionDto>(
      `/current-session/update/${sessionId}`,
      updateSessionDto,
    );
    return response.data;
  };

  const end = async (sessionId: number): Promise<void> => {
    await http.put(`/current-session/end/${sessionId}`);
  };

  return {
    findAllPaginated,
    findAll,
    findAllActivePaginated,
    findAllActive,
    start,
    update,
    end,
  };
}

export type SessionResource = ReturnType<typeof createSessionResource>;
