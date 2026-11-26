import type { AxiosInstance } from "axios";

export type MediaStorageViewOptions = {
  width?: number;
  height?: number;
  quality?: number;
  fit?: "cover" | "contain" | "inside" | "outside" | "fill";
};

export function buildViewQueryString(options?: MediaStorageViewOptions): string {
  if (!options) return "";
  const params = new URLSearchParams();
  if (typeof options.width === "number" && options.width > 0) {
    params.set("w", String(Math.round(options.width)));
  }
  if (typeof options.height === "number" && options.height > 0) {
    params.set("h", String(Math.round(options.height)));
  }
  if (typeof options.quality === "number" && options.quality > 0) {
    params.set("q", String(Math.round(options.quality)));
  }
  if (options.fit) {
    params.set("fit", options.fit);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function createMediaStorageResource(http: AxiosInstance) {
  const getMediaBySlug = async (
    slug: string,
    options?: MediaStorageViewOptions,
  ) => {
    const { data } = await http.get(
      `/media-storage/view/slug/${slug}${buildViewQueryString(options)}`,
      {
        responseType: "blob",
      },
    );
    return URL.createObjectURL(data);
  };

  const getMediaById = async (
    id: number,
    options?: MediaStorageViewOptions,
  ) => {
    const { data } = await http.get(
      `/media-storage/view/id/${id}${buildViewQueryString(options)}`,
      {
        responseType: "blob",
      },
    );
    return URL.createObjectURL(data);
  };

  return {
    getMediaBySlug,
    getMediaById,
  };
}

export type MediaStorageResource = ReturnType<
  typeof createMediaStorageResource
>;
