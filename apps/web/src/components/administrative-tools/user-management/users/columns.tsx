import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Badge } from "@softsurgery/ui";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@softsurgery/datatable-builder";
import { DataTableRowActions } from "@softsurgery/datatable-builder";
import { ResponseUserDto } from "@/types";
import { DataTableCell } from "@softsurgery/datatable-builder";
import { useTranslation } from "react-i18next";
import UserAvatarCell from "./UserAvatarCell";
import {
  DataTableCellVariant,
  DataTableConfig,
} from "@softsurgery/datatable-builder";
import { identifyUserAvatar } from "@softsurgery/lib";
import { UserConnectionStatus } from "@/hooks/content/user/useUserConnection";

export const useUserColumns = (
  context: DataTableConfig<ResponseUserDto>,
  t: (key: string) => string,
  isUserConnected?: (userId: string) => boolean,
  statuses?: Record<string, UserConnectionStatus>,
): ColumnDef<ResponseUserDto>[] => {
  const { t: tCommon } = useTranslation("common");

  return [
    {
      accessorKey: `${t("userManagement.columns.photo")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.columns.photo")}
          attribute="photo"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <UserAvatarCell
          pictureId={row?.original?.pictureId}
          fallback={identifyUserAvatar(row?.original)}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: `${t("userManagement.columns.username")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.columns.username")}
          attribute="username"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <div className="font-bold">{row.original.username}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: `${t("userManagement.columns.email")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.columns.email")}
          attribute="email"
          context={context}
        />
      ),
      cell: ({ row }) => <div className="font-bold">{row.original.email}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: `${t("userManagement.columns.firstName")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.columns.firstName")}
          attribute="firstName"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.firstName || (
            <span className="opacity-70">
              {t("userManagement.errors.notDefined")}
            </span>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: `${t("userManagement.columns.lastName")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.columns.lastName")}
          attribute="lastName"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.lastName || (
            <span className="opacity-70">
              {t("userManagement.errors.notDefined")}
            </span>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: `${t("userManagement.columns.dateOfBirth")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.columns.dateOfBirth")}
          attribute="dateOfBirth"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <div>
          {(row.original.dateOfBirth &&
            format(row.original.dateOfBirth, "yyyy-MM-dd")) || (
            <span className="opacity-70">
              {t("userManagement.errors.notDefined")}
            </span>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: `${t("userManagement.columns.role")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.columns.role")}
          attribute="role.label"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original?.roleId || (
            <span className="opacity-70">
              {t("userManagement.errors.roleNotFound")}
            </span>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: `${t("userManagement.columns.connected")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.columns.connected")}
          attribute="connected"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const userId = row.original.id;
        const isConnected = isUserConnected
          ? isUserConnected(userId)
          : !!statuses?.[userId]?.isConnected;

        if (isConnected) {
          return (
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">
              {t("userManagement.columns.connected")}
            </div>
          );
        }

        const rawDate =
          statuses?.[userId]?.lastSeen ||
          (row.original as unknown as { lastSeen?: string | Date })?.lastSeen;
        const lastSeenDate = rawDate ? new Date(rawDate) : null;

        return (
          <DataTableCell
            variant={DataTableCellVariant.DATE_TIME}
            value={
              lastSeenDate && !isNaN(lastSeenDate.getTime())
                ? lastSeenDate
                : undefined
            }
          />
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: `${t("userManagement.columns.isActive")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.columns.isActive")}
          attribute="isActive"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? "default" : "secondary"}
          className={cn("font-bold")}
        >
          {row.original.isActive
            ? tCommon("common.buttons.yes")
            : tCommon("common.buttons.no")}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: `${t("userManagement.columns.isApproved")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.columns.isApproved")}
          attribute="isApproved"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.original.isApproved ? "default" : "secondary"}
          className={cn("font-bold")}
        >
          {row.original.isApproved
            ? tCommon("common.buttons.yes")
            : tCommon("common.buttons.no")}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: `${t("userManagement.columns.createdAt")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.columns.createdAt")}
          attribute="createdAt"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const date = new Date(row?.original?.createdAt);
        return (
          <DataTableCell
            variant={DataTableCellVariant.DATE_TIME}
            value={date}
          />
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: `${t("userManagement.columns.updatedAt")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.columns.updatedAt")}
          attribute="updatedAt"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const date = new Date(row?.original?.updatedAt);
        return (
          <DataTableCell
            variant={DataTableCellVariant.DATE_TIME}
            value={date}
          />
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DataTableRowActions row={row} context={context} />
        </div>
      ),
    },
  ];
};
