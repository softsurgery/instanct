"use client";

import {
  Bookmark,
  Briefcase,
  CalendarClock,
  MapPin,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@instanct/ui/components/card";
import { featureItems } from "@/lib/site";

const icons = {
  map: MapPin,
  profile: UserRound,
  chat: MessageCircle,
  session: CalendarClock,
  request: Briefcase,
  bookmark: Bookmark,
};

export function Features() {
  const { t } = useTranslation("landing");

  return (
    <section id="features" className="scroll-mt-24 border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">
            {t("features.eyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t("features.title")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("features.subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureItems.map((feature) => {
            const Icon = icons[feature.icon];
            const title = t(`features.items.${feature.key}.title`);
            return (
              <Card key={feature.key} className="gap-4 py-5">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>
                    {t(`features.items.${feature.key}.description`)}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
