"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { ThemeSwitcher } from "@instanct/components/ThemeSwitcher";
import { Button } from "@instanct/ui/components/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { navLinks, site } from "@/lib/site";
import React from "react";

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation("landing");

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
          aria-label={t("a11y.homeAria")}
        >
          <Image
            src="/logo.png"
            alt={t("a11y.logoAlt")}
            width={32}
            height={32}
            className="size-8"
            priority
          />
          <span className="text-base font-semibold tracking-tight">
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className="text-foreground"
              asChild
            >
              <Link href={item.href}>{t(item.labelKey)}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <ThemeSwitcher
            value={theme as "light" | "dark" | "system"}
            onChange={setTheme}
          />
          <LanguageSwitcher className="hidden sm:flex" />

          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t bg-background px-4 py-3 md:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3">
            <LanguageSwitcher />
            <div className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="justify-start"
                  asChild
                >
                  <Link href={item.href} onClick={() => setOpen(false)}>
                    {t(item.labelKey)}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
