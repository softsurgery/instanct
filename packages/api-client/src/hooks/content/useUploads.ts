import { useQueries } from "@tanstack/react-query";
import { useApi } from "../context/ApiContext";

interface UploadResult {
  id: number;
  url: string;
  name: string;
  image: null;
  progress: number;
}

export const useUploads = (ids?: number[]) => {
  const api = useApi();
  const results = useQueries({
    queries: (ids ?? []).map((id) => ({
      queryKey: ["upload", id],
      queryFn: async (): Promise<UploadResult> => {
        const url = await api.upload.getUploadById(id);
        return {
          id,
          url,
          name: `image-${id}.png`,
          image: null,
          progress: 100,
        };
      },
      enabled: !!id,
      staleTime: Infinity,
      retry: false,
    })),
  });

  const isPending = results.some((r) => r.isPending);
  const uploads = results
    .map((r) => r.data)
    .filter((u): u is UploadResult => Boolean(u));

  return { uploads, isPending };
};
