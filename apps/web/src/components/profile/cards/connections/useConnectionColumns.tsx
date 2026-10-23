import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  DataTableColumnHeader,
  DataTableConfig,
} from "@softsurgery/datatable-builder";
import { Badge } from "@softsurgery/ui";
import { ResponseUserConnectionHistoryDto } from "@/types";
import { useTranslation } from "react-i18next";

const formatDateSafe = (date?: string | Date | null): string => {
  if (!date) return "-";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return format(d, "yyyy-MM-dd HH:mm");
  } catch {
    return "-";
  }
};

export const useConnectionColumns = (
  context: DataTableConfig<ResponseUserConnectionHistoryDto>,
): ColumnDef<ResponseUserConnectionHistoryDto>[] => {
  const { t } = useTranslation("user-management");

  return [
    {
      accessorKey: "device",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.connections.columns.device")}
          attribute="device"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.device?.deviceName || row.original.deviceId || "-"}
        </span>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "source",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.connections.columns.source")}
          attribute="source"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.source || "mobile"}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "ipAddress",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.connections.columns.ipAddress")}
          attribute="ipAddress"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.ipAddress || "-"}</span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.connections.columns.location")}
          attribute="location"
          context={context}
        />
      ),
      cell: ({ row }) => <span>{row.original.location || "-"}</span>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.connections.columns.status")}
          attribute="disconnectedAt"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const isActive = !row.original.disconnectedAt;
        return (
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={
              isActive
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                : ""
            }
          >
            {isActive
              ? t("userManagement.inspect.connections.columns.active")
              : t("userManagement.inspect.connections.columns.disconnected")}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.connections.columns.connectedAt")}
          attribute="createdAt"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDateSafe(row.original.createdAt)}
        </span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "disconnectedAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.connections.columns.disconnectedAt")}
          attribute="disconnectedAt"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDateSafe(row.original.disconnectedAt)}
        </span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
  ];
};
