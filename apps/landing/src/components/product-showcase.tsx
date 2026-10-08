"use client";

import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { showcaseHighlightKeys } from "@/lib/site";

export function ProductShowcase() {
  const { t } = useTranslation("landing");

  return (
    <section className="border-t text-center">
      <div className="mx-auto  max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 ">
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-5">
          <p className="text-sm font-medium text-primary">
            {t("showcase.eyebrow")}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t("showcase.title")}
          </h2>
          <p className="text-muted-foreground">{t("showcase.body")}</p>
          <ul className="space-y-3 pt-4 flex flex-col items-start text-left">
            {showcaseHighlightKeys.map((key) => (
              <li key={key} className="flex items-center gap-3 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="size-3.5" />
                </span>
                <span>{t(`showcase.highlights.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
