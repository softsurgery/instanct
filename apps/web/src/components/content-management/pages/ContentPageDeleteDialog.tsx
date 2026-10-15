import React from "react";
import { useDialog, Spinner } from "@softsurgery/components";
import { Button } from "@softsurgery/ui";
import { useTranslation } from "react-i18next";

interface ContentPageDeleteDialogProps {
  representation?: string;
  deleteContentPage?: () => void;
  isDeletionPending?: boolean;
  resetContentPage?: () => void;
}

export const useContentPageDeleteDialog = ({
  representation,
  deleteContentPage,
  isDeletionPending,
  resetContentPage,
}: ContentPageDeleteDialogProps) => {
  const { t } = useTranslation("content-management");

  const {
    DialogFragment: deleteContentPageDialog,
    openDialog: openDeleteContentPageDialog,
    closeDialog: closeDeleteContentPageDialog,
  } = useDialog({
    title: (
      <div className="leading-normal">
        {t("pages.dialogs.delete.title", "Delete Content Page")}{" "}
        <span className="font-light">{representation}</span>?
      </div>
    ),
    description: t(
      "pages.dialogs.delete.description",
      "Are you sure you want to delete this content page? This action cannot be undone.",
    ),
    children: (
      <div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="destructive"
            onClick={() => {
              deleteContentPage?.();
              closeDeleteContentPageDialog();
            }}
            disabled={isDeletionPending}
          >
            {t("pages.dialogs.delete.confirm", "Delete")}
            <Spinner show={isDeletionPending} />
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              resetContentPage?.();
              closeDeleteContentPageDialog();
            }}
            disabled={isDeletionPending}
          >
            {t("pages.dialogs.delete.cancel", "Cancel")}
          </Button>
        </div>
      </div>
    ),
    className: "w-[500px]",
    onToggle: resetContentPage,
  });

  return {
    deleteContentPageDialog,
    openDeleteContentPageDialog,
    closeDeleteContentPageDialog,
  };
};
