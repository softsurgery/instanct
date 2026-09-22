import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { findBySlug } from "@/lib/content";
import { headers } from "next/headers";
import { resolveSupportedLng } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default async function TermsPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const locale = resolveSupportedLng(acceptLanguage ?? undefined);

  const page = await findBySlug("terms", locale);
  return <LegalPageShell page={page} kind="terms" />;
}
