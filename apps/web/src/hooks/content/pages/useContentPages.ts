import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useTranslation } from "react-i18next";

interface useContentPagesResponse {
  enabled: boolean;
  locale?: string;
}

export const useContentPages = ({
  enabled,
  locale,
}: useContentPagesResponse) => {
  const { i18n } = useTranslation();
  const currentLocale = locale || i18n.language;

  const {
    data: contentPagesResponse,
    isPending: isContentPagesPending,
    refetch: refetchContentPages,
  } = useQuery({
    queryKey: ["content-pages", currentLocale],
    queryFn: () =>
      api.admin.contentPage.findAll(
        currentLocale ? { locale: currentLocale } : undefined,
      ),
    enabled,
  });

  const contentPages = React.useMemo(
    () => contentPagesResponse || [],
    [contentPagesResponse],
  );

  return { contentPages, isContentPagesPending, refetchContentPages };
};
