import type { AxiosInstance } from "axios";
import type {
  Paginated,
  QueryParams,
  ServerResponse,
  Upload,
} from "../types";
import { listParams } from "./query";

export function createUploadResource(http: AxiosInstance) {
  const findPaginated = async (
    query: QueryParams = {},
  ): Promise<Paginated<Upload>> => {
    const response = await http.get<Paginated<Upload>>(`/storage/list`, {
      params: listParams(query),
    });
    return response.data;
  };

  const uploadFiles = async (
    files: File[],
    onProgress?: (percent: number) => void,
    temporary: boolean = true,
  ): Promise<Upload[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await http.post<Upload[]>(
      temporary ? "/storage/multiple/temporary" : "/storage/multiple",
      formData,
      {
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            onProgress(percent);
          }
        },
      },
    );
    return response.data;
  };

  const downloadFile = async (slug: string, filename?: string) => {
    const response = await http.get(`/storage/download/slug/${slug}`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename || slug;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const openFile = async (slug: string) => {
    const response = await http.get(`/storage/download/slug/${slug}`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const getUploadBySlug = async (slug: string) => {
    const { data } = await http.get(`/storage/view/slug/${slug}`, {
      responseType: "blob",
    });
    return URL.createObjectURL(data);
  };

  const getUploadById = async (id: number) => {
    const { data } = await http.get(`/storage/view/id/${id}`, {
      responseType: "blob",
    });
    return URL.createObjectURL(data);
  };

  const deleteFile = async (slug: string): Promise<ServerResponse<Upload>> => {
    const response = await http.delete(`/storage/${slug}`);
    return response.data;
  };

  return {
    findPaginated,
    uploadFiles,
    downloadFile,
    deleteFile,
    openFile,
    getUploadBySlug,
    getUploadById,
  };
}

export type UploadResource = ReturnType<typeof createUploadResource>;
