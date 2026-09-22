import React from "react";
import { Button } from "@instanct/ui";
import { useBreadcrumb, useFooter, useIntro, useUI } from "@instanct/contexts";
import { useConfigurations } from "@/hooks/content/configuration/useConfigurations";
import { useConfigStore } from "@/hooks/stores/userConfigStore";
import { cn } from "@/lib/utils";
import _ from "lodash";
import { ConfigurationInput } from "./ConfigurationInput";
import { Label } from "@instanct/ui";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api";
import {
  Download,
  Loader2,
  RotateCcw,
  Save,
  Search,
  Settings,
  Upload,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@instanct/ui";
import { SideNav, SideNavItem } from "@instanct/components";
import {
  applyConfigurationImport,
  buildConfigurationExport,
  downloadConfigurationExport,
  parseConfigurationImportFile,
} from "./configurationTransfer";
interface ConfigurationPortalProps {
  className?: string;
}

export const ConfigurationPortal = ({
  className,
}: ConfigurationPortalProps) => {
  const { t } = useTranslation("content-management");
  const { setIntro, clearIntro, clearFloating } = useIntro();
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { setContent, clearContent } = useFooter();
  const { setEnableMainOverflow, clearEnableMainOverflow } = useUI();
  const { configurations, isConfigurationsPending, refetchConfigurations } =
    useConfigurations();
  const configStore = useConfigStore();

  const originalValuesRef = React.useRef<{ id: number; value: string }[]>([]);
  const importInputRef = React.useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedNamespaceId, setSelectedNamespaceId] = React.useState<
    string | null
  >(null);

  const namespaces = React.useMemo(
    () => configurations ?? [],
    [configurations],
  );
  const activeNamespaceId = selectedNamespaceId ?? namespaces[0]?.id ?? null;
  const selectedNamespace =
    namespaces.find((namespace) => namespace.id === activeNamespaceId) ?? null;

  React.useEffect(() => {
    if (configurations && configStore.updateDtos.length === 0) {
      const allParams = configurations.flatMap(
        (namespace) => namespace.params || [],
      );

      const initialUpdateDtos = allParams.map((param) => ({
        id: param.id,
        value: param.value || "",
      }));

      originalValuesRef.current = initialUpdateDtos;
      configStore.set("updateDtos", initialUpdateDtos);
    }
  }, [configurations, configStore]);

  const { mutateAsync: updateConfigs, isPending: isSaving } = useMutation({
    mutationFn: async (data: { id: number; value: string }[]) => {
      return api.admin.configuration.update(data);
    },
    onSuccess: () => {
      refetchConfigurations();
    },
  });

  const handleSave = React.useCallback(() => {
    const latestUpdateDtos = useConfigStore.getState().updateDtos;
    toast.promise(updateConfigs(latestUpdateDtos), {
      loading: t("configuration.actions.saving"),
      success: t("configuration.messages.updateSuccess"),
      error: (error) =>
        error.response?.data?.message ||
        error.message ||
        t("configuration.messages.updateError"),
    });
  }, [t, updateConfigs]);

  const handleReset = React.useCallback(() => {
    configStore.set("updateDtos", [...originalValuesRef.current]);
    toast.info(t("configuration.messages.resetSuccess"));
  }, [configStore, t]);

  const handleExport = React.useCallback(() => {
    if (!namespaces.length) return;
    const payload = buildConfigurationExport(
      namespaces,
      useConfigStore.getState().updateDtos,
    );
    downloadConfigurationExport(payload);
    toast.success(t("configuration.messages.exportSuccess"));
  }, [namespaces, t]);

  const handleImportClick = React.useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleImportFile = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file || !namespaces.length) return;

      try {
        const raw = await file.text();
        const importedNamespaces = parseConfigurationImportFile(raw);
        const result = applyConfigurationImport(
          namespaces,
          importedNamespaces,
          useConfigStore.getState().updateDtos,
        );
        configStore.set("updateDtos", result.updateDtos);
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
            : t("configuration.messages.importError"),
        );
      }
    },
    [configStore, namespaces, t],
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
        title: t("configuration.breadcrumbs.contentManagement"),
        href: "/content-management",
      },
      {
        title: t("configuration.breadcrumbs.configuration"),
        href: "/content-management/configuration",
      },
    ]);

    setIntro?.(
      t("configuration.page.title"),
      t("configuration.page.description"),
    );

    return () => {
      clearRoutes?.();
      clearIntro?.();
      clearFloating?.();
    };
  }, [clearFloating, clearIntro, clearRoutes, setIntro, setRoutes, t]);

  React.useEffect(() => {
    if (!selectedNamespace) {
      clearContent?.();
      return;
    }

    setContent?.(
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isSaving}
        >
          <Download />
          {t("configuration.actions.export")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleImportClick}
          disabled={isSaving}
        >
          <Upload />
          {t("configuration.actions.import")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isSaving}
        >
          <RotateCcw />
          {t("configuration.actions.resetAll")}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save />
          {t("configuration.actions.saveChanges")}
        </Button>
      </div>,
    );

    return () => {
      clearContent?.();
    };
  }, [
    clearContent,
    handleExport,
    handleImportClick,
    handleReset,
    handleSave,
    isSaving,
    selectedNamespace,
    setContent,
    t,
  ]);

  const sideNavItems: SideNavItem[] = React.useMemo(
    () =>
      namespaces.map((namespace) => ({
        href: namespace.id,
        title: _.capitalize(namespace.name),
        icon: <Settings className="h-4 w-4" />,
        description: namespace.description,
      })),
    [namespaces],
  );

  const selectedParams = React.useMemo(() => {
    const params = selectedNamespace?.params ?? [];
    if (!searchQuery) return params;

    return params.filter((param) =>
      param.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [selectedNamespace, searchQuery]);

  const groupedParams = React.useMemo(
    () => _.groupBy(selectedParams, (param) => param.name?.split(".")[0]),
    [selectedParams],
  );

  if (isConfigurationsPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">
          {t("configuration.loading.configurations")}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col lg:flex-row gap-6 w-full h-auto", className)}
    >
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />
      <aside className="w-full lg:w-72 shrink-0 space-y-3">
        <SideNav
          items={sideNavItems}
          activeHref={selectedNamespace?.id}
          onSelect={(item) => setSelectedNamespaceId(item.href)}
        />
      </aside>

      <main className="flex-1 w-full space-y-6">
        {selectedNamespace ? (
          <div className="flex flex-col space-y-6">
            <header className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {_.capitalize(selectedNamespace.name)}
                </h2>
                {selectedNamespace.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedNamespace.description}
                  </p>
                )}
              </div>
            </header>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search params..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {selectedParams.length ? (
              <div className="flex flex-col gap-8">
                {Object.entries(groupedParams).map(([groupKey, params]) => (
                  <section key={groupKey} className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <h3 className="text-sm font-semibold capitalize tracking-tight">
                        {groupKey}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {t("configuration.groups.count", {
                          count: params.length,
                        })}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {params
                        .sort((a, b) => a.variant.localeCompare(b.variant))
                        .map((param) => (
                          <div
                            key={param.id}
                            className="flex flex-col gap-3 lg:flex-row lg:items-start"
                          >
                            <div className="lg:w-1/4">
                              <Label className="text-sm font-bold">
                                {_.startCase(
                                  param.name?.includes(".")
                                    ? param.name.split(".").slice(1).join(" ")
                                    : param.name,
                                )}
                              </Label>
                              {param.description && (
                                <p className="text-xs text-muted-foreground">
                                  {param.description}
                                </p>
                              )}
                            </div>
                            <div className="lg:w-3/4">
                              <ConfigurationInput configurationParam={param} />
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground w-full text-center py-6">
                {searchQuery
                  ? "No configuration params match your search"
                  : "No configuration params in this namespace"}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              No configuration namespaces available
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
