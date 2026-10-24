import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DataTableColumnHeader,
  DataTableCell,
  DataTableCellVariant,
  DataTableConfig,
  DataTableRowActions,
} from "@softsurgery/datatable-builder";
import { useTranslation } from "react-i18next";
import { ResponseTemplateDto } from "../../types";

export const useTemplateColumns = (
  context: DataTableConfig<ResponseTemplateDto>,
): ColumnDef<ResponseTemplateDto>[] => {
  const { t } = useTranslation("content-management");

  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("templates.columns.id", "ID")}
          attribute="id"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs text-muted-foreground truncate max-w-30">
          {row.original.id}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("templates.columns.name", "Name")}
          attribute="name"
          context={context}
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium truncate">{row.original.name || "—"}</div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "size",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("templates.columns.size", "Size")}
          attribute="size"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <DataTableCell
          variant={DataTableCellVariant.FILE_SIZE}
          value={row.original.size}
        />
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("templates.columns.createdAt", "Created At")}
          attribute="createdAt"
          context={context}
        />
      ),
      cell: ({ row }) => {
        if (!row.original.createdAt) return <div>—</div>;
        const date =
          typeof row.original.createdAt === "string"
            ? new Date(row.original.createdAt)
            : row.original.createdAt;
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
          title={t("templates.columns.updatedAt", "Updated At")}
          attribute="updatedAt"
          context={context}
        />
      ),
      cell: ({ row }) => {
        if (!row.original.updatedAt) return <div>—</div>;
        const date =
          typeof row.original.updatedAt === "string"
            ? new Date(row.original.updatedAt)
            : row.original.updatedAt;
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
