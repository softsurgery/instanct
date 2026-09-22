import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { findBySlug } from "@/lib/content";
import { headers } from "next/headers";
import { resolveSupportedLng } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default async function PrivacyPolicyPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const locale = resolveSupportedLng(acceptLanguage ?? undefined);

  const page = await findBySlug("privacy", locale);
  return <LegalPageShell page={page} kind="privacy" />;
}
