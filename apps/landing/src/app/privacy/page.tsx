import type { Metadata } from "next";
import { LegalHtmlPage, LegalUnavailable } from "@/components/legal-html-page";
import { findBySlug } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default async function PrivacyPolicyPage() {
  const page = await findBySlug("privacy");

  if (!page) {
    return (
      <LegalUnavailable
        title="Privacy Policy"
        subtitle="The privacy policy is temporarily unavailable. Please try again later."
      />
    );
  }

  return <LegalHtmlPage page={page} />;
}
