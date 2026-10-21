import React from "react";
import { useApi } from "@/contexts/ApiContext";
import {
  clampUploadProgress,
  type UploadFileInput,
  type UploadProgressCallback,
} from "@/lib/upload";
import type { ServerErrorResponse, Upload } from "@softsurgery/api-client";
import { useMutation } from "@tanstack/react-query";

export interface UploadFilesVariables {
  files: UploadFileInput[];
  onProgress?: UploadProgressCallback;
}

export type UploadFilesMutate = (variables: UploadFilesVariables) => void;

export interface UseUploadMutationProps {
  temporary?: boolean;
  onProgress?: UploadProgressCallback;
  onSuccess?: (response: Upload[]) => void;
  onError?: (error: ServerErrorResponse) => void;
}

export const useUploadMutation = ({
  temporary = true,
  onProgress,
  onSuccess,
  onError,
}: UseUploadMutationProps) => {
  const api = useApi();
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
