import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DataTableColumnHeader,
  DataTableRowActions,
  DataTableConfig,
} from "@softsurgery/datatable-builder";
import { ResponseConfigurationParamDto } from "@/types";
import { useTranslation } from "react-i18next";
import { Badge } from "@softsurgery/ui";
import { parseArrayValue, formatArrayItem } from "./formatConfigParam";
import _ from "lodash";

export interface FlatConfigParamItem
  extends Omit<ResponseConfigurationParamDto, "namespaceId"> {
  namespaceName?: string;
  namespaceId?: string;
}

export const useConfigurationParamColumns = (
  context: DataTableConfig<FlatConfigParamItem>,
): ColumnDef<FlatConfigParamItem>[] => {
  const { t } = useTranslation("content-management");

  return [
    {
      accessorKey: "namespaceName",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("configuration.columns.name", "Namespace")}
          attribute="namespaceName"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize text-xs font-semibold">
          {_.startCase(row.original.namespaceName || "default")}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("configuration.columns.paramKey", "Key")}
          attribute="name"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const name = row.original.name || "";
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {_.startCase(name.split(".").slice(1).join(" ") || name)}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {name}
            </span>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "variant",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("configuration.columns.variant", "Type")}
          attribute="variant"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="uppercase text-[10px] font-mono">
          {row.original.variant}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("configuration.columns.value", "Value")}
          attribute="value"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const val = row.original.value;
        if (row.original.variant === "boolean") {
          return (
            <Badge variant={val === "true" ? "default" : "outline"} className="text-xs">
              {val === "true" ? "True" : "False"}
            </Badge>
          );
        }

        const parsedArray = parseArrayValue(val);
        if (parsedArray) {
          if (!parsedArray.length) {
            return (
              <span className="font-mono text-xs text-muted-foreground italic">
                (empty list)
              </span>
            );
          }
          return (
            <div className="flex flex-col gap-0.5 py-0.5 font-mono text-xs text-muted-foreground max-h-40 overflow-y-auto">
              <span className="text-[11px] text-muted-foreground/80 mb-0.5">
                ({parsedArray.length} {parsedArray.length === 1 ? "item" : "items"})
              </span>
              <div className="flex flex-col pl-2 border-l border-border/60 gap-0.5">
                {parsedArray.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-baseline gap-1.5 truncate max-w-md"
                    title={typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)}
                  >
                    <span className="text-muted-foreground/50 select-none">•</span>
                    <span className="text-foreground truncate">{formatArrayItem(item)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <span className="font-mono text-xs text-foreground bg-muted/30 px-2 py-0.5 rounded border">
            {val !== undefined && val !== "" ? val : "—"}
          </span>
        );
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
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">
          {row.original.description || "—"}
        </span>
      ),
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
