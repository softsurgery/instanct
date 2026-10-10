import { ContentScreen } from "@/components/settings/info-legal/ContentScreen";
import { useTranslation } from "react-i18next";

export const PrivacyPolicy = () => {
  const { t } = useTranslation("settings");
  return (
    <ContentScreen
      slug="privacy"
      fallbackTitle={t("settings.infoLegal.privacyPolicy")}
    />
  );
};
