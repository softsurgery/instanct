import type { AxiosInstance } from "axios";
import type {
  CreateTemplateDto,
  Paginated,
  QueryParams,
  ResponseTemplateDto,
  UpdateTemplateDto,
} from "../types";

export function createTemplateResource(http: AxiosInstance) {
  const findPaginated = async ({
    page = "1",
    limit = "25",
    sort,
    search = "",
    filter = "",
    join = "",
  }: QueryParams): Promise<Paginated<ResponseTemplateDto>> => {
    const params: { [key: string]: string | undefined } = {
      page,
      limit,
      sort,
    };

    if (search) params.search = search;
    if (filter) params.filter = filter;
    if (join) params.join = join;

    const response = await http.get<Paginated<ResponseTemplateDto>>(
      `/templates/list`,
      { params },
    );

    return response.data;
  };

  const findAll = async (
    params?: QueryParams,
  ): Promise<ResponseTemplateDto[]> => {
    const response = await http.get<ResponseTemplateDto[]>(
      `/templates/all`,
      { params },
    );
    return response.data;
  };

  const findById = async (id: string): Promise<ResponseTemplateDto> => {
    const response = await http.get<ResponseTemplateDto>(
      `/templates/${id}`,
    );
    return response.data;
  };

  const create = async (
    dto: CreateTemplateDto,
  ): Promise<ResponseTemplateDto> => {
    const response = await http.post("/templates", dto);
    return response.data;
  };

  const update = async (
    id: string,
    dto: UpdateTemplateDto,
  ): Promise<ResponseTemplateDto> => {
    const response = await http.put(`/templates/${id}`, dto);
    return response.data;
  };

  const remove = async (id: string): Promise<ResponseTemplateDto> => {
    const response = await http.delete(`/templates/${id}`);
    return response.data;
  };

  return {
    findPaginated,
    findAll,
    findById,
    create,
    update,
    remove,
  };
}

export type TemplateResource = ReturnType<typeof createTemplateResource>;
