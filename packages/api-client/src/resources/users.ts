import type { AxiosInstance } from "axios";
import type {
  CreateUserDto,
  Paginated,
  QueryParams,
  ResponseUserDto,
  UpdateUserDto,
} from "../types";
import { listParams } from "./query";

export function createUserResource(http: AxiosInstance) {
  const findPaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<ResponseUserDto>> => {
    const response = await http.get<Paginated<ResponseUserDto>>(
      `/admin/user/list`,
      { params: listParams(query) },
    );
    return response.data;
  };

  const activate = async (id?: string): Promise<ResponseUserDto> => {
    const response = await http.put(`/admin/user/activate/${id}`);
    return response.data;
  };

  const deactivate = async (id?: string): Promise<ResponseUserDto> => {
    const response = await http.put(`/admin/user/deactivate/${id}`);
    return response.data;
  };

  const approve = async (id?: string): Promise<ResponseUserDto> => {
    const response = await http.put(`/admin/user/approve/${id}`);
    return response.data;
  };

  const disapprove = async (id?: string): Promise<ResponseUserDto> => {
    const response = await http.put(`/admin/user/disapprove/${id}`);
    return response.data;
  };

  const findAll = async (): Promise<ResponseUserDto[]> => {
    const response = await http.get<ResponseUserDto[]>(`/admin/user/all`);
    return response.data;
  };

  const findById = async (
    userId?: string,
    join?: string,
  ): Promise<ResponseUserDto> => {
    const response = await http.get<ResponseUserDto>(`/admin/user/${userId}`, {
      params: { join },
    });
    return response.data;
  };

  const findByEmail = async (
    email?: string,
    join?: string,
  ): Promise<ResponseUserDto> => {
    const response = await http.get<ResponseUserDto>(
      `/admin/user/email/${email}`,
      { params: { join } },
    );
    return response.data;
  };

  const create = async (user: CreateUserDto): Promise<ResponseUserDto> => {
    const response = await http.post("/admin/user", user);
    return response.data;
  };

  const update = async (
    id?: string,
    user?: UpdateUserDto,
  ): Promise<ResponseUserDto> => {
    const response = await http.put(`/admin/user/${id}`, user);
    return response.data;
  };

  const updateCover = async (
    id: string,
    coverId: number,
  ): Promise<ResponseUserDto> => {
    const response = await http.put(`/admin/user/cover/${id}`, { coverId });
    return response.data;
  };

  const remove = async (userId?: string): Promise<ResponseUserDto> => {
    const response = await http.delete(`/admin/user/${userId}`);
    return response.data;
  };

  const hasPermissions = async (
    userId?: string,
    permissions?: string[],
  ): Promise<boolean> => {
    const response = await http.get(`/admin/user/${userId}/permissions`);
    return (
      permissions?.every((permission) => response.data.includes(permission)) ||
      false
    );
  };

  const updateObjectives = async (
    id: string,
    objectives: number[],
  ): Promise<ResponseUserDto> => {
    const response = await http.put(`/admin/user/objectives/${id}`, {
      objectives,
    });
    return response.data;
  };

  const updateIndustries = async (
    id: string,
    industries: number[],
  ): Promise<ResponseUserDto> => {
    const response = await http.put(`/admin/user/industries/${id}`, {
      industries,
    });
    return response.data;
  };

  const getObjectives = async (id: string): Promise<number[] | null> => {
    const response = await http.get(`/admin/user/objectives/${id}`);
    return response.data;
  };

  const getIndustries = async (id: string): Promise<number[] | null> => {
    const response = await http.get(`/admin/user/industries/${id}`);
    return response.data;
  };

  return {
    findPaginated,
    findAll,
    findById,
    findByEmail,
    create,
    update,
    updateCover,
    activate,
    deactivate,
    approve,
    disapprove,
    remove,
    hasPermissions,
    updateIndustries,
    updateObjectives,
    getIndustries,
    getObjectives,
  };
}

export type UserResource = ReturnType<typeof createUserResource>;
