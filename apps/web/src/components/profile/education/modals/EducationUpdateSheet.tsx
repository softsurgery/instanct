import { GraduationCap } from "lucide-react";
import { useSheet } from "@instanct/components";
import { EducationUpdateForm } from "../forms/EducationUpdateFrom";
import { useTranslation } from "react-i18next";

interface EducationUpdateSheet {
  updateEducation?: () => void;
  isUpdatePending?: boolean;
  resetEducation?: () => void;
}

export const useEducationUpdateSheet = ({
  updateEducation,
  isUpdatePending,
  resetEducation,
}: EducationUpdateSheet) => {
  const { t } = useTranslation("user-management");
  const {
    SheetFragment: educationUpdateSheet,
    openSheet: openEducationUpdateSheet,
    closeSheet: closeEducationUpdateSheet,
  } = useSheet({
    title: (
      <div className="flex items-center gap-2">
        <GraduationCap />
        {t("userManagement.inspect.books.education.sheet.updateTitle")}
      </div>
    ),
    description: t(
      "userManagement.inspect.books.education.sheet.updateDescription",
    ),
    children: (
      <EducationUpdateForm
        className="mx-4"
        updateEducation={updateEducation}
        isUpdatePending={isUpdatePending}
      />
    ),
    className: "min-w-[50vw] flex flex-col flex-1 overflow-hidden",
    onToggle: () => {
      resetEducation?.();
    },
  });

  return {
    educationUpdateSheet,
    openEducationUpdateSheet,
    closeEducationUpdateSheet,
  };
};
