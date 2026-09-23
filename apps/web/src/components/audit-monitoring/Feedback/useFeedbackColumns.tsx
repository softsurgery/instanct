import { DataTableCell } from "@instanct/datatable-builder";
import { DataTableColumnHeader } from "@instanct/datatable-builder";
import {
  DataTableCellVariant,
  DataTableConfig,
} from "@instanct/datatable-builder";

import { ResponseFeedbackDto } from "@instanct/api-client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { identifyUser } from "@instanct/lib";

export const useFeedbackColumns = (
  context: DataTableConfig<ResponseFeedbackDto>,
): ColumnDef<ResponseFeedbackDto>[] => {
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
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Category"
          attribute="category"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.category}</span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "message",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Message"
          attribute="message"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground break-words">
          {row.original.message}
        </span>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Rating"
          attribute="rating"
          context={context}
        />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.rating !== undefined ? row.original.rating : "N/A"}
        </span>
      ),
      enableSorting: true,
      enableHiding: true,
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
  ];
};
