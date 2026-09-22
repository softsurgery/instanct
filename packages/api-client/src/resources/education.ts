import type { AxiosInstance } from "axios";
import type {
  CreateEducationDto,
  ResponseEducationDto,
  UpdateEducationDto,
} from "../types";

export function createEducationResource(http: AxiosInstance) {
  const findAllByUser = async (
    userId: string,
  ): Promise<ResponseEducationDto[]> => {
    const response = await http.get<ResponseEducationDto[]>(
      `/education/user/${userId}`,
    );
    return response.data;
  };

  const create = async (
    userId: string,
    education: CreateEducationDto,
  ): Promise<ResponseEducationDto> => {
    const response = await http.post(`/education/user/${userId}`, education);
    return response.data;
  };

  const update = async (
    id: string,
    education: UpdateEducationDto,
  ): Promise<ResponseEducationDto> => {
    const response = await http.put(`/education/${id}`, education);
    return response.data;
  };

  const remove = async (id: string): Promise<ResponseEducationDto> => {
    const response = await http.delete(`/education/${id}`);
    return response.data;
  };

  return {
    findAllByUser,
    create,
    update,
    remove,
  };
}

export type EducationResource = ReturnType<typeof createEducationResource>;
