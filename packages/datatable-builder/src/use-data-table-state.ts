import { useLocalStorage } from "@instanct/hooks/utils";
import React from "react";

interface UseDataTableStateOptions {
  order?: boolean;
  sortKey?: string;
  page?: number;
  size?: number;
}

export function useDataTableState(
  tableId: string,
  options: UseDataTableStateOptions = {},
) {
  const [page, setPage] = useLocalStorage(`${tableId}-page`, options.page ?? 1);
  const [size, setSize] = useLocalStorage(
    `${tableId}-size`,
    options.size ?? 10,
  );
  const [sortDetails, setSortDetails] = useLocalStorage(`${tableId}-sort`, {
    order: options.order ?? true,
    sortKey: options.sortKey ?? "id",
  });
  const [searchTerm, setSearchTerm] = useLocalStorage(`${tableId}-search`, "");
  const [columnFilters, setColumnFilters] = useLocalStorage<
    Record<string, string>
  >(`${tableId}-filters`, {});

  const defaultSort = React.useMemo(
    () => ({
      order: options.order ?? true,
      sortKey: options.sortKey ?? "id",
    }),
    [options.order, options.sortKey],
  );

  const hasActiveFiltersOrSort = React.useMemo(
    () =>
      Boolean(searchTerm) ||
      Object.keys(columnFilters).length > 0 ||
      sortDetails.sortKey !== defaultSort.sortKey ||
      sortDetails.order !== defaultSort.order,
    [
      columnFilters,
      defaultSort.order,
      defaultSort.sortKey,
      searchTerm,
      sortDetails,
    ],
  );

  const clearFiltersAndSort = React.useCallback(() => {
    setSearchTerm("");
    setColumnFilters({});
    setSortDetails(defaultSort);
    setPage(1);
  }, [defaultSort]);

  return {
    page,
    setPage,
    size,
    setSize,
    sortDetails,
    setSortDetails,
    searchTerm,
    setSearchTerm,
    columnFilters,
    setColumnFilters,
    tableReset: {
      hasActiveFiltersOrSort,
      clearFiltersAndSort,
    },
  };
}
