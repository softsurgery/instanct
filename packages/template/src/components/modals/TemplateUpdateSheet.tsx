import React from "react";
import { useSheet } from "@instanct/components";
import { useTranslation } from "react-i18next";
import { FileEdit } from "lucide-react";
import { TemplateUpdateForm } from "../forms/TemplateUpdateForm";

export interface TemplateUpdateSheetProps {
  updateTemplate?: () => void;
  isUpdatePending?: boolean;
  resetTemplate?: () => void;
}

export const useTemplateUpdateSheet = ({
  updateTemplate,
  isUpdatePending,
  resetTemplate,
}: TemplateUpdateSheetProps) => {
  const { t } = useTranslation("content-management");

  const {
    SheetFragment: updateTemplateSheet,
    openSheet: openUpdateTemplateSheet,
    closeSheet: closeUpdateTemplateSheet,
  } = useSheet({
    title: (
      <div className="flex items-center gap-2">
        <FileEdit className="h-5 w-5" />
        {t("templates.sheet.update.title", "Update Template")}
      </div>
    ),
    description: t(
      "templates.sheet.update.description",
      "Use this form to update the template content or name.",
    ),
    children: (
      <TemplateUpdateForm
        className="mx-4"
        templateCallback={updateTemplate}
        cancelCallback={() => {
          closeUpdateTemplateSheet?.();
          resetTemplate?.();
        }}
        isPending={isUpdatePending}
      />
    ),
    className: "min-w-[40vw] flex flex-col flex-1 overflow-hidden",
    onToggle: resetTemplate,
  });

  return {
    updateTemplateSheet,
    openUpdateTemplateSheet,
    closeUpdateTemplateSheet,
  };
};
