"use client";

import { useTranslation } from "react-i18next";
import { StoreBadges } from "@/components/store-badges";
import { site } from "@/lib/site";

export function CtaBanner() {
  const { t } = useTranslation("landing");

  return (
    <section id="get-started" className="scroll-mt-24 border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-2xl border bg-accent px-6 py-12 text-center shadow-sm sm:px-12">
          <p className="text-sm font-medium text-accent-foreground">
            {t("cta.eyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t("cta.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            {t("cta.body")}
          </p>
          <StoreBadges className="mt-6 justify-center" />
          <a
            href={`mailto:${site.urls.contact}`}
            className="mt-4 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {t("cta.talkWithUs")}
          </a>
        </div>
      </div>
    </section>
  );
}
