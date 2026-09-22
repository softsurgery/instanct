"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { safetyPointKeys } from "@/lib/site";

export function Safety() {
  const { t } = useTranslation("landing");

  return (
    <section id="safety" className="scroll-mt-24 border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <ShieldCheck className="size-4" />
            {t("safety.eyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("safety.title")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("safety.subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {safetyPointKeys.map((key) => (
            <article
              key={key}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <h3 className="font-semibold">
                {t(`safety.points.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`safety.points.${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
