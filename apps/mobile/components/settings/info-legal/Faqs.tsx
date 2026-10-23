import { ContentScreen } from "@/components/settings/info-legal/ContentScreen";
import { useTranslation } from "react-i18next";

export const Faqs = () => {
  const { t } = useTranslation("settings");
  return (
    <ContentScreen
      slug="faqs"
      fallbackTitle={t("settings.support.screens.faqs.title")}
    />
  );
};
