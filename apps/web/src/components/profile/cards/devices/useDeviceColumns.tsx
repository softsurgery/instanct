import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  DataTableColumnHeader,
  DataTableConfig,
} from "@softsurgery/datatable-builder";
import { Badge } from "@softsurgery/ui";
import { ResponseUserDeviceDto } from "@/types";
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

export const useDeviceColumns = (
  context: DataTableConfig<ResponseUserDeviceDto>,
): ColumnDef<ResponseUserDeviceDto>[] => {
  const { t } = useTranslation("user-management");

  return [
    {
      accessorKey: "deviceName",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.devices.columns.deviceName")}
          attribute="deviceName"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.deviceName || "Unknown Device"}
        </span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "deviceModel",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.devices.columns.deviceModel")}
          attribute="deviceModel"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.deviceModel || "-"}
        </span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "os",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.devices.columns.os")}
          attribute="os"
          context={context}
        />
      ),
      cell: ({ row }) => <span>{row.original.os || "-"}</span>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "macAddress",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.devices.columns.macAddress")}
          attribute="macAddress"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.macAddress}</span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "isTrusted",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.devices.columns.status")}
          attribute="isTrusted"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.original.isTrusted ? "default" : "secondary"}
          className={
            row.original.isTrusted
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
              : ""
          }
        >
          {row.original.isTrusted
            ? t("userManagement.inspect.devices.columns.trusted")
            : t("userManagement.inspect.devices.columns.untrusted")}
        </Badge>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("userManagement.inspect.devices.columns.lastActive")}
          attribute="updatedAt"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const date = row.original.updatedAt || row.original.createdAt;
        return (
          <span className="text-muted-foreground">{formatDateSafe(date)}</span>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
  ];
};
