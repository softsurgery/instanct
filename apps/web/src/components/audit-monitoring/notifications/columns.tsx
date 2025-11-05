import DataTableCell from "@/components/shared/data-table/core/data-table-cell";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import {
  DataTableCellVariant,
  DataTableConfig,
} from "@/components/shared/data-table/types";
import { Trans } from "@/components/shared/Trans";
import { ResponseNotificationDto } from "@/types/notifications";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export const useNotificationColumns = (
  context: DataTableConfig<ResponseNotificationDto>
): ColumnDef<ResponseNotificationDto>[] => {
  const { t } = useTranslation("user-management");
  return [
    {
      accessorKey: t("userManagement.inspect.notifications.columns.type"),
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.notifications.columns.type")}
          attribute="type"
          context={context}
        />
      ),
      cell: ({ row }) => {
        return (
          <Trans ns="notifications" i18nKey={`titles.${row?.original?.type}`} />
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: t("userManagement.inspect.notifications.columns.description"),
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.notifications.columns.description")}
          attribute="description"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const event = row?.original?.type;
        return (
          <Trans
            ns="notifications"
            i18nKey={`descriptions.${event}`}
            values={{
              ...row.original.payload,
              user: {
                id: row?.original?.user?.id,
                username: row?.original?.user?.username,
              },
            }}
            components={{
              a: (
                <Link
                  href={`/user-management/users/${row?.original?.user?.id}`}
                  className="hover:underline"
                />
              ),
            }}
          />
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: `${t("userManagement.inspect.notifications.columns.recievedAt")}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.notifications.columns.recievedAt")}
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
  ];
};
