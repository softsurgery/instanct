import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { api } from "@/lib/api";
import { headers } from "next/headers";
import { resolveSupportedLng } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default async function PrivacyPolicyPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const locale = resolveSupportedLng(acceptLanguage ?? undefined);

  const page = await api.contentPage.findBySlug("privacy", locale).catch(() => null);
  return <LegalPageShell page={page} kind="privacy" />;
}
