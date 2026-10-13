import type { AxiosInstance } from "axios";
import { File as ExpoFile, UploadType } from "expo-file-system";
import { Platform } from "react-native";
import type { Upload } from "@instanct/api-client";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";

export type ReactNativeUploadFile = {
  uri: string;
  name: string;
  type: string;
};

export type UploadFileInput = File | ReactNativeUploadFile;

const isReactNativeUploadFile = (
  file: UploadFileInput,
): file is ReactNativeUploadFile =>
  typeof file === "object" &&
  file !== null &&
  "uri" in file &&
  typeof file.uri === "string";

const reportUploadProgress = (
  onProgress: ((percent: number) => void) | undefined,
  loaded: number,
  total?: number,
): void => {
  if (!onProgress) return;

  if (total && total > 0) {
    onProgress(Math.min(99, Math.round((loaded * 100) / total)));
    return;
  }

  if (loaded > 0) {
    onProgress(Math.min(95, Math.max(1, Math.round(loaded / 2048))));
  }
};

export function createMobileUpload(http: AxiosInstance) {
  const baseURL = http.defaults.baseURL ?? "";

  const getUploadHeaders = (): Record<string, string> => {
    const authStore = useAuthPersistStore.getState();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (authStore.accessToken) {
      headers.Authorization = `Bearer ${authStore.accessToken}`;
    }

    if (timezone) {
      headers["x-timezone"] = timezone;
    }

    return headers;
  };

  const uploadNativeFile = async (
    file: ReactNativeUploadFile,
    onProgress: ((percent: number) => void) | undefined,
    temporary: boolean,
    finalizeProgress = true,
  ): Promise<Upload> => {
    const expoFile = new ExpoFile(file.uri);
    const endpoint = temporary
      ? "/storage/upload/temporary"
      : "/storage/upload";

    const result = await expoFile.upload(`${baseURL}${endpoint}`, {
      uploadType: UploadType.MULTIPART,
      fieldName: "file",
      mimeType: file.type,
      parameters: {
        filename: file.name,
      },
      headers: getUploadHeaders(),
      onProgress: ({ bytesSent, totalBytes }) => {
        reportUploadProgress(onProgress, bytesSent, totalBytes);
      },
    });

    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Upload failed with status ${result.status}`);
    }

    if (finalizeProgress) {
      onProgress?.(100);
    }

    return JSON.parse(result.body) as Upload;
  };

  const uploadNativeFiles = async (
    files: ReactNativeUploadFile[],
    onProgress: ((percent: number) => void) | undefined,
    temporary: boolean,
  ): Promise<Upload[]> => {
    const uploads: Upload[] = [];
    onProgress?.(0);

    for (let i = 0; i < files.length; i++) {
      const upload = await uploadNativeFile(
        files[i],
        (filePercent) => {
          const overall = Math.round((i * 100 + filePercent) / files.length);
          onProgress?.(Math.min(99, overall));
        },
        temporary,
        false,
      );
      uploads.push(upload);
    }

    onProgress?.(100);
    return uploads;
  };

  const uploadFile = async (
    file: UploadFileInput,
    onProgress?: (percent: number) => void,
    temporary: boolean = true,
  ): Promise<Upload> => {
    if (Platform.OS !== "web" && isReactNativeUploadFile(file)) {
      return uploadNativeFile(file, onProgress, temporary);
    }

    const formData = new FormData();
    formData.append("file", file as File);
    if (isReactNativeUploadFile(file)) {
      formData.append("filename", file.name);
    }

    onProgress?.(0);

    const response = await http.post<Upload>(
      temporary ? "/storage/upload/temporary" : "/storage/upload",
      formData,
      {
        headers: {
          Accept: "application/json",
        },
        onUploadProgress: (event) => {
          reportUploadProgress(onProgress, event.loaded, event.total);
        },
      },
    );

    onProgress?.(100);
    return response.data;
  };

  const uploadFiles = async (
    files: UploadFileInput[],
    onProgress?: (percent: number) => void,
    temporary: boolean = true,
    totalBytes?: number,
  ): Promise<Upload[]> => {
    if (
      Platform.OS !== "web" &&
      files.length > 0 &&
      files.every(isReactNativeUploadFile)
    ) {
      return uploadNativeFiles(files, onProgress, temporary);
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file as File);
    });

    onProgress?.(0);

    const response = await http.post<Upload[]>(
      temporary ? "/storage/multiple/temporary" : "/storage/multiple",
      formData,
      {
        headers: {
          Accept: "application/json",
        },
        onUploadProgress: (event) => {
          reportUploadProgress(
            onProgress,
            event.loaded,
            event.total || totalBytes,
          );
        },
      },
    );

    onProgress?.(100);
    return response.data;
  };

  const fetchUploadById = async (id: number): Promise<Upload> => {
    const response = await http.get<Upload>(`/storage/${id}`);
    return response.data;
  };

  const authorizedSource = (path: string) => {
    const authStore = useAuthPersistStore.getState();
    return {
      uri: `${baseURL}${path}`,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    };
  };

  const getUploadById = (id: number) =>
    authorizedSource(`/storage/view/id/${id}`);

  const getUploadBySlug = (slug: string) =>
    authorizedSource(`/storage/view/slug/${slug}`);

  const getUploadDownloadById = (id: number) =>
    authorizedSource(`/storage/download/id/${id}`);

  return {
    uploadFile,
    uploadFiles,
    fetchUploadById,
    getUploadBySlug,
    getUploadById,
    getUploadDownloadById,
  };
}
