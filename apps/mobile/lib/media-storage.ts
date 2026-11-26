import { useAuthPersistStore } from "@softsurgery/hooks/stores";
import {
  buildViewQueryString,
  type MediaStorageViewOptions,
} from "api-client";

export function createMobileMediaStorage(baseURL: string) {
  const authorizedSource = (path: string) => {
    const authStore = useAuthPersistStore.getState();
    return {
      uri: `${baseURL}${path}`,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    };
  };

  const getMediaById = (id: number, options?: MediaStorageViewOptions) =>
    authorizedSource(
      `/media-storage/view/id/${id}${buildViewQueryString(options)}`,
    );

  const getMediaBySlug = (slug: string, options?: MediaStorageViewOptions) =>
    authorizedSource(
      `/media-storage/view/slug/${slug}${buildViewQueryString(options)}`,
    );

  return {
    getMediaBySlug,
    getMediaById,
  };
}
