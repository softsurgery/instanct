import * as locales from "date-fns/locale";
import type { Locale as DateFnsLocale } from "date-fns";

export type LocaleCode = string;

const LOCALE_MAP: Record<string, DateFnsLocale> = {
  en: locales.enUS,
  fr: locales.fr,
  es: locales.es,
  de: locales.de,
  it: locales.it,
  pt: locales.pt,
  ru: locales.ru,
  ja: locales.ja,
  zh: locales.zhCN,
  ar: locales.ar,
  pl: locales.pl,
  nl: locales.nl,
};

export const SUPPORTED_LOCALES = Object.keys(LOCALE_MAP);

const DEFAULT_LOCALE = "en";

function normalizeLocale(value?: string | null): string | undefined {
  const lang = value?.toLowerCase().split("-")[0];
  return lang && LOCALE_MAP[lang] ? lang : undefined;
}

function getProcessEnvLang(): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env;
  return env?.NEXT_PUBLIC_LANG ?? env?.VITE_LANG;
}

function getBrowserLang(): string | undefined {
  if (typeof document !== "undefined") {
    const htmlLang = document.documentElement.lang;
    if (htmlLang) return htmlLang;
  }
  if (typeof navigator !== "undefined") {
    return navigator.language ?? navigator.languages?.[0];
  }
  return undefined;
}

export const getLocaleFromEnv = (): string => {
  return (
    normalizeLocale(getProcessEnvLang()) ??
    normalizeLocale(getBrowserLang()) ??
    DEFAULT_LOCALE
  );
};

export const getDateFnsLocale = (
  localeCode: LocaleCode = getLocaleFromEnv(),
): DateFnsLocale => {
  return LOCALE_MAP[normalizeLocale(localeCode) ?? DEFAULT_LOCALE];
};
