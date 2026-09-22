"use client";

import { useTranslation } from "react-i18next";

export function SkipToContent() {
  const { t } = useTranslation("landing");

  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
    >
      {t("a11y.skipToContent")}
    </a>
  );
}
