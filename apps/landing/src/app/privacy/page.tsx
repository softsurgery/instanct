import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { privacySections } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="We collect only what we need to deliver a safe, personalized Instanct experience."
      updatedLabel="Updated Feb 5, 2026"
      sections={privacySections}
    />
  );
}
