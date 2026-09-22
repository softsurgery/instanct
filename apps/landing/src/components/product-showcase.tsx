"use client";

import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@instanct/ui/components/badge";
import { showcaseCardKeys, showcaseHighlightKeys } from "@/lib/site";

export function ProductShowcase() {
  const { t } = useTranslation("landing");

  return (
    <section className="border-t">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-sm font-medium text-primary">
            {t("showcase.eyebrow")}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t("showcase.title")}
          </h2>
          <p className="text-muted-foreground">{t("showcase.body")}</p>
          <ul className="space-y-3">
            {showcaseHighlightKeys.map((key) => (
              <li key={key} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="size-3.5" />
                </span>
                {t(`showcase.highlights.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {showcaseCardKeys.map((key) => (
            <ShowcaseCard
              key={key}
              title={t(`showcase.cards.${key}.title`)}
              body={t(`showcase.cards.${key}.body`)}
              badge={t(`showcase.cards.${key}.badge`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({
  title,
  body,
  badge,
}: {
  title: string;
  body: string;
  badge: string;
}) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <Badge variant="secondary">{badge}</Badge>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </article>
  );
}
