import React from "react";
import { useQuery } from "@tanstack/react-query";

export type UploadSrcRef = { id?: number; slug?: string } | null | undefined;

export type UploadSrcApi = {
  getUploadBySlug: (slug: string) => Promise<string>;
  getUploadById: (id: number) => Promise<string>;
};

export function useUploadSrc(upload: UploadSrcRef, api: UploadSrcApi) {
  const query = useQuery({
    queryKey: ["upload-src", upload?.id, upload?.slug],
    enabled: Boolean(upload?.id || upload?.slug),
    queryFn: async () => {
      if (upload?.slug) return api.getUploadBySlug(upload.slug);
      if (upload?.id) return api.getUploadById(upload.id);
    },
  });

  React.useEffect(() => {
    return () => {
      if (query.data) URL.revokeObjectURL(query.data);
    };
  }, [query.data]);

  return query;
}
