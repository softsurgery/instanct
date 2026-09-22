import { LegalContentScreen } from "@/components/legal/LegalContentScreen";

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
