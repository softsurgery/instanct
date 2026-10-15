import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DataTableColumnHeader,
  DataTableRowActions,
  DataTableCell,
  DataTableCellVariant,
  DataTableConfig,
} from "@softsurgery/datatable-builder";
import { ResponseContentPageDto } from "@/types";
import { useTranslation } from "react-i18next";
import { Badge } from "@softsurgery/ui";

export const useContentPageColumns = (
  context: DataTableConfig<ResponseContentPageDto>,
): ColumnDef<ResponseContentPageDto>[] => {
  const { t } = useTranslation("content-management");

  return [
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("pages.columns.slug", "Slug")}
          attribute="slug"
          context={context}
        />
      ),
      cell: ({ row }) => <div>{row.original.slug}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("pages.columns.title", "Title")}
          attribute="title"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">
            {row.original.title}
          </span>
          {row.original.subtitle && (
            <span className="text-xs text-muted-foreground">
              {row.original.subtitle}
            </span>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("pages.columns.createdAt", "Created At")}
          attribute="createdAt"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
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
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("pages.columns.updatedAt", "Updated At")}
          attribute="updatedAt"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.updatedAt);
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
