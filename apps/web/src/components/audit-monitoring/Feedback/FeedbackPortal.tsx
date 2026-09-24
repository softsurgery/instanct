import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDebounce } from "@instanct/hooks/utils";
import { useBreadcrumb } from "@instanct/contexts";
import { useIntro } from "@instanct/contexts";
import { ResponseFeedbackDto } from "@instanct/api-client";
import { useTranslation } from "react-i18next";
import { useFeedbackColumns } from "./useFeedbackColumns";
import { DataTableConfig } from "@instanct/datatable-builder";
import { DataTable } from "@instanct/datatable-builder";

interface FeedbackPortalProps {
  className?: string;
  userId?: string;
}

export const FeedbackPortal = ({ className, userId }: FeedbackPortalProps) => {
  const { t, ready } = useTranslation("common");
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { setIntro, clearIntro } = useIntro();

  React.useEffect(() => {
    if (!userId) {
      setRoutes?.([
        { title: "Audit Monitoring", href: "/audit-monitoring" },
        {
          title: "Feedback",
          href: "/audit-monitoring/feedback",
        },
      ]);
      setIntro?.("Feedback", "View and manage user feedback in the system.");
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

  const { data: feedbackResponse, isPending: isFeedbackPending } = useQuery({
    queryKey: [
      "feedback",
      debouncedPage,
      debouncedSize,
      debouncedSortDetails.order,
      debouncedSortDetails.sortKey,
      debouncedSearchTerm,
    ],
    queryFn: () =>
      api.admin.feedback.findPaginated({
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

  const feedbackData = React.useMemo(() => {
    if (!feedbackResponse) return [];
    return feedbackResponse.data;
  }, [feedbackResponse]);

  const context: DataTableConfig<ResponseFeedbackDto> = {
    singularName: "Feedback",
    pluralName: "Feedbacks",
    page,
    size,
    totalPageCount: feedbackResponse?.meta.pageCount || 0,
    setPage,
    setSize,
    order: sortDetails.order,
    sortKey: sortDetails.sortKey,
    setSortDetails: (order: boolean, sortKey: string) =>
      setSortDetails({ order, sortKey }),
    searchTerm,
    setSearchTerm,
  };

  const columns = useFeedbackColumns(context);

  const isPending =
    isFeedbackPending || paging || resizing || searching || sorting;

  return (
    <div className={cn("flex flex-col flex-1 overflow-hidden", className)}>
      <DataTable
        className="flex flex-col flex-1 overflow-auto p-1"
        containerClassName="overflow-auto"
        columns={columns}
        data={feedbackData}
        context={context}
        isPending={isPending}
      />
    </div>
  );
};
