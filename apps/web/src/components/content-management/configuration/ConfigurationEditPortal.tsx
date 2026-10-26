import React from "react";
import { useRouter } from "next/router";
import { Button, Input, Label, cn } from "@softsurgery/ui";
import {
  useBreadcrumb,
  useFooter,
  useIntro,
  useUI,
} from "@softsurgery/contexts";
import { useConfigurations } from "@/hooks/content/configuration/useConfigurations";
import { useConfigStore } from "@/hooks/stores/userConfigStore";
import _ from "lodash";
import { ConfigurationInput } from "./ConfigurationInput";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ArrowLeft, Loader2, RotateCcw, Save, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImportExportActions } from "../ImportExportActions";
import {
  applyConfigurationImport,
  buildConfigurationExport,
  downloadConfigurationExport,
  parseConfigurationImportFile,
} from "./configurationTransfer";

interface ConfigurationEditPortalProps {
  id: string;
  className?: string;
}

export function ConfigurationEditPortal({
  id,
  className,
}: ConfigurationEditPortalProps) {
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
  const { configurations, isConfigurationsPending, refetchConfigurations } =
    useConfigurations();
  const originalValuesRef = React.useRef<{ id: number; value: string }[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  const namespace = React.useMemo(() => {
    if (!configurations) return null;
    return configurations.find((n) => n.id === id || n.name === id) ?? null;
  }, [configurations, id]);

  React.useEffect(() => {
    if (namespace) {
      const namespaceParams = namespace.params || [];
      const initialUpdateDtos = namespaceParams.map((param) => ({
        id: param.id,
        value: param.value || "",
      }));

      originalValuesRef.current = initialUpdateDtos;
      useConfigStore.getState().set("updateDtos", initialUpdateDtos);
    }
  }, [namespace]);

  React.useEffect(() => {
    return () => {
      useConfigStore.getState().reset();
    };
  }, []);

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
      loading: t("configuration.actions.saving", "Saving..."),
      success: t(
        "configuration.messages.updateSuccess",
        "Configuration updated successfully",
      ),
      error: (error) =>
        error.response?.data?.message ||
        error.message ||
        t(
          "configuration.messages.updateError",
          "Failed to update configuration",
        ),
    });
  }, [t, updateConfigs]);

  const handleReset = React.useCallback(() => {
    useConfigStore.getState().set("updateDtos", [...originalValuesRef.current]);
    toast.info(
      t(
        "configuration.messages.resetSuccess",
        "Configuration reset to original values",
      ),
    );
  }, [t]);

  const handleExport = React.useCallback(() => {
    if (!namespace) return;
    const payload = buildConfigurationExport(
      [namespace],
      useConfigStore.getState().updateDtos,
    );
    downloadConfigurationExport(payload);
    toast.success(
      t("configuration.messages.exportSuccess", "Configuration exported"),
    );
  }, [namespace, t]);

  const handleImport = React.useCallback(
    async (file: File) => {
      if (!namespace) return;

      try {
        const raw = await file.text();
        const importedNamespaces = parseConfigurationImportFile(raw);
        const result = applyConfigurationImport(
          [namespace],
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
            : t(
                "configuration.messages.importError",
                "Failed to import configuration",
              ),
        );
      }
    },
    [namespace, t],
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
    const titleName = namespace?.name
      ? _.startCase(namespace.name)
      : "Configuration";
    setRoutes?.([
      {
        title: t(
          "configuration.breadcrumbs.contentManagement",
          "Content Management",
        ),
        href: "/content-management",
      },
      {
        title: t("configuration.breadcrumbs.configuration", "Configuration"),
        href: "/content-management/configuration",
      },
      {
        title: titleName,
        href: `/content-management/configuration/${id}`,
      },
    ]);

    setIntro?.(
      titleName,
      namespace?.description || "Configure and manage runtime parameters.",
    );

    return () => {
      clearRoutes?.();
      clearIntro?.();
    };
  }, [clearIntro, clearRoutes, id, namespace, setIntro, setRoutes, t]);

  React.useEffect(() => {
    if (!namespace) {
      clearFloating?.();
      return;
    }

    setFloating?.(
      <ImportExportActions
        exportLabel={t("configuration.actions.export", "Export")}
        importLabel={t("configuration.actions.import", "Import")}
        disabled={isSaving || !namespace}
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
    namespace,
    setFloating,
    t,
  ]);

  React.useEffect(() => {
    if (!namespace) {
      clearContent?.();
      return;
    }

    setContent?.(
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/content-management/configuration")}
          disabled={isSaving}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Configurations
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleReset}
          disabled={isSaving}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          {t("configuration.actions.resetAll", "Reset All")}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-1" />
          {t("configuration.actions.saveChanges", "Save Changes")}
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
    namespace,
    router,
    setContent,
    t,
  ]);

  const selectedParams = React.useMemo(() => {
    const params = namespace?.params ?? [];
    if (!searchQuery) return params;

    return params.filter((param) =>
      param.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [namespace, searchQuery]);

  const groupedParams = React.useMemo(
    () => _.groupBy(selectedParams, (param) => param.name?.split(".")[0]),
    [selectedParams],
  );

  if (isConfigurationsPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">
          {t(
            "configuration.loading.configurations",
            "Loading configuration...",
          )}
        </span>
      </div>
    );
  }

  if (!namespace) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-sm text-muted-foreground">
          Configuration namespace not found.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/content-management/configuration")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Configurations
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-4 flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12",
        className,
      )}
    >
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground capitalize">
            {_.startCase(namespace.name)}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {namespace.description ||
              `Configuration properties for ${namespace.name}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/content-management/configuration")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Configurations
          </Button>
          <ImportExportActions
            exportLabel={t("configuration.actions.export", "Export")}
            importLabel={t("configuration.actions.import", "Import")}
            disabled={isSaving}
            onExport={handleExport}
            onImport={handleImport}
          />
        </div>
      </header>

      <main className="flex-1 w-full space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search params in this namespace..."
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
                    {_.startCase(groupKey)}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    ({params.length})
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
      </main>
    </div>
  );
}
