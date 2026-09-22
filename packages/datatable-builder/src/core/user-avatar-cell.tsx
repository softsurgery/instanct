import React from "react";
import { IdentifiableUser, identifyUser, identifyUserAvatar } from "@instanct/lib";
import DataTableCell from "./data-table-cell";
import { DataTableCellVariant } from "../types";

export const UserAvatarCell = ({
  user,
  src,
}: {
  user?: IdentifiableUser | null;
  src?: string;
}) => {
  return (
    <DataTableCell
      variant={DataTableCellVariant.AVATAR}
      value={
        user
          ? {
              src: src || undefined,
              fallback: identifyUserAvatar(user),
              label: identifyUser(user),
            }
          : { label: "-" }
      }
    />
  );
};
