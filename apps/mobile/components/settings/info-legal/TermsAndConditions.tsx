import { ContentScreen } from "@/components/settings/info-legal/ContentScreen";
import { useTranslation } from "react-i18next";

export const TermsAndConditions = () => {
  const { t } = useTranslation("settings");
  return (
    <ContentScreen
      slug="terms"
      fallbackTitle={t("settings.infoLegal.termsAndConditions")}
    />
  );
};
