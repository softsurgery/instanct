"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";

export function ProductPreview() {
  const { t } = useTranslation("landing");

  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <div className="absolute top-[18%] -left-[4px] h-5 w-[4px] rounded-l-sm bg-neutral-700" />
      <div className="absolute top-[26%] -left-[4px] h-10 w-[4px] rounded-l-sm bg-neutral-700" />
      <div className="absolute top-[36%] -left-[4px] h-10 w-[4px] rounded-l-sm bg-neutral-700" />
      <div className="absolute top-[30%] -right-[4px] h-16 w-[4px] rounded-r-sm bg-neutral-700" />

      <div className="relative rounded-[2.7rem] bg-gradient-to-b from-neutral-700 via-neutral-950 to-black p-[11px] shadow-[0_28px_60px_-18px_rgba(0,0,0,0.55)] ring-1 ring-black/30">
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.15rem] bg-black">
          <div className="absolute top-[10px] left-1/2 z-20 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]" />
          <Image
            src="/sc-light.jpg"
            alt={t("hero.previewLightAlt")}
            fill
            className="object-cover dark:hidden"
            sizes="260px"
            priority
          />
          <Image
            src="/sc-dark.jpg"
            alt={t("hero.previewDarkAlt")}
            fill
            className="hidden object-cover dark:block"
            sizes="260px"
            priority
          />
        </div>
      </div>
    </div>
  );
}
