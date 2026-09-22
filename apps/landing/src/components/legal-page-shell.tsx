"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { LegalHtmlPage, LegalUnavailable } from "@/components/legal-html-page";
import { findBySlug, type ContentPage } from "@/lib/content";
import { resolveSupportedLng } from "@/i18n/config";

type LegalPageShellProps = {
  page: ContentPage | null;
  kind: "privacy" | "terms";
};

export function LegalPageShell({ page: initialPage, kind }: LegalPageShellProps) {
  const { t, i18n } = useTranslation("landing");

  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const currentLocale = resolveSupportedLng(activeLanguage);

  const { data: page = null } = useQuery({
    queryKey: ["content-page", kind, currentLocale],
    queryFn: () => findBySlug(kind, currentLocale),
    initialData: initialPage?.locale === currentLocale ? initialPage : undefined,
    staleTime: 1000 * 60 * 5,
  });

  const currentPage = page ?? (initialPage?.locale === currentLocale ? initialPage : null);

  if (!currentPage) {
    return (
      <LegalUnavailable
        title={t(`legal.${kind}.unavailableTitle`)}
        subtitle={t(`legal.${kind}.unavailableSubtitle`)}
      />
    );
  }

  return <LegalHtmlPage page={currentPage} />;
}
