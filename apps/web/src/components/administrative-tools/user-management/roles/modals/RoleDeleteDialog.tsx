import { useDialog } from "@instanct/components";
import { Spinner } from "@instanct/components";
import { Button } from "@instanct/ui";
import { useTranslation } from "react-i18next";

interface RoleDeleteDialogProps {
  representation?: string;
  deleteRole?: () => void;
  isDeletionPending?: boolean;
  resetRole?: () => void;
}

export const useRoleDeleteDialog = ({
  representation,
  deleteRole,
  isDeletionPending,
  resetRole,
}: RoleDeleteDialogProps) => {
  const { t } = useTranslation("role");

  const {
    DialogFragment: deleteRoleDialog,
    openDialog: openDeleteRoleDialog,
    closeDialog: closeDeleteRoleDialog,
  } = useDialog({
    title: (
      <div className="leading-normal">
        {t("dialogs.delete.title")}{" "}
        <span className="font-light">{representation}</span> ?
      </div>
    ),
    description: t("dialogs.delete.description"),
    children: (
      <div>
        <div className="flex gap-2 justify-end">
          <Button
            onClick={() => {
              deleteRole?.();
              closeDeleteRoleDialog();
            }}
          >
            {t("dialogs.delete.confirm")}
            <Spinner show={isDeletionPending} />
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => {
              resetRole?.();
              closeDeleteRoleDialog();
            }}
          >
            {t("dialogs.delete.cancel")}
          </Button>
        </div>
      </div>
    ),
    className: "w-[500px]",
    onToggle: resetRole,
  });

  return {
    deleteRoleDialog,
    openDeleteRoleDialog,
    closeDeleteRoleDialog,
  };
};
