import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDebounce } from "@softsurgery/hooks/utils";
import { DataTable, DataTableConfig } from "@softsurgery/datatable-builder";
import { useTranslation } from "react-i18next";
import { ResponseUserConnectionHistoryDto } from "@/types";
import { useConnectionColumns } from "./useConnectionColumns";

interface ConnectionsProps {
  className?: string;
  userId?: string;
}

export const Connections = ({ className, userId }: ConnectionsProps) => {
  const { t } = useTranslation("user-management");

  const [page, setPage] = React.useState(1);
  const { value: debouncedPage, loading: paging } = useDebounce<number>(
    page,
    500,
  );

  const [size, setSize] = React.useState(10);
  const { value: debouncedSize, loading: resizing } = useDebounce<number>(
    size,
    500,
  );

  const [sortDetails, setSortDetails] = React.useState({
    order: false,
    sortKey: "createdAt",
  });
  const { value: debouncedSortDetails, loading: sorting } = useDebounce<
    typeof sortDetails
  >(sortDetails, 500);

  const [searchTerm, setSearchTerm] = React.useState("");
  const { value: debouncedSearchTerm, loading: searching } =
    useDebounce<string>(searchTerm, 500);

  const { data: rawHistory, isPending: isHistoryPending } = useQuery({
    queryKey: ["user-connection-history", userId],
    queryFn: () =>
      userId
        ? api.userDeviceHistory.getAll({ userId })
        : api.userDeviceHistory.getAll(),
    enabled: !!userId,
  });

  const filteredHistory = React.useMemo(() => {
    if (!rawHistory) return [];
    let list = [...rawHistory];
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      list = list.filter(
        (h) =>
          h.source?.toLowerCase().includes(term) ||
          h.ipAddress?.toLowerCase().includes(term) ||
          h.location?.toLowerCase().includes(term) ||
          h.device?.deviceName?.toLowerCase().includes(term),
      );
    }

    list.sort((a, b) => {
      const key =
        debouncedSortDetails.sortKey as keyof ResponseUserConnectionHistoryDto;
      const aVal = a[key] ?? "";
      const bVal = b[key] ?? "";
      if (aVal < bVal) return debouncedSortDetails.order ? -1 : 1;
      if (aVal > bVal) return debouncedSortDetails.order ? 1 : -1;
      return 0;
    });

    return list;
  }, [rawHistory, debouncedSearchTerm, debouncedSortDetails]);

  const totalPageCount = Math.max(
    1,
    Math.ceil(filteredHistory.length / debouncedSize),
  );

  const paginatedData = React.useMemo(() => {
    const start = (debouncedPage - 1) * debouncedSize;
    return filteredHistory.slice(start, start + debouncedSize);
  }, [filteredHistory, debouncedPage, debouncedSize]);

  const context: DataTableConfig<ResponseUserConnectionHistoryDto> = {
    singularName: t("userManagement.inspect.connections.singular"),
    pluralName: t("userManagement.inspect.connections.plural"),
    page,
    size,
    totalPageCount,
    setPage,
    setSize,
    order: sortDetails.order,
    sortKey: sortDetails.sortKey,
    setSortDetails: (order: boolean, sortKey: string) =>
      setSortDetails({ order, sortKey }),
    searchTerm,
    setSearchTerm,
  };

  const columns = useConnectionColumns(context);
  const isPending =
    isHistoryPending || paging || resizing || searching || sorting;

  return (
    <div className={cn("flex flex-col flex-1 overflow-hidden", className)}>
      <DataTable
        className="flex flex-col flex-1 overflow-auto p-1"
        containerClassName="overflow-auto"
        columns={columns}
        data={paginatedData}
        context={context}
        isPending={isPending}
      />
    </div>
  );
};
