"use client";

import React from "react";
import { useTranslation } from "react-i18next";

export function DocumentMetaSync() {
  const { t, i18n } = useTranslation("landing");

  React.useEffect(() => {
    const apply = () => {
      document.title = t("meta.title");
      const description = document.querySelector('meta[name="description"]');
      if (description) {
        description.setAttribute("content", t("meta.description"));
      }
    };

    const handleLanguageChange = () => {
      apply();
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    apply();
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n, t]);

  return null;
}
