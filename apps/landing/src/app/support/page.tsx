import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { api } from "@/lib/api";
import { headers } from "next/headers";
import { resolveSupportedLng } from "@/i18n/config";
import { fallbackSupportPages } from "@/lib/support-content";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Instanct Support & Help Center. Get assistance with your account, sessions, subscriptions, and contact our support team.",
};

export default async function SupportPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const locale = resolveSupportedLng(acceptLanguage ?? undefined);

  const page =
    (await api.contentPage.findBySlug("support", locale).catch(() => null)) ??
    fallbackSupportPages[locale] ??
    fallbackSupportPages.en;

  return <LegalPageShell page={page} kind="support" />;
}
