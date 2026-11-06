import landingEn from "./locales/en/landing.json";
import landingFr from "./locales/fr/landing.json";
import templateEn from "./locales/en/template.json";
import templateFr from "./locales/fr/template.json";

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
    template: templateEn,
    templates: templateEn,
  },
  fr: {
    landing: landingFr,
    template: templateFr,
    templates: templateFr,
  },
};

export { landingEn, landingFr, templateEn, templateFr };
