import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { resources } from "@instanct/i18n";
import { i18nConfig, resolveSupportedLng } from "./config";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ...i18nConfig,
    resources,
  });

function syncDocumentLanguage(lng: string) {
  const resolved = resolveSupportedLng(lng);
  document.documentElement.lang = resolved;
  document.documentElement.dir = "ltr";
}

i18n.on("languageChanged", syncDocumentLanguage);

if (typeof document !== "undefined") {
  syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);
}

export default i18n;
