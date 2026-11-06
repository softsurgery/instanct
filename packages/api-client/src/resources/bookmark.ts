import type { AxiosInstance } from "axios";
import type { ResponseUserBookmarkDto } from "../types";

export function createBookmarkResource(http: AxiosInstance) {
  const findBookmark = async (id: string): Promise<ResponseUserBookmarkDto> => {
    const response = await http.get<ResponseUserBookmarkDto>(
      `/user-bookmark/${id}`,
    );
    return response.data;
  };

  const saveBookmark = async (id: string): Promise<ResponseUserBookmarkDto> => {
    const response = await http.post<ResponseUserBookmarkDto>(
      `/user-bookmark/${id}`,
      {},
    );
    return response.data;
  };

  const deleteBookmark = async (
    id: string,
  ): Promise<ResponseUserBookmarkDto> => {
    const response = await http.delete<ResponseUserBookmarkDto>(
      `/user-bookmark/${id}`,
    );
    return response.data;
  };

  return {
    findBookmark,
    saveBookmark,
    deleteBookmark,
  };
}

export type BookmarkResource = ReturnType<typeof createBookmarkResource>;
