import React from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDebounce } from "@softsurgery/hooks/utils";
import { useBreadcrumb } from "@softsurgery/contexts";
import { useIntro } from "@softsurgery/contexts";
import {
  BugStatus,
  Paginated,
  ResponseBugDto,
  ResponseUserDeviceDto,
  ServerErrorResponse,
} from "api-client";
import { useTranslation } from "react-i18next";
import { useBugReportColumns } from "./useBugReportColumns";
import { useBugDeviceDialog } from "./modals/BugDeviceDialog";
import { useBugDeleteDialog } from "./modals/BugDeleteDialog";
import { DataTableConfig } from "@softsurgery/datatable-builder";
import { DataTable } from "@softsurgery/datatable-builder";
import { Check, CheckCheck, Clock, X } from "lucide-react";
import { toast } from "sonner";

interface BugReportPortalProps {
  className?: string;
  userId?: string;
}

export const BugReportPortal = ({
  className,
  userId,
}: BugReportPortalProps) => {
  const router = useRouter();
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
        join: "user,device,interestedUsers",
        search: debouncedSearchTerm,
        filter: userId ? `userId||$eq||${userId}` : "",
      }),
  });

  const bugs = React.useMemo(() => {
    if (!bugResponse) return [];
    return bugResponse.data;
  }, [bugResponse]);

  const queryClient = useQueryClient();

  const [selectedBugForDelete, setSelectedBugForDelete] = React.useState<
    ResponseBugDto | undefined
  >(undefined);

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({
      id,
      status,
      notify = true,
    }: {
      id: string;
      status: BugStatus | string;
      notify?: boolean;
    }) => api.admin.bugReport.updateStatus(id, status, notify),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["bugs"] });

      const previousBugsQueries = queryClient.getQueriesData<
        Paginated<ResponseBugDto>
      >({ queryKey: ["bugs"] });

      queryClient.setQueriesData<Paginated<ResponseBugDto>>(
        { queryKey: ["bugs"] },
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((bug) =>
              String(bug.id) === String(id)
                ? { ...bug, status: status as BugStatus }
                : bug,
            ),
          };
        },
      );

      return { previousBugsQueries };
    },
    onError: (err: ServerErrorResponse, variables, context) => {
      if (context?.previousBugsQueries) {
        context.previousBugsQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(
        err.response?.data?.message ||
          t("bugReport.messages.statusError", "Failed to update bug status."),
      );
    },
    onSuccess: (_, variables) => {
      if (variables.status === BugStatus.RESOLVED) {
        if (variables.notify === false) {
          toast.success(
            t(
              "bugReport.messages.markAsResolvedSuccess",
              "Bug report marked as resolved.",
            ),
          );
        } else {
          toast.success(
            t(
              "bugReport.messages.resolveSuccess",
              "Bug report resolved and interested users notified.",
            ),
          );
        }
      } else {
        toast.success(
          t(
            "bugReport.messages.statusSuccess",
            "Bug status updated successfully.",
          ),
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bugs"] });
    },
  });

  const { mutate: deleteBug, isPending: isDeletionPending } = useMutation({
    mutationFn: (id: string) => api.admin.bugReport.delete(id),
    onSuccess: () => {
      toast.success(
        t(
          "bugReport.messages.deleteSuccess",
          "Bug report deleted successfully.",
        ),
      );
      queryClient.invalidateQueries({ queryKey: ["bugs"] });
      setSelectedBugForDelete(undefined);
      closeDeleteBugDialog();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message ||
          t("bugReport.messages.deleteError", "Failed to delete bug report."),
      );
    },
  });

  const { deleteBugDialog, openDeleteBugDialog, closeDeleteBugDialog } =
    useBugDeleteDialog({
      representation: selectedBugForDelete?.title,
      deleteBug: () => {
        if (selectedBugForDelete?.id) {
          deleteBug(String(selectedBugForDelete.id));
        }
      },
      isDeletionPending,
      resetBug: () => setSelectedBugForDelete(undefined),
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
    createCallback: () => {
      router.push("/audit-monitoring/bug-report/create");
    },
    updateCallback: (entity) => {
      router.push(`/audit-monitoring/bug-report/${entity.id}`);
    },
    deleteCallback: (entity) => {
      setSelectedBugForDelete(entity);
      openDeleteBugDialog();
    },
    additionalActions: {
      1: [
        {
          actionLabel: "Resolve",
          actionIcon: <CheckCheck className="w-4 h-4 text-emerald-600" />,
          isActionVisible: (entity: ResponseBugDto) =>
            entity.status !== BugStatus.RESOLVED,
          actionCallback: (entity: ResponseBugDto) =>
            updateStatus({
              id: String(entity.id),
              status: BugStatus.RESOLVED,
              notify: true,
            }),
        },
        {
          actionLabel: "Mark as Resolved",
          actionIcon: <Check className="w-4 h-4" />,
          isActionVisible: (entity: ResponseBugDto) =>
            entity.status !== BugStatus.RESOLVED,
          actionCallback: (entity: ResponseBugDto) =>
            updateStatus({
              id: String(entity.id),
              status: BugStatus.RESOLVED,
              notify: false,
            }),
        },
        {
          actionLabel: "Unresolve",
          actionIcon: <X className="w-4 h-4" />,
          isActionVisible: (entity: ResponseBugDto) =>
            entity.status !== BugStatus.NOT_RESOLVED,
          actionCallback: (entity: ResponseBugDto) =>
            updateStatus({
              id: String(entity.id),
              status: BugStatus.NOT_RESOLVED,
            }),
        },
        {
          actionLabel: "Pend",
          actionIcon: <Clock className="w-4 h-4" />,
          isActionVisible: (entity: ResponseBugDto) =>
            entity.status !== BugStatus.PENDING && !!entity.status,
          actionCallback: (entity: ResponseBugDto) =>
            updateStatus({
              id: String(entity.id),
              status: BugStatus.PENDING,
            }),
        },
      ],
    },
  };

  const [selectedDevice, setSelectedDevice] = React.useState<
    ResponseUserDeviceDto | undefined
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
      {deleteBugDialog}
    </div>
  );
};
