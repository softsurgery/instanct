import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DataTableColumnHeader,
  DataTableRowActions,
  DataTableConfig,
} from "@softsurgery/datatable-builder";
import { ResponseConfigurationNamespaceDto } from "@/types";
import { useTranslation } from "react-i18next";
import { ConfigurationParamTree } from "./ConfigurationParamTree";
import _ from "lodash";

export const useConfigurationColumns = (
  context: DataTableConfig<ResponseConfigurationNamespaceDto>,
): ColumnDef<ResponseConfigurationNamespaceDto>[] => {
  const { t } = useTranslation("content-management");

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("configuration.columns.name", "Namespace")}
          attribute="name"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const name = row.original.name || "default";
        return <div className="flex flex-col">{_.startCase(name)}</div>;
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("configuration.columns.description", "Description")}
          attribute="description"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-[320px]">
          {row.original.description || "—"}
        </span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "params",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("configuration.columns.params", "Parameters")}
          attribute="params"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <ConfigurationParamTree
          params={row.original.params}
          namespaceName={row.original.name}
          searchTerm={context.searchTerm}
        />
      ),
      enableSorting: false,
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
