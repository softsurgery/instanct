import { Briefcase } from "lucide-react";
import { useSheet } from "@/components/shared/Sheets";
import { ExperienceCreateForm } from "../forms/ExperienceCreateFrom";
import { useTranslation } from "react-i18next";
import { CreateExperienceDto } from "@/types";

interface ExperienceCreateSheet {
  addExperience?: (experience: CreateExperienceDto) => void;
  isAddPending?: boolean;
  resetExperience?: () => void;
  userId: string;
}

export const useExperienceCreateSheet = ({
  addExperience,
  isAddPending,
  resetExperience,
}: ExperienceCreateSheet) => {
  const { t } = useTranslation("experience");
  const {
    SheetFragment: experienceCreateSheet,
    openSheet: openExperienceCreateSheet,
    closeSheet: closeExperienceCreateSheet,
  } = useSheet({
    title: (
      <div className="flex items-center gap-2">
        <Briefcase />
        {t("experience.sheet.createTitle")}
      </div>
    ),
    description: t("experience.sheet.createDescription"),
    children: (
      <ExperienceCreateForm
        className="mx-4"
        addExperience={addExperience}
        isAddPending={isAddPending}
      />
    ),
    className: "min-w-[50vw] flex flex-col flex-1 overflow-hidden",
    onToggle: () => {
      resetExperience?.();
    },
  });

  return {
    experienceCreateSheet,
    openExperienceCreateSheet,
    closeExperienceCreateSheet,
  };
};
