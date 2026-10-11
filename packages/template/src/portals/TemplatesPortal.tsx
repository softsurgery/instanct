import React from "react";
import { useRouter } from "next/router";
import { useDebounce } from "@instanct/hooks/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useBreadcrumb, useIntro } from "@instanct/contexts";
import { toast } from "sonner";
import { cn } from "@instanct/ui";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import {
  TemplatesTable,
  useTemplateStore,
  useTemplateDeleteDialog,
  useTemplatePreviewSheet,
  type ResponseTemplateDto,
  type UpdateTemplateDto,
  type TemplateDataTableConfig,
  type TemplatesPortalProps,
} from "../index";

export const TemplatesPortal = ({
  className,
  api,
  createRoute = "/content-management/templates/create",
  editRoutePrefix = "/content-management/templates",
  onCreate,
  onEdit,
}: TemplatesPortalProps) => {
  const router = useRouter();
  const { t, ready } = useTranslation("content-management");
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { setIntro, clearIntro } = useIntro();

  React.useEffect(() => {
    setRoutes?.([
      {
        title: t("pages.breadcrumbs.contentManagement", "Content Management"),
        href: "/content-management",
      },
      {
        title: t("templates.page.title", "Templates"),
        href: "/content-management/templates",
      },
    ]);
    setIntro?.(
      t("templates.page.title", "Templates"),
      t(
        "templates.page.description",
        "Manage email and document templates, inspect contents and size in octets.",
      ),
    );
    return () => {
      clearRoutes?.();
      clearIntro?.();
    };
  }, [t, ready, setRoutes, clearRoutes, setIntro, clearIntro]);

  const templateStore = useTemplateStore();

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
    sortKey: "name",
  });
  const { value: debouncedSortDetails, loading: sorting } = useDebounce<
    typeof sortDetails
  >(sortDetails, 500);

  const [searchTerm, setSearchTerm] = React.useState("");
  const { value: debouncedSearchTerm, loading: searching } =
    useDebounce<string>(searchTerm, 500);

  // Template to preview
  const [previewTemplate, setPreviewTemplate] =
    React.useState<ResponseTemplateDto | null>(null);

  const {
    data: templatesResponse,
    isFetching: isTemplatesPending,
    refetch: refetchTemplates,
  } = useQuery({
    queryKey: [
      "templates",
      debouncedPage,
      debouncedSize,
      debouncedSortDetails.order,
      debouncedSortDetails.sortKey,
      debouncedSearchTerm,
    ],
    queryFn: () =>
      api.findPaginated({
        page: debouncedPage.toString(),
        limit: debouncedSize.toString(),
        sort: `${debouncedSortDetails.sortKey},${
          debouncedSortDetails.order ? "ASC" : "DESC"
        }`,
        search: debouncedSearchTerm,
      }),
  });

  const templates = React.useMemo(() => {
    if (!templatesResponse) return [];
    return templatesResponse.data;
  }, [templatesResponse]);

  const { mutate: deleteTemplate, isPending: isDeletionPending } = useMutation({
    mutationFn: (id?: string) => api.remove(id as string),
    onSuccess: () => {
      toast.success(
        t("templates.messages.deleteSuccess", "Template deleted successfully."),
      );
      refetchTemplates();
      templateStore.reset();
      closeDeleteTemplateDialog();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("templates.messages.deleteError", "Failed to delete template."),
      );
    },
  });

  const {
    deleteTemplateDialog,
    openDeleteTemplateDialog,
    closeDeleteTemplateDialog,
  } = useTemplateDeleteDialog({
    representation: templateStore.template?.name,
    deleteTemplate: () => deleteTemplate(templateStore.template?.id),
    isDeletionPending,
    resetTemplate: () => templateStore.reset(),
  });

  const {
    previewTemplateSheet,
    openPreviewTemplateSheet,
    closePreviewTemplateSheet,
  } = useTemplatePreviewSheet({
    template: previewTemplate,
    resetTemplate: () => setPreviewTemplate(null),
  });

  const handleCreate = () => {
    if (onCreate) {
      onCreate();
    } else {
      router.push(createRoute);
    }
  };

  const handleEdit = (entity: ResponseTemplateDto) => {
    if (onEdit) {
      onEdit(entity);
    } else {
      router.push(`${editRoutePrefix}/${entity.id}`);
    }
  };

  const context: TemplateDataTableConfig = {
    singularName: t("templates.singularName", "Template"),
    pluralName: t("templates.pluralName", "Templates"),
    createCallback: handleCreate,
    updateCallback: handleEdit,
    deleteCallback: openDeleteTemplateDialog,
    additionalActions: {
      1: [
        {
          actionCallback: (entity: ResponseTemplateDto) => {
            setPreviewTemplate(entity);
            openPreviewTemplateSheet();
          },
          actionLabel: t("templates.actions.preview", "Preview"),
          actionIcon: <Eye className="h-4 w-4" />,
          isActionVisible: () => true,
        },
      ],
    },
    searchTerm,
    setSearchTerm,
    page,
    totalPageCount: templatesResponse?.meta?.pageCount || 0,
    setPage,
    size,
    setSize,
    order: sortDetails.order,
    sortKey: sortDetails.sortKey,
    setSortDetails: (order: boolean, sortKey: string) =>
      setSortDetails({ order, sortKey }),
    targetEntity: (template: ResponseTemplateDto) => {
      templateStore.setNested("template", template);
      templateStore.set<UpdateTemplateDto>("templateUpdateDto", {
        name: template.name,
        content: template.content,
      });
    },
  };

  const isPending =
    isTemplatesPending || paging || resizing || searching || sorting;

  return (
    <div className={cn("flex flex-col flex-1 overflow-hidden", className)}>
      <TemplatesTable
        className="flex flex-col flex-1 overflow-hidden p-1"
        containerClassName="overflow-auto"
        data={templates}
        context={context}
        isPending={Boolean(isPending)}
      />
      {deleteTemplateDialog}
      {previewTemplateSheet}
    </div>
  );
};
