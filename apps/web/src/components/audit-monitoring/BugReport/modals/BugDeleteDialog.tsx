import React from "react";
import { useDialog, Spinner } from "@softsurgery/components";
import { Button } from "@softsurgery/ui";
import { useTranslation } from "react-i18next";

interface BugDeleteDialogProps {
  representation?: string;
  deleteBug?: () => void;
  isDeletionPending?: boolean;
  resetBug?: () => void;
}

export const useBugDeleteDialog = ({
  representation,
  deleteBug,
  isDeletionPending,
  resetBug,
}: BugDeleteDialogProps) => {
  const { t } = useTranslation("common");

  const {
    DialogFragment: deleteBugDialog,
    openDialog: openDeleteBugDialog,
    closeDialog: closeDeleteBugDialog,
  } = useDialog({
    title: (
      <div className="leading-normal">
        {t("bugReport.dialogs.delete.title", "Delete Bug Report")}{" "}
        <span className="font-light">{representation}</span>?
      </div>
    ),
    description: t(
      "bugReport.dialogs.delete.description",
      "Are you sure you want to delete this bug report? This action cannot be undone.",
    ),
    children: (
      <div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="destructive"
            onClick={() => {
              deleteBug?.();
              closeDeleteBugDialog();
            }}
            disabled={isDeletionPending}
          >
            {t("bugReport.dialogs.delete.confirm", "Delete")}
            <Spinner show={isDeletionPending} />
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              resetBug?.();
              closeDeleteBugDialog();
            }}
            disabled={isDeletionPending}
          >
            {t("bugReport.dialogs.delete.cancel", "Cancel")}
          </Button>
        </div>
      </div>
    ),
    className: "w-[500px]",
    onToggle: resetBug,
  });

  return {
    deleteBugDialog,
    openDeleteBugDialog,
    closeDeleteBugDialog,
  };
};
