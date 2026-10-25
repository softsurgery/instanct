import type { AxiosInstance } from "axios";
import { File as ExpoFile, UploadType } from "expo-file-system";
import { Platform } from "react-native";
import type { Upload } from "api-client";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";

export type ReactNativeUploadFile = {
  uri: string;
  name: string;
  type: string;
};

export type UploadFileInput = File | ReactNativeUploadFile;

export type UploadProgressCallback = (percent: number) => void;

const isReactNativeUploadFile = (
  file: UploadFileInput,
): file is ReactNativeUploadFile =>
  typeof file === "object" &&
  file !== null &&
  "uri" in file &&
  typeof file.uri === "string";

const toSafeByteCount = (value?: number | bigint | null): number => {
  if (typeof value === "bigint") {
    const converted = Number(value);
    return Number.isFinite(converted) && converted > 0 ? converted : 0;
  }
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  return 0;
};

export const clampUploadProgress = (percent: number): number => {
  if (!Number.isFinite(percent)) return 0;
  return Math.max(0, Math.min(100, Math.round(percent)));
};

export const calculateUploadProgress = (
  loaded: number | bigint,
  total?: number | bigint | null,
): number => {
  const loadedBytes = toSafeByteCount(loaded);
  const totalBytes = toSafeByteCount(total);

  if (totalBytes > 0) {
    return Math.min(99, clampUploadProgress((loadedBytes * 100) / totalBytes));
  }

  if (loadedBytes > 0) {
    return Math.min(95, Math.max(1, Math.round(loadedBytes / 2048)));
  }

  return 0;
};

export const calculateBatchUploadProgress = (
  fileIndex: number,
  fileCount: number,
  filePercent: number,
  capAt99 = true,
): number => {
  if (fileCount <= 0) return 0;
  const normalizedFilePercent = clampUploadProgress(filePercent);
  const overall = clampUploadProgress(
    (fileIndex * 100 + normalizedFilePercent) / fileCount,
  );
  return capAt99 ? Math.min(99, overall) : overall;
};

export const createUploadProgressTracker = (
  onProgress?: UploadProgressCallback,
) => {
  let currentProgress = 0;

  const emit = (nextPercent: number, allowDecrease = false): void => {
    if (!onProgress) return;
    const clamped = clampUploadProgress(nextPercent);
    const nextValue = allowDecrease
      ? clamped
      : Math.max(currentProgress, clamped);
    currentProgress = nextValue;
    onProgress(nextValue);
  };

  return {
    start: () => emit(0, true),
    reportBytes: (
      loaded: number | bigint,
      total?: number | bigint | null,
    ): void => {
      const percent = calculateUploadProgress(loaded, total);
      if (percent > 0) {
        emit(percent);
      }
    },
    reportPercent: (percent: number, capAt99 = true): void => {
      const capped = capAt99 ? Math.min(99, percent) : percent;
      emit(capped);
    },
    complete: () => emit(100),
    reset: () => emit(0, true),
  };
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
    onProgress: UploadProgressCallback | undefined,
    temporary: boolean,
    trackLifecycle = true,
  ): Promise<Upload> => {
    const expoFile = new ExpoFile(file.uri);
    const endpoint = temporary
      ? "/storage/upload/temporary"
      : "/storage/upload";
    const tracker = createUploadProgressTracker(onProgress);

    if (trackLifecycle) {
      tracker.start();
    }

    const result = await expoFile.upload(`${baseURL}${endpoint}`, {
      uploadType: UploadType.MULTIPART,
      fieldName: "file",
      mimeType: file.type,
      parameters: {
        filename: file.name,
      },
      headers: getUploadHeaders(),
      onProgress: ({ bytesSent, totalBytes }) => {
        tracker.reportBytes(bytesSent, totalBytes);
      },
    });

    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Upload failed with status ${result.status}`);
    }

    if (trackLifecycle) {
      tracker.complete();
    }

    return JSON.parse(result.body) as Upload;
  };

  const uploadNativeFiles = async (
    files: ReactNativeUploadFile[],
    onProgress: UploadProgressCallback | undefined,
    temporary: boolean,
  ): Promise<Upload[]> => {
    const uploads: Upload[] = [];
    const tracker = createUploadProgressTracker(onProgress);
    tracker.start();

    for (let i = 0; i < files.length; i++) {
      const upload = await uploadNativeFile(
        files[i],
        (filePercent: number) => {
          tracker.reportPercent(
            calculateBatchUploadProgress(i, files.length, filePercent),
          );
        },
        temporary,
        false,
      );
      uploads.push(upload);
      tracker.reportPercent(calculateBatchUploadProgress(i, files.length, 100));
    }

    tracker.complete();
    return uploads;
  };

  const uploadFile = async (
    file: UploadFileInput,
    onProgress?: UploadProgressCallback,
    temporary: boolean = true,
  ): Promise<Upload> => {
    if (Platform.OS !== "web" && isReactNativeUploadFile(file)) {
      return uploadNativeFile(file, onProgress, temporary, true);
    }

    const formData = new FormData();
    if (isReactNativeUploadFile(file)) {
      if (Platform.OS === "web") {
        try {
          const res = await fetch(file.uri);
          const blob = await res.blob();
          formData.append("file", blob, file.name);
        } catch {
          formData.append("file", file as unknown as Blob);
        }
      } else {
        formData.append("file", file as unknown as Blob);
        formData.append("filename", file.name);
      }
    } else {
      formData.append("file", file);
    }

    const tracker = createUploadProgressTracker(onProgress);
    tracker.start();

    const response = await http.post<Upload>(
      temporary ? "/storage/upload/temporary" : "/storage/upload",
      formData,
      {
        headers: {
          Accept: "application/json",
        },
        onUploadProgress: (event) => {
          tracker.reportBytes(event.loaded, event.total);
        },
      },
    );

    tracker.complete();
    return response.data;
  };

  const uploadFiles = async (
    files: UploadFileInput[],
    onProgress?: UploadProgressCallback,
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
    for (const file of files) {
      if (isReactNativeUploadFile(file)) {
        if (Platform.OS === "web") {
          try {
            const res = await fetch(file.uri);
            const blob = await res.blob();
            formData.append("files", blob, file.name);
          } catch {
            formData.append("files", file as unknown as Blob);
          }
        } else {
          formData.append("files", file as unknown as Blob);
        }
      } else {
        formData.append("files", file);
      }
    }

    const tracker = createUploadProgressTracker(onProgress);
    tracker.start();

    const response = await http.post<Upload[]>(
      temporary ? "/storage/multiple/temporary" : "/storage/multiple",
      formData,
      {
        headers: {
          Accept: "application/json",
        },
        onUploadProgress: (event) => {
          tracker.reportBytes(event.loaded, event.total || totalBytes);
        },
      },
    );

    tracker.complete();
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
