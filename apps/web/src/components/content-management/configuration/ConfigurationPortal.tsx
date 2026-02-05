import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { useIntro } from "@/contexts/IntroContext";
import { useConfigurations } from "@/hooks/content/configuration/useConfigurations";
import { useConfigStore } from "@/hooks/stores/userConfigStore";
import { cn } from "@/lib/utils";
import _ from "lodash";
import React from "react";
import { ConfigurationInput } from "./ConfigurationInput";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConfigurationPortalProps {
  className?: string;
}

export const ConfigurationPortal = ({
  className,
}: ConfigurationPortalProps) => {
  const { t } = useTranslation("content-management");
  const { setIntro, clearIntro, setFloating, clearFloating } = useIntro();
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { configurations, isConfigurationsPending, refetchConfigurations } =
    useConfigurations();
  const configStore = useConfigStore();

  const originalValuesRef = React.useRef<{ id: number; value: string }[]>([]);

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

  const { mutate: updateConfigs, isPending: isSaving } = useMutation({
    mutationFn: async (data: { id: number; value: string }[]) => {
      return api.admin.configuration.update(data);
    },
    onSuccess: () => {
      refetchConfigurations();
      toast.success(t("configuration.messages.updateSuccess"));
    },
    onError: (error) => {
      toast.error(error.message || t("configuration.messages.updateError"));
    },
  });

  const handleSave = () => {
    const latestUpdateDtos = useConfigStore.getState().updateDtos;
    updateConfigs(latestUpdateDtos);
  };

  const handleReset = () => {
    configStore.set("updateDtos", [...originalValuesRef.current]);
    toast.info(t("configuration.messages.resetSuccess"));
  };

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

    setFloating?.(
      <div className="flex gap-2 justify-center">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("configuration.actions.saving")}
            </>
          ) : (
            t("configuration.actions.saveChanges")
          )}
        </Button>
        <Button variant={"secondary"} onClick={handleReset} disabled={isSaving}>
          {t("configuration.actions.resetAll")}
        </Button>
      </div>,
    );

    return () => {
      clearRoutes?.();
      clearIntro?.();
      clearFloating?.();
    };
  }, []);

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
      className={cn(
        "flex flex-col flex-1 overflow-auto no-scrollbar container mx-auto p-1 mt-4",
        className,
      )}
    >
      {configurations?.map((configuration) => (
        <Card key={configuration.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary/70" />
              {_.capitalize(configuration.id)}
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {configuration.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-8 pt-0">
            {Object.entries(
              _.groupBy(
                configuration.params,
                (param) => param.name?.split(".")[0],
              ),
            ).map(([groupKey, params]) => (
              <div key={groupKey} className="rounded-md border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2">
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
                          <Label className="text-sm font-medium">
                            {_.startCase(
                              _.camelCase(param.name?.split(".")[1]),
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
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
