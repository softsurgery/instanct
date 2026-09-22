
import { useDialog } from "@instanct/components";
import { Spinner } from "@instanct/components";
import { Button } from "@instanct/ui";
import { useTranslation } from "react-i18next";

interface UserApproveDialogProps {
  representation?: string;
  approveUser?: () => void;
  isApprovalPending?: boolean;
  resetUser?: () => void;
}

export const useApproveUserDialog = ({
  representation,
  approveUser,
  isApprovalPending,
  resetUser,
}: UserApproveDialogProps) => {
  const { t } = useTranslation("user-management");
  const { t: tCommon } = useTranslation("common");
  const {
    DialogFragment: approveUserDialog,
    openDialog: openApproveUserDialog,
    closeDialog: closeApproveUserDialog,
  } = useDialog({
    title: (
      <div className="leading-normal">
        {t("userManagement.dialogs.approveUserTitle")} <span className="font-light">{representation}</span> ?
      </div>
    ),
    description:
      t("userManagement.dialogs.approveUserDescription"),
    children: (
      <div>
        <div className="flex gap-2 justify-end">
          <Button
            onClick={() => {
              approveUser?.();
              closeApproveUserDialog();
            }}
          >
            {tCommon("common.buttons.approve")}
            <Spinner show={isApprovalPending} />
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => {
              closeApproveUserDialog();
            }}
          >
            {tCommon("common.buttons.cancel")}
          </Button>
        </div>
      </div>
    ),
    className: "w-[500px]",
    onToggle: resetUser,
  });

  return {
    approveUserDialog,
    openApproveUserDialog,
    closeApproveUserDialog,
  };
};