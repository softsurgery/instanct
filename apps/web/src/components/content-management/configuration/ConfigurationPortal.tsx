import React from "react";
import { useRouter } from "next/router";
import { useBreadcrumb, useIntro } from "@instanct/contexts";
import { useConfigurations } from "@/hooks/content/configuration/useConfigurations";
import { cn } from "@/lib/utils";
import { DataTable, DataTableConfig } from "@instanct/datatable-builder";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Download } from "lucide-react";
import {
  ResponseConfigurationNamespaceDto,
  ServerErrorResponse,
} from "@/types";
import { useConfigurationColumns } from "./useConfigurationColumns";
import { useConfigurationDeleteDialog } from "./ConfigurationDeleteDialog";
import { ImportExportActions } from "../ImportExportActions";
import {
  buildConfigurationExport,
  downloadConfigurationExport,
  parseConfigurationImportFile,
  applyConfigurationImport,
} from "./configurationTransfer";
import { useConfigStore } from "@/hooks/stores/userConfigStore";

interface ConfigurationPortalProps {
  className?: string;
}

export const ConfigurationPortal = ({
  className,
}: ConfigurationPortalProps) => {
  const router = useRouter();
  const { t, ready } = useTranslation("content-management");
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { setIntro, clearIntro, setFloating, clearFloating } = useIntro();
  const { configurations, isConfigurationsPending, refetchConfigurations } =
    useConfigurations();


  const [selectedNamespaceForDelete, setSelectedNamespaceForDelete] =
    React.useState<ResponseConfigurationNamespaceDto | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(10);
  const [sortDetails, setSortDetails] = React.useState({
    order: true,
    sortKey: "name",
  });

  React.useEffect(() => {
    setRoutes?.([
      {
        title: t("configuration.breadcrumbs.contentManagement", "Content Management"),
        href: "/content-management",
      },
      {
        title: t("configuration.breadcrumbs.configuration", "Configuration"),
        href: "/content-management/configuration",
      },
    ]);

    setIntro?.(
      t("configuration.page.title", "Configuration"),
      t(
        "configuration.page.description",
        "Manage and configure application properties in a structured format",
      ),
    );

    return () => {
      clearRoutes?.();
      clearIntro?.();
    };
  }, [clearIntro, clearRoutes, ready, setIntro, setRoutes, t]);

  const handleExportAll = React.useCallback(() => {
    if (!configurations || configurations.length === 0) return;
    const payload = buildConfigurationExport(
      configurations,
      useConfigStore.getState().updateDtos,
    );
    downloadConfigurationExport(payload);
    toast.success(t("configuration.messages.exportSuccess", "Configuration exported"));
  }, [configurations, t]);

  const handleImport = React.useCallback(
    async (file: File) => {
      if (!configurations || configurations.length === 0) return;

      try {
        const raw = await file.text();
        const importedNamespaces = parseConfigurationImportFile(raw);
        const result = applyConfigurationImport(
          configurations,
          importedNamespaces,
          useConfigStore.getState().updateDtos,
        );
        useConfigStore.getState().set("updateDtos", result.updateDtos);
        toast.success(
          t("configuration.messages.importSuccess", {
            count: result.applied,
          }),
        );
        if (result.skipped > 0) {
          toast.info(
            t("configuration.messages.importSkipped", {
              count: result.skipped,
            }),
          );
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t("configuration.messages.importError", "Failed to import configuration"),
        );
      }
    },
    [configurations, t],
  );

  React.useEffect(() => {
    setFloating?.(
      <ImportExportActions
        exportLabel={t("configuration.actions.export", "Export All")}
        importLabel={t("configuration.actions.import", "Import")}
        disabled={isConfigurationsPending || !configurations?.length}
        onExport={handleExportAll}
        onImport={handleImport}
      />,
    );

    return () => {
      clearFloating?.();
    };
  }, [clearFloating, configurations, handleExportAll, handleImport, isConfigurationsPending, setFloating, t]);

  const { mutate: deleteNamespace, isPending: isDeletionPending } = useMutation({
    mutationFn: (id: string) => api.admin.configuration.deleteNamespace(id),
    onSuccess: () => {
      toast.success(
        t("configuration.messages.deleteSuccess", "Configuration deleted successfully."),
      );
      refetchConfigurations();
      setSelectedNamespaceForDelete(null);
      closeDeleteConfigurationDialog();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message ||
          t("configuration.messages.deleteError", "Failed to delete configuration."),
      );
    },
  });

  const {
    deleteConfigurationDialog,
    openDeleteConfigurationDialog,
    closeDeleteConfigurationDialog,
  } = useConfigurationDeleteDialog({
    representation: selectedNamespaceForDelete?.name,
    deleteConfiguration: () => {
      if (selectedNamespaceForDelete?.id) {
        deleteNamespace(selectedNamespaceForDelete.id);
      }
    },
    isDeletionPending,
    resetConfiguration: () => setSelectedNamespaceForDelete(null),
  });

  // Filtered and sorted namespaces
  const filteredNamespaces = React.useMemo(() => {
    if (!configurations) return [];
    let list = [...configurations];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (n) =>
          n.name?.toLowerCase().includes(q) ||
          n.description?.toLowerCase().includes(q) ||
          n.params?.some(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.value?.toLowerCase().includes(q),
          ),
      );
    }
    list.sort((a, b) => {
      const fieldA = (a[sortDetails.sortKey as keyof ResponseConfigurationNamespaceDto] || "").toString();
      const fieldB = (b[sortDetails.sortKey as keyof ResponseConfigurationNamespaceDto] || "").toString();
      return sortDetails.order ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    });
    return list;
  }, [configurations, searchTerm, sortDetails]);

  // Paginated namespaces
  const paginatedNamespaces = React.useMemo(() => {
    const start = (page - 1) * size;
    return filteredNamespaces.slice(start, start + size);
  }, [filteredNamespaces, page, size]);

  const totalNamespacePages = Math.ceil(filteredNamespaces.length / size) || 1;


  // Namespace Table Context
  const namespaceContext: DataTableConfig<ResponseConfigurationNamespaceDto> = {
    singularName: t("configuration.singularName", "Configuration"),
    pluralName: t("configuration.pluralName", "Configurations"),
    createCallback: () => router.push("/content-management/configuration/create"),
    updateCallback: (entity: ResponseConfigurationNamespaceDto) =>
      router.push(`/content-management/configuration/${entity.id}`),
    deleteCallback: (entity: ResponseConfigurationNamespaceDto) => {
      setSelectedNamespaceForDelete(entity);
      openDeleteConfigurationDialog();
    },
    additionalActions: {
      1: [
        {
          actionCallback: (entity: ResponseConfigurationNamespaceDto) => {
            const payload = buildConfigurationExport(
              [entity],
              useConfigStore.getState().updateDtos,
            );
            downloadConfigurationExport(payload);
            toast.success(`Exported ${entity.name} configuration`);
          },
          actionLabel: "Export",
          actionIcon: <Download className="h-4 w-4" />,
          isActionVisible: () => true,
        },
      ],
    },
    searchTerm,
    setSearchTerm: (term) => {
      setSearchTerm(term);
      setPage(1);
    },
    page,
    totalPageCount: totalNamespacePages,
    setPage,
    size,
    setSize,
    order: sortDetails.order,
    sortKey: sortDetails.sortKey,
    setSortDetails: (order: boolean, sortKey: string) =>
      setSortDetails({ order, sortKey }),
  };

  const namespaceColumns = useConfigurationColumns(namespaceContext);

  return (
    <div className={cn("flex flex-col flex-1 overflow-hidden", className)}>
      <DataTable
        className="flex flex-col flex-1 overflow-hidden p-1"
        containerClassName="overflow-auto"
        columns={namespaceColumns}
        data={paginatedNamespaces}
        context={namespaceContext}
        isPending={isConfigurationsPending}
      />

      {deleteConfigurationDialog}
    </div>
  );
};
