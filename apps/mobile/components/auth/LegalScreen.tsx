import { LegalContentScreen } from "@/components/settings/info-legal/ContentScreen";

export type LegalDocument = "terms" | "privacy";

interface LegalScreenProps {
  className?: string;
  document: LegalDocument;
}

export const LegalScreen = ({ className, document }: LegalScreenProps) => {
  return (
    <LegalContentScreen
      className={className}
      slug={document}
      fallbackTitle={
        document === "privacy" ? "Privacy Policy" : "Terms & Conditions"
      }
    />
  );
};
