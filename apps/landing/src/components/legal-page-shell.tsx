"use client";

import { useTranslation } from "react-i18next";
import { LegalHtmlPage, LegalUnavailable } from "@/components/legal-html-page";
import type { ContentPage } from "@/lib/content";

type LegalPageShellProps = {
  page: ContentPage | null;
  kind: "privacy" | "terms";
};

export function LegalPageShell({ page, kind }: LegalPageShellProps) {
  const { t } = useTranslation("landing");

  if (!page) {
    return (
      <LegalUnavailable
        title={t(`legal.${kind}.unavailableTitle`)}
        subtitle={t(`legal.${kind}.unavailableSubtitle`)}
      />
    );
  }

  return <LegalHtmlPage page={page} />;
}
