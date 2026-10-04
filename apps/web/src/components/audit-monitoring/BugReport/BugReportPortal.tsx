import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDebounce } from "@instanct/hooks/utils";
import { useBreadcrumb } from "@instanct/contexts";
import { useIntro } from "@instanct/contexts";
import { ResponseBugDto } from "@instanct/api-client";
import { useTranslation } from "react-i18next";
import { useBugReportColumns } from "./useBugReportColumns";
import { useBugDeviceDialog } from "./modals/BugDeviceDialog";
import { DataTableConfig } from "@instanct/datatable-builder";
import { ResponseDeviceInfoDto } from "@instanct/api-client";
import { DataTable } from "@instanct/datatable-builder";
import { Check, Clock, X } from "lucide-react";

interface BugReportPortalProps {
  className?: string;
  userId?: string;
}

export const BugReportPortal = ({
  className,
  userId,
}: BugReportPortalProps) => {
  const { t, ready } = useTranslation("common");
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { setIntro, clearIntro } = useIntro();

  React.useEffect(() => {
    if (!userId) {
      setRoutes?.([
        { title: "Audit Monitoring", href: "/audit-monitoring" },
        {
          title: "Bug Reports",
          href: "/audit-monitoring/bug-report",
        },
      ]);
      setIntro?.(
        "Bug Reports",
        "View and manage user reported bugs in the system.",
      );
      return () => {
        clearRoutes?.();
        clearIntro?.();
      };
    }
  }, [t, ready, userId, setRoutes, setIntro, clearRoutes, clearIntro]);

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

  const { data: bugResponse, isPending: isBugsPending } = useQuery({
    queryKey: [
      "bugs",
      debouncedPage,
      debouncedSize,
      debouncedSortDetails.order,
      debouncedSortDetails.sortKey,
      debouncedSearchTerm,
    ],
    queryFn: () =>
      api.admin.bugReport.findPaginated({
        page: debouncedPage.toString(),
        limit: debouncedSize.toString(),
        sort: `${debouncedSortDetails.sortKey},${
          debouncedSortDetails.order ? "ASC" : "DESC"
        }`,
        join: "user",
        search: debouncedSearchTerm,
        filter: userId ? `userId||$eq||${userId}` : "",
      }),
  });

  const bugs = React.useMemo(() => {
    if (!bugResponse) return [];
    return bugResponse.data;
  }, [bugResponse]);

  const queryClient = useQueryClient();

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.admin.bugReport.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugs"] });
    },
  });

  const { mutate: deleteBug } = useMutation({
    mutationFn: (id: string) => api.admin.bugReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugs"] });
    },
  });

  const context: DataTableConfig<ResponseBugDto> = {
    singularName: "Bug Report",
    pluralName: "Bug Reports",
    page,
    size,
    totalPageCount: bugResponse?.meta.pageCount || 0,
    setPage,
    setSize,
    order: sortDetails.order,
    sortKey: sortDetails.sortKey,
    setSortDetails: (order: boolean, sortKey: string) =>
      setSortDetails({ order, sortKey }),
    searchTerm,
    setSearchTerm,
    deleteCallback: (entity) => deleteBug(String(entity.id)),
    additionalActions: {
      1: [
        {
          actionLabel: "Resolve",
          actionIcon: <Check className="w-4 h-4" />,
          isActionVisible: (entity: ResponseBugDto) =>
            entity.status !== "Resolved",
          actionCallback: (entity: ResponseBugDto) =>
            updateStatus({ id: String(entity.id), status: "Resolved" }),
        },
        {
          actionLabel: "Unresolve",
          actionIcon: <X className="w-4 h-4" />,
          isActionVisible: (entity: ResponseBugDto) =>
            entity.status !== "Not Resolved",
          actionCallback: (entity: ResponseBugDto) =>
            updateStatus({ id: String(entity.id), status: "Not Resolved" }),
        },
        {
          actionLabel: "Pend",
          actionIcon: <Clock className="w-4 h-4" />,
          isActionVisible: (entity: ResponseBugDto) =>
            entity.status !== "Pending" && !!entity.status,
          actionCallback: (entity: ResponseBugDto) =>
            updateStatus({ id: String(entity.id), status: "Pending" }),
        },
      ],
    },
  };

  const [selectedDevice, setSelectedDevice] = React.useState<
    ResponseDeviceInfoDto | undefined
  >(undefined);
  const { BugDeviceDialog, openBugDeviceDialog } = useBugDeviceDialog({
    device: selectedDevice,
    resetDevice: () => setSelectedDevice(undefined),
  });

  const columns = useBugReportColumns(context, (device) => {
    setSelectedDevice(device);
    openBugDeviceDialog();
  });

  const isPending = isBugsPending || paging || resizing || searching || sorting;

  return (
    <div className={cn("flex flex-col flex-1 overflow-hidden", className)}>
      <DataTable
        className="flex flex-col flex-1 overflow-auto p-1"
        containerClassName="overflow-auto"
        columns={columns}
        data={bugs}
        context={context}
        isPending={isPending}
      />
      {BugDeviceDialog}
    </div>
  );
};
