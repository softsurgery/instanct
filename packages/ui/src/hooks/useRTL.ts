import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function getDocDir(): "ltr" | "rtl" | undefined {
  if (typeof document === "undefined") return undefined;
  const d = document.documentElement.dir;
  return d === "rtl" || d === "ltr" ? d : undefined;
}

export function useRTL(explicitDir?: "ltr" | "rtl") {
  const { i18n } = useTranslation();
  const [domDir, setDomDir] = useState<"ltr" | "rtl" | undefined>(getDocDir);

  useEffect(() => {
    if (typeof document === "undefined") return;

    setDomDir(getDocDir());

    const observer = new MutationObserver(() => {
      setDomDir(getDocDir());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });

    return () => observer.disconnect();
  }, []);

  const i18nDir = i18n?.language
    ? (i18n.dir?.(i18n.language) as "ltr" | "rtl" | undefined)
    : undefined;

  const dir: "ltr" | "rtl" =
    explicitDir ??
    domDir ??
    i18nDir ??
    (i18n?.dir ? (i18n.dir() as "ltr" | "rtl") : undefined) ??
    "ltr";

  const isRTL = dir === "rtl";

  return { dir, isRTL };
}

