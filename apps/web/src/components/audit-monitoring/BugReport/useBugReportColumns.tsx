import { DataTableCell } from "@instanct/datatable-builder";
import { DataTableColumnHeader } from "@instanct/datatable-builder";
import {
  DataTableCellVariant,
  DataTableConfig,
} from "@instanct/datatable-builder";

import { ResponseBugDto, ResponseDeviceInfoDto } from "@instanct/api-client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { identifyUser } from "@instanct/lib";
import { Badge, Button } from "@instanct/ui";
import { DataTableRowActions } from "@instanct/datatable-builder";

export const useBugReportColumns = (
  context: DataTableConfig<ResponseBugDto>,
  onDeviceClick?: (device: ResponseDeviceInfoDto) => void,
): ColumnDef<ResponseBugDto>[] => {
  const { t } = useTranslation("common");
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="ID"
          attribute="id"
          context={context}
        />
      ),
      cell: ({ row }) => <span className="font-mono">{row.original.id}</span>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "variant",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Variant"
          attribute="variant"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.variant}</span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Title"
          attribute="title"
          context={context}
        />
      ),
      cell: ({ row }) => <span>{row.original.title}</span>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Status"
          attribute="status"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const status = row.original.status || "Pending";
        return (
          <Badge
            variant={
              status === "Resolved"
                ? "default"
                : status === "Not Resolved"
                  ? "destructive"
                  : "secondary"
            }
          >
            {status}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Description"
          attribute="description"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground wrap-break-word whitespace-normal">
          {row.original.description}
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
      size: 200,
    },
    {
      accessorKey: "user",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="User"
          attribute="userId"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) return <span className="text-muted-foreground">System</span>;
        return (
          <Link
            href={`/user-management/users/${user.id}`}
            className="hover:underline text-primary"
          >
            {identifyUser(user)}
          </Link>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "device",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Device"
          attribute="device"
          context={context}
        />
      ),
      cell: ({ row }) => {
        const device = row.original.device;
        if (!device)
          return <span className="text-muted-foreground">Unknown</span>;
        return (
          <Button
            variant="link"
            className="p-0 h-auto font-medium text-xs"
            onClick={() => onDeviceClick?.(device)}
          >
            {device.model || device.platform || "View Device"}
          </Button>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Reported At"
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
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DataTableRowActions row={row} context={context} />
        </div>
      ),
    },
  ];
};
