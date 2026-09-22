"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function DocumentMetaSync() {
  const { t, i18n } = useTranslation("landing");

  useEffect(() => {
    const apply = () => {
      document.title = t("meta.title");
      const description = document.querySelector('meta[name="description"]');
      if (description) {
        description.setAttribute("content", t("meta.description"));
      }
    };

    apply();
    i18n.on("languageChanged", apply);
    return () => {
      i18n.off("languageChanged", apply);
    };
  }, [i18n, t]);

  return null;
}
