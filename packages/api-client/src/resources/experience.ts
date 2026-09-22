import type { AxiosInstance } from "axios";
import type {
  CreateExperienceDto,
  ResponseExperienceDto,
  UpdateExperienceDto,
} from "../types";

export function createExperienceResource(http: AxiosInstance) {
  const findAllByUser = async (
    userId: string,
  ): Promise<ResponseExperienceDto[]> => {
    const response = await http.get<ResponseExperienceDto[]>(
      `/experience/user/${userId}`,
    );
    return response.data;
  };

  const create = async (
    userId: string,
    experience: CreateExperienceDto,
  ): Promise<ResponseExperienceDto> => {
    const response = await http.post(`/experience/user/${userId}`, experience);
    return response.data;
  };

  const update = async (
    id: number,
    experience: UpdateExperienceDto,
  ): Promise<ResponseExperienceDto> => {
    const response = await http.put(`/experience/${id}`, experience);
    return response.data;
  };

  const remove = async (id: number): Promise<ResponseExperienceDto> => {
    const response = await http.delete(`/experience/${id}`);
    return response.data;
  };

  return {
    findAllByUser,
    create,
    update,
    remove,
  };
}

export type ExperienceResource = ReturnType<typeof createExperienceResource>;
