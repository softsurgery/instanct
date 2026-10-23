import { ContentScreen } from "@/components/settings/info-legal/ContentScreen";
import { useTranslation } from "react-i18next";

export const AboutInstanct = () => {
  const { t } = useTranslation();

  return (
    <ContentScreen slug="about" fallbackTitle={t("common.aboutInstanct")} />
  );
};
