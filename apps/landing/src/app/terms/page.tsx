import type { Metadata } from "next";
import { LegalHtmlPage, LegalUnavailable } from "@/components/legal-html-page";
import { findBySlug } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default async function TermsPage() {
  const page = await findBySlug("terms");

  if (!page) {
    return (
      <LegalUnavailable
        title="Terms & Conditions"
        subtitle="The terms of service are temporarily unavailable. Please try again later."
      />
    );
  }

  return <LegalHtmlPage page={page} />;
}
