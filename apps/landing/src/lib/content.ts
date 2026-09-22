import type { ResponseContentPageDto } from "@instanct/api-client";
import { api } from "./api";

export type ContentPage = ResponseContentPageDto;

export async function findBySlug(
  slug: string,
  locale?: string,
): Promise<ContentPage | null> {
  try {
    return await api.contentPage.findBySlug(slug, locale);
  } catch (error) {
    console.error(
      `[ContentPage] Failed to fetch content page "${slug}" (${locale}):`,
      error,
    );
    return null;
  }
}
