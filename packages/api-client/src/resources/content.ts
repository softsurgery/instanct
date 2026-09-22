import type { AxiosInstance } from "axios";
import type {
  CreateContentPageDto,
  Paginated,
  QueryParams,
  ResponseContentPageDto,
  UpdateContentPageDto,
} from "../types";

export function createContentPageResource(http: AxiosInstance) {
  const findPaginated = async ({
    page = "1",
    limit = "25",
    sort,
    search = "",
    filter = "",
    join = "",
  }: QueryParams): Promise<Paginated<ResponseContentPageDto>> => {
    const params: { [key: string]: string | undefined } = {
      page,
      limit,
      sort,
    };

    if (search) params.search = search;
    if (filter) params.filter = filter;
    if (join) params.join = join;

    const response = await http.get<Paginated<ResponseContentPageDto>>(
      `/content-pages/list`,
      { params },
    );

    return response.data;
  };

  const findAll = async (
    params?: QueryParams,
  ): Promise<ResponseContentPageDto[]> => {
    const response = await http.get<ResponseContentPageDto[]>(
      `/content-pages/all`,
      { params },
    );
    return response.data;
  };

  const findById = async (id: string): Promise<ResponseContentPageDto> => {
    const response = await http.get<ResponseContentPageDto>(
      `/content-pages/${id}`,
    );
    return response.data;
  };

  const findBySlug = async (slug: string): Promise<ResponseContentPageDto> => {
    const response = await http.get<ResponseContentPageDto>(
      `/content-pages/slug/${slug}`,
    );
    return response.data;
  };

  const create = async (
    dto: CreateContentPageDto,
  ): Promise<ResponseContentPageDto> => {
    const response = await http.post("/content-pages", dto);
    return response.data;
  };

  const update = async (
    id: string,
    dto: UpdateContentPageDto,
  ): Promise<ResponseContentPageDto> => {
    const response = await http.put(`/content-pages/${id}`, dto);
    return response.data;
  };

  const remove = async (
    id: string,
  ): Promise<ResponseContentPageDto | null> => {
    const response = await http.delete(`/content-pages/${id}`);
    return response.data;
  };

  return {
    findPaginated,
    findAll,
    findById,
    findBySlug,
    create,
    update,
    remove,
  };
}

export type ContentPageResource = ReturnType<typeof createContentPageResource>;
