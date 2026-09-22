import React from "react";
import { api } from "@/lib/api";
import { useBreadcrumb, useFooter, useIntro, useUI } from "@instanct/contexts";
import { FormBuilder } from "@instanct/form-builder";
import { SideNav, SideNavItem } from "@instanct/components";
import { Button, cn } from "@instanct/ui";
import { useMutation } from "@tanstack/react-query";
import { FileText, Loader2, RotateCcw, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ResponseContentPageDto,
  ServerErrorResponse,
  UpdateContentPageDto,
} from "@/types";
import { useApplicationLanguages } from "@/hooks/content/configuration/useApplicationLanguages";
import { useContentPages } from "@/hooks/content/pages/useContentPages";
import { useContentPageStore } from "@/hooks/stores/useContentPageStore";
import { ImportExportActions } from "../ImportExportActions";
import { PageLanguageToggle } from "./PageLanguageToggle";
import { useContentPageFormStructure } from "./useContentPageFormStructure";
import {
  buildContentPageExport,
  downloadContentPageExport,
  parseContentPageImportFile,
} from "./contentPageTransfer";

interface ContentPagesPortalProps {
  className?: string;
}

export function ContentPagesPortal({ className }: ContentPagesPortalProps) {
  const { t } = useTranslation("content-management");
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { setIntro, setFloating, clearIntro, clearFloating } = useIntro();
  const { setContent, clearContent } = useFooter();
  const { setEnableMainOverflow, clearEnableMainOverflow } = useUI();
  const [selectedLocale, setSelectedLocale] = React.useState<string>("fr");
  const { contentPages, isContentPagesPending, refetchContentPages } =
    useContentPages({ enabled: true, locale: selectedLocale });
  const { languages } = useApplicationLanguages();
  const contentPageStore = useContentPageStore();
  const { contentPageFormStructure } = useContentPageFormStructure({
    contentPageStore,
  });

  const [selectedSlug, setSelectedSlug] = React.useState<string | null>(null);

  const activeSlug = selectedSlug ?? contentPages[0]?.slug ?? null;
  const selectedPage = React.useMemo(
    () => contentPages.find((page) => page.slug === activeSlug) ?? null,
    [contentPages, activeSlug],
  );

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
    if (!selectedPage) return;
    const currentResp = useContentPageStore.getState().response;
    if (
      currentResp?.slug === selectedPage.slug &&
      currentResp?.locale === selectedPage.locale
    )
      return;
    hydrateFromPage(selectedPage);
  }, [hydrateFromPage, selectedPage]);

  React.useEffect(() => {
    return () => {
      useContentPageStore.getState().reset();
    };
  }, []);

  const handleReset = React.useCallback(() => {
    if (!selectedPage) return;
    hydrateFromPage(selectedPage);
    toast.info("Form values reset");
  }, [hydrateFromPage, selectedPage]);

  const { mutate: updatePage, isPending: isSaving } = useMutation({
    mutationFn: (data: { id: string; payload: UpdateContentPageDto }) =>
      api.admin.contentPage.update(data.id, data.payload),
    onSuccess: () => {
      toast.success(t("pages.messages.updateSuccess"));
      refetchContentPages();
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message || t("pages.messages.updateError"),
      );
    },
  });

  const handleSave = React.useCallback(() => {
    if (!selectedPage) return;
    updatePage({
      id: selectedPage.id,
      payload: useContentPageStore.getState().updateDto,
    });
  }, [selectedPage, updatePage]);

  const handleExport = React.useCallback(() => {
    if (!selectedPage) return;
    const payload = buildContentPageExport(
      selectedPage.slug,
      useContentPageStore.getState().updateDto,
    );
    downloadContentPageExport(payload);
    toast.success(t("pages.messages.exportSuccess"));
  }, [selectedPage, t]);

  const handleImport = React.useCallback(
    async (file: File) => {
      if (!selectedPage) return;

      try {
        const raw = await file.text();
        const page = parseContentPageImportFile(raw);
        useContentPageStore.getState().set<UpdateContentPageDto>("updateDto", {
          title: page.title,
          subtitle: page.subtitle,
          body: page.body,
          locale: page.locale,
        });
        toast.success(t("pages.messages.importSuccess"));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t("pages.messages.importError"),
        );
      }
    },
    [selectedPage, t],
  );

  React.useEffect(() => {
    setEnableMainOverflow?.(true);
    return () => {
      clearEnableMainOverflow?.();
    };
  }, [clearEnableMainOverflow, setEnableMainOverflow]);

  React.useEffect(() => {
    setRoutes?.([
      {
        title: t("pages.breadcrumbs.contentManagement"),
        href: "/content-management",
      },
      {
        title: t("pages.breadcrumbs.pages"),
        href: "/content-management/pages",
      },
    ]);
    setIntro?.(t("pages.page.title"), t("pages.page.description"));
    return () => {
      clearRoutes?.();
      clearIntro?.();
      clearFloating?.();
    };
  }, [clearFloating, clearIntro, clearRoutes, setIntro, setRoutes, t]);

  React.useEffect(() => {
    setFloating?.(
      <ImportExportActions
        exportLabel={t("pages.actions.export")}
        importLabel={t("pages.actions.import")}
        disabled={isSaving || !selectedPage}
        onExport={handleExport}
        onImport={handleImport}
      >
        <PageLanguageToggle
          value={selectedLocale}
          onValueChange={setSelectedLocale}
          languages={languages}
        />
      </ImportExportActions>,
    );

    return () => {
      clearFloating?.();
    };
  }, [
    clearFloating,
    handleExport,
    handleImport,
    isSaving,
    languages,
    selectedLocale,
    selectedPage,
    setFloating,
    t,
  ]);

  React.useEffect(() => {
    if (!selectedPage) {
      clearContent?.();
      return;
    }

    setContent?.(
      <div className="flex items-center gap-2 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isSaving}
        >
          <RotateCcw />
          Reset
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save /> Save
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
    selectedPage,
    setContent,
    t,
  ]);

  const sideNavItems: SideNavItem[] = React.useMemo(() => {
    return contentPages.map((page: ResponseContentPageDto) => ({
      href: page.slug,
      title: page.title,
      icon: <FileText className="h-4 w-4" />,
      description: `/${page.slug}`,
    }));
  }, [contentPages]);

  const title = contentPageStore.updateDto.title;

  if (isContentPagesPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("pages.loading")}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-4 flex flex-col lg:flex-row gap-6 w-full h-auto",
        className,
      )}
    >
      {/* Sidenav component for pages navigation */}
      <aside className="w-full lg:w-72 shrink-0 space-y-3">
        <SideNav
          items={sideNavItems}
          activeHref={selectedPage?.slug}
          onSelect={(item) => {
            setSelectedSlug(item.href);
            const page = contentPages.find((p) => p.slug === item.href);
            if (page) hydrateFromPage(page);
          }}
        />
      </aside>

      {/* Main Content Form area (no Card component) */}
      <main className="flex-1 w-full space-y-6">
        {selectedPage ? (
          <div className="flex flex-col space-y-6">
            <header className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {title || selectedPage.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Editing page details for /{selectedPage.slug}
                </p>
              </div>
            </header>

            <section className="space-y-4">
              <FormBuilder structure={contentPageFormStructure} />
            </section>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">{t("pages.empty")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
