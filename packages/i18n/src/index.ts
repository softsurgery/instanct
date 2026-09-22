import landingEn from "./locales/en/landing.json";
import landingFr from "./locales/fr/landing.json";

export const supportedLngs = ["en", "fr"] as const;
export type SupportedLng = (typeof supportedLngs)[number];

export const resolveSupportedLng = (lng: string): SupportedLng =>
  supportedLngs.includes(lng as SupportedLng) ? (lng as SupportedLng) : "en";

export const i18nConfig = {
  supportedLngs,
  fallbackLng: "en" as SupportedLng,
};

export const resources = {
  en: {
    landing: landingEn,
  },
  fr: {
    landing: landingFr,
  },
};
