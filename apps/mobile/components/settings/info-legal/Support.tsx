import { ContentScreen } from "@/components/settings/info-legal/ContentScreen";
import { useTranslation } from "react-i18next";

export const Support = () => {
  const { t } = useTranslation("settings");
  return (
    <ContentScreen
      slug="support"
      fallbackTitle={t("settings.support.screens.support.title")}
    />
  );
};
