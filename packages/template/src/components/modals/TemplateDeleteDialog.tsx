import React from "react";
import { useDialog, Spinner } from "@softsurgery/components";
import { Button } from "@softsurgery/ui";
import { useTranslation } from "react-i18next";

export interface TemplateDeleteDialogProps {
  representation?: string;
  deleteTemplate?: () => void;
  isDeletionPending?: boolean;
  resetTemplate?: () => void;
}

export const useTemplateDeleteDialog = ({
  representation,
  deleteTemplate,
  isDeletionPending,
  resetTemplate,
}: TemplateDeleteDialogProps) => {
  const { t } = useTranslation("content-management");

  const {
    DialogFragment: deleteTemplateDialog,
    openDialog: openDeleteTemplateDialog,
    closeDialog: closeDeleteTemplateDialog,
  } = useDialog({
    title: (
      <div className="leading-normal">
        {t("templates.dialogs.delete.title", "Delete Template")}{" "}
        <span className="font-light">{representation}</span> ?
      </div>
    ),
    description: t(
      "templates.dialogs.delete.description",
      "This action cannot be undone. This template will be permanently removed.",
    ),
    children: (
      <div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="destructive"
            onClick={() => {
              deleteTemplate?.();
              closeDeleteTemplateDialog();
            }}
          >
            {t("templates.dialogs.delete.confirm", "Delete")}
            <Spinner show={isDeletionPending} />
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => {
              resetTemplate?.();
              closeDeleteTemplateDialog();
            }}
          >
            {t("templates.dialogs.delete.cancel", "Cancel")}
          </Button>
        </div>
      </div>
    ),
    className: "w-[500px]",
    onToggle: resetTemplate,
  });

  return {
    deleteTemplateDialog,
    openDeleteTemplateDialog,
    closeDeleteTemplateDialog,
  };
};
