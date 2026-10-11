import React from "react";
import { useSheet } from "@instanct/components";
import { useTranslation } from "react-i18next";
import { FileCode2 } from "lucide-react";
import { TemplateCreateForm } from "../forms/TemplateCreateForm";

export interface TemplateCreateSheetProps {
  createTemplate?: () => void;
  isCreatePending?: boolean;
  resetTemplate?: () => void;
}

export const useTemplateCreateSheet = ({
  createTemplate,
  isCreatePending,
  resetTemplate,
}: TemplateCreateSheetProps) => {
  const { t } = useTranslation("content-management");

  const {
    SheetFragment: createTemplateSheet,
    openSheet: openCreateTemplateSheet,
    closeSheet: closeCreateTemplateSheet,
  } = useSheet({
    title: (
      <div className="flex items-center gap-2">
        <FileCode2 className="h-5 w-5" />
        {t("templates.sheet.create.title", "Create Template")}
      </div>
    ),
    description: t(
      "templates.sheet.create.description",
      "Use this form to define a new email or document template.",
    ),
    children: (
      <TemplateCreateForm
        className="mx-4"
        templateCallback={createTemplate}
        cancelCallback={() => {
          closeCreateTemplateSheet?.();
          resetTemplate?.();
        }}
        isPending={isCreatePending}
      />
    ),
    className: "min-w-[40vw] flex flex-col flex-1 overflow-hidden",
    onToggle: resetTemplate,
  });

  return {
    createTemplateSheet,
    openCreateTemplateSheet,
    closeCreateTemplateSheet,
  };
};
