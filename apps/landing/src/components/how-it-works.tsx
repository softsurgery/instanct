"use client";

import { useTranslation } from "react-i18next";
import { stepKeys } from "@/lib/site";

export function HowItWorks() {
  const { t } = useTranslation("landing");

  return (
    <section id="how-it-works" className="scroll-mt-24 border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">
            {t("howItWorks.eyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("howItWorks.title")}
          </h2>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {stepKeys.map((step) => (
            <li
              key={step}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <span className="font-mono text-sm text-primary">{step}</span>
              <h3 className="mt-3 text-lg font-semibold">
                {t(`howItWorks.steps.${step}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`howItWorks.steps.${step}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
