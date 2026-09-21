import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { termsSections } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle="These terms help keep Instanct safe, respectful, and enjoyable for everyone."
      updatedLabel="Updated Feb 5, 2026"
      sections={termsSections}
    />
  );
}
