"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { cn } from "@instanct/lib";
import { site } from "@/lib/site";

type StoreBadgesProps = {
  className?: string;
  badgeClassName?: string;
};

export function StoreBadges({ className, badgeClassName }: StoreBadgesProps) {
  const { t } = useTranslation("landing");
  const appleHref = site.urls.appStore || "/#get-started";
  const googleHref = site.urls.playStore || "/#get-started";

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <a
        href={appleHref}
        aria-label={t("store.appStoreAria")}
        className="transition-opacity hover:opacity-90"
      >
        <Image
          src="/get-apple.png"
          alt={t("store.appStoreAlt")}
          width={1912}
          height={651}
          className={cn("h-11 w-auto", badgeClassName)}
        />
      </a>
      <a
        href={googleHref}
        aria-label={t("store.playStoreAria")}
        className="transition-opacity hover:opacity-90"
      >
        <Image
          src="/get-google.png"
          alt={t("store.playStoreAlt")}
          width={1918}
          height={651}
          className={cn("h-11 w-auto", badgeClassName)}
        />
      </a>
    </div>
  );
}
