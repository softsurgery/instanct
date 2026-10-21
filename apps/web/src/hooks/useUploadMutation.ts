import React from "react";
import { api } from "@/lib/api";
import type { ServerErrorResponse, Upload } from "@softsurgery/api-client";
import { useMutation } from "@tanstack/react-query";

export type UploadProgressCallback = (percent: number) => void;

export interface UploadFilesVariables {
  files: File[];
  onProgress?: UploadProgressCallback;
}

export interface UseUploadMutationProps {
  temporary?: boolean;
  onProgress?: UploadProgressCallback;
  onSuccess?: (response: Upload[]) => void;
  onError?: (error: ServerErrorResponse) => void;
}

const clampUploadProgress = (percent: number): number => {
  if (!Number.isFinite(percent)) return 0;
  return Math.max(0, Math.min(100, Math.round(percent)));
};

export const useUploadMutation = ({
  temporary = true,
  onProgress,
  onSuccess,
  onError,
}: UseUploadMutationProps) => {
  const [progress, setProgress] = React.useState<number>(0);

  const updateProgress = React.useCallback(
    (percent: number, mutationProgress?: UploadProgressCallback): void => {
      const normalized = clampUploadProgress(percent);
      setProgress(normalized);
      onProgress?.(normalized);
      mutationProgress?.(normalized);
    },
    [onProgress],
  );

  const { mutate: uploadFiles, isPending: isUploadPending } = useMutation<
    Upload[],
    ServerErrorResponse,
    UploadFilesVariables
  >({
    mutationFn: async ({
      files,
      onProgress: mutationProgress,
    }: UploadFilesVariables) => {
      updateProgress(0, mutationProgress);
      return api.upload.uploadFiles(
        files,
        (percent: number) => {
          updateProgress(percent, mutationProgress);
        },
        temporary,
      );
    },
    onSuccess: (data, variables) => {
      updateProgress(100, variables.onProgress);
      onSuccess?.(data);
    },
    onError: (error, variables) => {
      updateProgress(0, variables.onProgress);
      onError?.(error);
    },
  });

  return {
    uploadFiles,
    isUploadPending,
    progress,
  };
};
