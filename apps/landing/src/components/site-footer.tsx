"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { navLinks, site } from "@/lib/site";

const footerProductLinks = navLinks.filter(
  (item) => item.href !== "/#faq",
);

export function SiteFooter() {
  const { t } = useTranslation("landing");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt={t("a11y.logoAlt")}
              width={28}
              height={28}
              className="size-7"
            />
            <span className="font-semibold">{site.name}</span>
          </Link>
          <p className="text-sm text-muted-foreground">{t("hero.tagline")}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="space-y-3">
            <p className="font-medium">{t("footer.product")}</p>
            <ul className="space-y-2 text-muted-foreground">
              {footerProductLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-foreground">
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-medium">{t("footer.legal")}</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  {t("footer.termsOfService")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-medium">{t("footer.contact")}</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href={`mailto:${site.urls.contact}`}
                  className="hover:text-foreground"
                >
                  {site.urls.contact}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          {t("footer.copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
