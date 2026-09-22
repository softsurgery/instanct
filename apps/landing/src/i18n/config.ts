import {
  i18nConfig as sharedConfig,
  resolveSupportedLng as resolveSharedLng,
  supportedLngs,
  type SupportedLng,
} from "@instanct/i18n";

export { supportedLngs, type SupportedLng };

export const i18nConfig = {
  ...sharedConfig,
  defaultNS: "landing",
  ns: ["landing"],
  interpolation: { escapeValue: false },
  detection: {
    order: ["localStorage", "navigator"] as string[],
    caches: ["localStorage"] as string[],
  },
};

export function resolveSupportedLng(lng?: string): SupportedLng {
  if (!lng) return sharedConfig.fallbackLng;
  const primary = lng
    .split(",")[0]
    .split(";")[0]
    .split("-")[0]
    .trim()
    .toLowerCase();
  return resolveSharedLng(primary);
}
