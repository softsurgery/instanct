import React from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";
import { useBreadcrumb, useFooter, useIntro, useUI } from "@instanct/contexts";
import { FormBuilder } from "@instanct/form-builder";
import { Button, cn } from "@instanct/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RotateCcw, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ResponseContentPageDto,
  ServerErrorResponse,
  UpdateContentPageDto,
} from "@/types";
import { useContentPageStore } from "@/hooks/stores/useContentPageStore";
import { ImportExportActions } from "../ImportExportActions";
import { useContentPageFormStructure } from "./useContentPageFormStructure";
import {
  buildContentPageExport,
  downloadContentPageExport,
  parseContentPageImportFile,
} from "./contentPageTransfer";
import { Spinner } from "@instanct/components";

interface ContentPageEditPortalProps {
  id: string;
  className?: string;
}

export function ContentPageEditPortal({
  id,
  className,
}: ContentPageEditPortalProps) {
  const router = useRouter();
  const { t } = useTranslation("content-management");
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { setIntro, clearIntro, setFloating, clearFloating } = useIntro();
  const { setContent, clearContent } = useFooter();
  const {
    setEnableMainOverflow,
    clearEnableMainOverflow,
    setEnableContainer,
    clearEnableContainer,
  } = useUI();
  const contentPageStore = useContentPageStore();
  const { contentPageFormStructure } = useContentPageFormStructure({
    contentPageStore,
  });

  const {
    data: pageData,
    isLoading: isPageLoading,
    refetch: refetchPage,
  } = useQuery({
    queryKey: ["content-page", id],
    queryFn: () => api.admin.contentPage.findById(id),
    enabled: Boolean(id),
  });

  const hydrateFromPage = React.useCallback((page: ResponseContentPageDto) => {
    const { set } = useContentPageStore.getState();
    set("response", page);
    set<UpdateContentPageDto>("updateDto", {
      title: page.title,
      subtitle: page.subtitle ?? "",
      body: page.body,
      locale: page.locale,
    });
    set("updateDtoErrors", {});
  }, []);

  React.useEffect(() => {
    if (pageData) {
      hydrateFromPage(pageData);
    }
  }, [hydrateFromPage, pageData]);

  React.useEffect(() => {
    return () => {
      useContentPageStore.getState().reset();
    };
  }, []);

  const handleReset = React.useCallback(() => {
    if (!pageData) return;
    hydrateFromPage(pageData);
    toast.info("Reset to original page values");
  }, [hydrateFromPage, pageData]);

  const { mutateAsync: updatePageAsync, isPending: isSaving } = useMutation({
    mutationFn: (data: { id: string; payload: UpdateContentPageDto }) =>
      api.admin.contentPage.update(data.id, data.payload),
    onSuccess: () => {
      refetchPage();
      toast.success(
        t("pages.messages.updateSuccess", "Content page updated successfully."),
      );
    },
    onError: (error: unknown) => {
      const err = error as ServerErrorResponse;
      toast.error(
        err.response?.data?.message ||
          t("pages.messages.updateError", "Failed to update page."),
      );
    },
  });

  const handleSave = React.useCallback(async () => {
    if (!pageData) return;

    try {
      await updatePageAsync({
        id: pageData.id,
        payload: useContentPageStore.getState().updateDto,
      });
    } catch {
      // handled in onError
    }
  }, [pageData, updatePageAsync]);

  const handleExport = React.useCallback(() => {
    if (!pageData) return;
    const payload = buildContentPageExport(
      pageData.slug,
      useContentPageStore.getState().updateDto,
    );
    downloadContentPageExport(payload);
    toast.success(t("pages.messages.exportSuccess", "Page exported"));
  }, [pageData, t]);

  const handleImport = React.useCallback(
    async (file: File) => {
      if (!pageData) return;

      try {
        const raw = await file.text();
        const page = parseContentPageImportFile(raw);
        useContentPageStore.getState().set<UpdateContentPageDto>("updateDto", {
          title: page.title,
          subtitle: page.subtitle,
          body: page.body,
          locale: page.locale,
        });
        toast.success(
          t("pages.messages.importSuccess", "Page content imported"),
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t("pages.messages.importError", "Failed to import page"),
        );
      }
    },
    [pageData, t],
  );

  React.useEffect(() => {
    setEnableMainOverflow?.(true);
    setEnableContainer?.(true);
    return () => {
      clearEnableMainOverflow?.();
      clearEnableContainer?.();
    };
  }, [
    clearEnableContainer,
    clearEnableMainOverflow,
    setEnableContainer,
    setEnableMainOverflow,
  ]);

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
      {
        title:
          pageData?.title || t("pages.editPage.title", "Edit Content Page"),
        href: `/content-management/pages/${id}`,
      },
    ]);
    setIntro?.(
      pageData
        ? `Edit: ${pageData.title}`
        : t("pages.editPage.title", "Edit Content Page"),
      pageData
        ? `Editing page details for /${pageData.slug} (${pageData.locale.toUpperCase()})`
        : "",
    );
    return () => {
      clearRoutes?.();
      clearIntro?.();
    };
  }, [clearIntro, clearRoutes, id, pageData, setIntro, setRoutes, t]);

  React.useEffect(() => {
    if (!pageData) {
      clearFloating?.();
      return;
    }

    setFloating?.(
      <ImportExportActions
        exportLabel={t("pages.actions.export", "Export")}
        importLabel={t("pages.actions.import", "Import")}
        disabled={isSaving || !pageData}
        onExport={handleExport}
        onImport={handleImport}
      />,
    );

    return () => {
      clearFloating?.();
    };
  }, [
    clearFloating,
    handleExport,
    handleImport,
    isSaving,
    pageData,
    setFloating,
    t,
  ]);

  React.useEffect(() => {
    if (!pageData) {
      clearContent?.();
      return;
    }

    setContent?.(
      <div className="flex items-center gap-2 sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleReset}
          disabled={isSaving}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>,
    );

    return () => {
      clearContent?.();
    };
  }, [
    clearContent,
    handleReset,
    handleSave,
    isSaving,
    pageData,
    router,
    setContent,
    t,
  ]);

  if (isPageLoading) return <Spinner />;

  return (
    <div className={cn("mt-4 flex flex-col gap-6 w-full", className)}>
      <FormBuilder structure={contentPageFormStructure} />
    </div>
  );
}
