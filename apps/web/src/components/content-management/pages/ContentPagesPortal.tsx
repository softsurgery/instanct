import React from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";
import { useDebounce } from "@instanct/hooks/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useBreadcrumb, useIntro } from "@instanct/contexts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DataTable, DataTableConfig } from "@instanct/datatable-builder";
import { useTranslation } from "react-i18next";
import {
  ResponseContentPageDto,
  ServerErrorResponse,
} from "@/types";
import { useApplicationLanguages } from "@/hooks/content/configuration/useApplicationLanguages";
import { useContentPageStore } from "@/hooks/stores/useContentPageStore";
import { useContentPageColumns } from "./useContentPageColumns";
import { useContentPageDeleteDialog } from "./ContentPageDeleteDialog";
import { PageLanguageToggle } from "./PageLanguageToggle";

interface ContentPagesPortalProps {
  className?: string;
}

export function ContentPagesPortal({ className }: ContentPagesPortalProps) {
  const router = useRouter();
  const { t, ready } = useTranslation("content-management");
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { setIntro, clearIntro, setFloating, clearFloating } = useIntro();
  const { languages } = useApplicationLanguages();
  const contentPageStore = useContentPageStore();

  const [selectedLocale, setSelectedLocale] = React.useState<string>("fr");
  const [selectedPageForDelete, setSelectedPageForDelete] =
    React.useState<ResponseContentPageDto | null>(null);

  React.useEffect(() => {
    setRoutes?.([
      {
        title: t("pages.breadcrumbs.contentManagement", "Content Management"),
        href: "/content-management",
      },
      {
        title: t("pages.breadcrumbs.pages", "Pages"),
        href: "/content-management/pages",
      },
    ]);
    setIntro?.(
      t("pages.page.title", "Pages"),
      t(
        "pages.page.description",
        "Manage static and dynamic content pages, localized versions, and legal policies.",
      ),
    );
    return () => {
      clearRoutes?.();
      clearIntro?.();
    };
  }, [t, ready, setRoutes, clearRoutes, setIntro, clearIntro]);

  React.useEffect(() => {
    setFloating?.(
      <PageLanguageToggle
        value={selectedLocale}
        onValueChange={setSelectedLocale}
        languages={languages}
      />,
    );

    return () => {
      clearFloating?.();
    };
  }, [clearFloating, languages, selectedLocale, setFloating]);

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
    order: true,
    sortKey: "title",
  });
  const { value: debouncedSortDetails, loading: sorting } = useDebounce<
    typeof sortDetails
  >(sortDetails, 500);

  const [searchTerm, setSearchTerm] = React.useState("");
  const { value: debouncedSearchTerm, loading: searching } =
    useDebounce<string>(searchTerm, 500);

  const {
    data: pagesResponse,
    isFetching: isPagesPending,
    refetch: refetchPages,
  } = useQuery({
    queryKey: [
      "content-pages",
      debouncedPage,
      debouncedSize,
      debouncedSortDetails.order,
      debouncedSortDetails.sortKey,
      debouncedSearchTerm,
      selectedLocale,
    ],
    queryFn: () =>
      api.admin.contentPage.findPaginated({
        page: debouncedPage.toString(),
        limit: debouncedSize.toString(),
        sort: `${debouncedSortDetails.sortKey},${
          debouncedSortDetails.order ? "ASC" : "DESC"
        }`,
        search: debouncedSearchTerm,
        locale: selectedLocale,
      }),
  });

  const contentPages = React.useMemo(() => {
    if (!pagesResponse) return [];
    return pagesResponse.data;
  }, [pagesResponse]);

  const { mutate: deletePage, isPending: isDeletionPending } = useMutation({
    mutationFn: (id: string) => api.admin.contentPage.remove(id),
    onSuccess: () => {
      toast.success(
        t("pages.messages.deleteSuccess", "Content page deleted successfully."),
      );
      refetchPages();
      setSelectedPageForDelete(null);
      closeDeleteContentPageDialog();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message ||
          t("pages.messages.deleteError", "Failed to delete page."),
      );
    },
  });

  const {
    deleteContentPageDialog,
    openDeleteContentPageDialog,
    closeDeleteContentPageDialog,
  } = useContentPageDeleteDialog({
    representation: selectedPageForDelete?.title,
    deleteContentPage: () => {
      if (selectedPageForDelete?.id) {
        deletePage(selectedPageForDelete.id);
      }
    },
    isDeletionPending,
    resetContentPage: () => setSelectedPageForDelete(null),
  });

  const context: DataTableConfig<ResponseContentPageDto> = {
    singularName: t("pages.singularName", "Content Page"),
    pluralName: t("pages.pluralName", "Content Pages"),
    createCallback: () => router.push("/content-management/pages/create"),
    updateCallback: (entity: ResponseContentPageDto) =>
      router.push(`/content-management/pages/${entity.id}`),
    deleteCallback: (entity: ResponseContentPageDto) => {
      setSelectedPageForDelete(entity);
      openDeleteContentPageDialog();
    },
    searchTerm,
    setSearchTerm,
    page,
    totalPageCount: pagesResponse?.meta?.pageCount || 0,
    setPage,
    size,
    setSize,
    order: sortDetails.order,
    sortKey: sortDetails.sortKey,
    setSortDetails: (order: boolean, sortKey: string) =>
      setSortDetails({ order, sortKey }),
    targetEntity: (page: ResponseContentPageDto) => {
      contentPageStore.set("response", page);
    },
  };

  const columns = useContentPageColumns(context);

  const isPending =
    isPagesPending || paging || resizing || searching || sorting;

  return (
    <div className={cn("flex flex-col flex-1 overflow-hidden", className)}>
      <DataTable
        className="flex flex-col flex-1 overflow-hidden p-1"
        containerClassName="overflow-auto"
        columns={columns}
        data={contentPages}
        context={context}
        isPending={Boolean(isPending)}
      />
      {deleteContentPageDialog}
    </div>
  );
}
