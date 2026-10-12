import React from "react";
import { useDialog, Spinner } from "@instanct/components";
import { Button } from "@instanct/ui";
import { useTranslation } from "react-i18next";

interface ConfigurationDeleteDialogProps {
  representation?: string;
  deleteConfiguration?: () => void;
  isDeletionPending?: boolean;
  resetConfiguration?: () => void;
}

export const useConfigurationDeleteDialog = ({
  representation,
  deleteConfiguration,
  isDeletionPending,
  resetConfiguration,
}: ConfigurationDeleteDialogProps) => {
  const { t } = useTranslation("content-management");

  const {
    DialogFragment: deleteConfigurationDialog,
    openDialog: openDeleteConfigurationDialog,
    closeDialog: closeDeleteConfigurationDialog,
  } = useDialog({
    title: (
      <div className="leading-normal">
        {t("configuration.dialogs.delete.title", "Delete Configuration")}{" "}
        <span className="font-light">{representation}</span>?
      </div>
    ),
    description: t(
      "configuration.dialogs.delete.description",
      "Are you sure you want to delete this configuration namespace and its parameters? This action cannot be undone.",
    ),
    children: (
      <div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="destructive"
            onClick={() => {
              deleteConfiguration?.();
              closeDeleteConfigurationDialog();
            }}
            disabled={isDeletionPending}
          >
            {t("configuration.dialogs.delete.confirm", "Delete")}
            <Spinner show={isDeletionPending} />
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              resetConfiguration?.();
              closeDeleteConfigurationDialog();
            }}
            disabled={isDeletionPending}
          >
            {t("configuration.dialogs.delete.cancel", "Cancel")}
          </Button>
        </div>
      </div>
    ),
    className: "w-[500px]",
    onToggle: resetConfiguration,
  });

  return {
    deleteConfigurationDialog,
    openDeleteConfigurationDialog,
    closeDeleteConfigurationDialog,
  };
};
