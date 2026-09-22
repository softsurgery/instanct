import { UpdateContentPageDto } from "@/types";

export const CONTENT_PAGE_EXPORT_VERSION = 1;

export type ContentPageExportPayload = {
  slug: string;
  title: string;
  subtitle: string;
  body: string;
  locale?: string;
};

export type ContentPageExportFile = {
  version: number;
  exportedAt: string;
  page: ContentPageExportPayload;
};

export function buildContentPageExport(
  slug: string,
  updateDto: UpdateContentPageDto,
): ContentPageExportFile {
  return {
    version: CONTENT_PAGE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    page: {
      slug,
      title: updateDto.title ?? "",
      subtitle: updateDto.subtitle ?? "",
      body: updateDto.body ?? "",
      locale: updateDto.locale,
    },
  };
}

export function parseContentPageImportFile(
  raw: string,
): ContentPageExportPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON file");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid content page file");
  }

  const root = parsed as Record<string, unknown>;
  const page =
    root.page && typeof root.page === "object"
      ? (root.page as Record<string, unknown>)
      : root;

  if (typeof page.slug !== "string" || typeof page.body !== "string") {
    throw new Error("Invalid content page file");
  }

  return {
    slug: page.slug,
    title: typeof page.title === "string" ? page.title : "",
    subtitle: typeof page.subtitle === "string" ? page.subtitle : "",
    body: page.body,
    locale: typeof page.locale === "string" ? page.locale : undefined,
  };
}

export function downloadContentPageExport(payload: ContentPageExportFile) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = payload.exportedAt.slice(0, 10);
  anchor.href = url;
  anchor.download = `instanct-page-${payload.page.slug}-${date}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
