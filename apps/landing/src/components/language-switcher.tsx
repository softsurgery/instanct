"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@instanct/lib";
import { resolveSupportedLng, supportedLngs } from "@/i18n/config";

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation("landing");
  const currentLanguage = resolveSupportedLng(
    i18n.resolvedLanguage ?? i18n.language,
  );

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-semibold tracking-wide",
        className,
      )}
      role="group"
      aria-label={t("language.select")}
    >
      {supportedLngs.map((lng, index) => (
        <span key={lng} className="flex items-center gap-1.5">
          {index > 0 ? (
            <span className="text-muted-foreground/50" aria-hidden="true">
              /
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void i18n.changeLanguage(lng)}
            className={cn(
              "rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              currentLanguage === lng
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={currentLanguage === lng}
            aria-label={lng === "en" ? "English" : "Français"}
            lang={lng}
          >
            {t(`language.${lng}`)}
          </button>
        </span>
      ))}
    </div>
  );
}
