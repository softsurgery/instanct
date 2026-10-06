"use client";

import { prepareLegalHtml } from "@instanct/lib";
import "@instanct/lib/legal-html.css";
import { useTranslation } from "react-i18next";
import { resolveSupportedLng } from "@/i18n/config";
import { ResponseContentPageDto } from "@instanct/api-client";

type LegalHtmlPageProps = {
  page: ResponseContentPageDto;
};

function formatUpdatedAt(value: string | Date | undefined, locale: string) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  return date.toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function LegalHtmlPage({ page }: LegalHtmlPageProps) {
  const { t, i18n } = useTranslation("landing");
  const activeLang = page.locale || i18n.resolvedLanguage || i18n.language;
  const locale = resolveSupportedLng(activeLang);
  const formattedDate = formatUpdatedAt(page.updatedAt, locale);
  const updated =
    formattedDate != null
      ? t("legal.updatedAt", { date: formattedDate })
      : null;
  const showNotice =
    page.hasNotApplied || (page.unresolvedKeys?.length ?? 0) > 0;
  const htmlContent = prepareLegalHtml(page.body || "");

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {updated ? (
        <p className="text-sm text-muted-foreground">{updated}</p>
      ) : null}
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        {page.title}
      </h1>
      {page.subtitle ? (
        <p className="mt-4 text-lg text-muted-foreground">{page.subtitle}</p>
      ) : null}

      {showNotice ? (
        <aside className="mt-8 rounded-lg border border-accent-foreground/20 bg-accent p-2 text-sm text-accent-foreground">
          {t("legal.notice")}
        </aside>
      ) : null}

      <div
        className="legal-html mt-10"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
}

export function LegalUnavailable({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
    </article>
  );
}
