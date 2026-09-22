import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { findBySlug } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default async function TermsPage() {
  const page = await findBySlug("terms");
  return <LegalPageShell page={page} kind="terms" />;
}
