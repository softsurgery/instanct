import type { ReactNativeUploadFile, UploadFileInput } from "../types/chat-pending";

export type { ReactNativeUploadFile, UploadFileInput };

export const clampUploadProgress = (percent: number): number => {
  if (!Number.isFinite(percent)) return 0;
  return Math.max(0, Math.min(100, Math.round(percent)));
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

export const waitForUiReady = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
};
