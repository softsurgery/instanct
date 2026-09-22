import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { findBySlug } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default async function PrivacyPolicyPage() {
  const page = await findBySlug("privacy");
  return <LegalPageShell page={page} kind="privacy" />;
}
