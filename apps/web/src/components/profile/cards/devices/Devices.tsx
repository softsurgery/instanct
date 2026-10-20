import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDebounce } from "@softsurgery/hooks/utils";
import { DataTable, DataTableConfig } from "@softsurgery/datatable-builder";
import { useTranslation } from "react-i18next";
import { ResponseUserDeviceDto } from "@/types";
import { useDeviceColumns } from "./useDeviceColumns";

interface DevicesProps {
  className?: string;
  userId?: string;
}

export const Devices = ({ className, userId }: DevicesProps) => {
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
    sortKey: "updatedAt",
  });
  const { value: debouncedSortDetails, loading: sorting } = useDebounce<
    typeof sortDetails
  >(sortDetails, 500);

  const [searchTerm, setSearchTerm] = React.useState("");
  const { value: debouncedSearchTerm, loading: searching } =
    useDebounce<string>(searchTerm, 500);

  const { data: rawDevices, isPending: isDevicesPending } = useQuery({
    queryKey: ["user-devices", userId],
    queryFn: () =>
      userId ? api.userDevices.getAll({ userId }) : api.userDevices.getAll(),
    enabled: !!userId,
  });

  const filteredDevices = React.useMemo(() => {
    if (!rawDevices) return [];
    let list = [...rawDevices];
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      list = list.filter(
        (d) =>
          d.deviceName?.toLowerCase().includes(term) ||
          d.deviceModel?.toLowerCase().includes(term) ||
          d.os?.toLowerCase().includes(term) ||
          d.macAddress?.toLowerCase().includes(term),
      );
    }

    list.sort((a, b) => {
      const key = debouncedSortDetails.sortKey as keyof ResponseUserDeviceDto;
      const aVal = a[key] ?? "";
      const bVal = b[key] ?? "";
      if (aVal < bVal) return debouncedSortDetails.order ? -1 : 1;
      if (aVal > bVal) return debouncedSortDetails.order ? 1 : -1;
      return 0;
    });

    return list;
  }, [rawDevices, debouncedSearchTerm, debouncedSortDetails]);

  const totalPageCount = Math.max(
    1,
    Math.ceil(filteredDevices.length / debouncedSize),
  );

  const paginatedData = React.useMemo(() => {
    const start = (debouncedPage - 1) * debouncedSize;
    return filteredDevices.slice(start, start + debouncedSize);
  }, [filteredDevices, debouncedPage, debouncedSize]);

  const context: DataTableConfig<ResponseUserDeviceDto> = {
    singularName: t("userManagement.inspect.devices.singular"),
    pluralName: t("userManagement.inspect.devices.plural"),
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

  const columns = useDeviceColumns(context);
  const isPending =
    isDevicesPending || paging || resizing || searching || sorting;

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
