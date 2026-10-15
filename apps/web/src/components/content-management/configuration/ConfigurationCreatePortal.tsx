import React from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";
import { useBreadcrumb, useFooter, useIntro, useUI } from "@softsurgery/contexts";
import { Button, Input, Label, Textarea, cn } from "@softsurgery/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ServerErrorResponse } from "@/types";

interface ConfigurationCreatePortalProps {
  className?: string;
}

export function ConfigurationCreatePortal({ className }: ConfigurationCreatePortalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation("content-management");
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { setIntro, clearIntro } = useIntro();
  const { setContent, clearContent } = useFooter();
  const {
    setEnableMainOverflow,
    clearEnableMainOverflow,
    setEnableContainer,
    clearEnableContainer,
  } = useUI();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

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
        title: t("configuration.breadcrumbs.contentManagement", "Content Management"),
        href: "/content-management",
      },
      {
        title: t("configuration.breadcrumbs.configuration", "Configuration"),
        href: "/content-management/configuration",
      },
      {
        title: t("configuration.createPage.title", "Create Configuration"),
        href: "/content-management/configuration/create",
      },
    ]);
    setIntro?.(
      t("configuration.createPage.title", "Create Configuration"),
      t(
        "configuration.createPage.description",
        "Define a new configuration namespace to manage custom application parameters.",
      ),
    );
    return () => {
      clearRoutes?.();
      clearIntro?.();
    };
  }, [clearIntro, clearRoutes, setIntro, setRoutes, t]);

  const { mutateAsync: createNamespaceAsync, isPending: isSaving } = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.admin.configuration.createNamespace(data),
    onSuccess: (created) => {
      toast.success(
        t("configuration.messages.createSuccess", "Configuration created successfully."),
      );
      queryClient.invalidateQueries({ queryKey: ["configurations"] });
      if (created?.id) {
        router.push(`/content-management/configuration/${created.id}`);
      } else {
        router.push("/content-management/configuration");
      }
    },
    onError: (error: unknown) => {
      const err = error as ServerErrorResponse;
      toast.error(
        err.response?.data?.message ||
          t("configuration.messages.createError", "Failed to create configuration."),
      );
    },
  });

  const handleSave = React.useCallback(async () => {
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "");
    if (!cleanName) {
      toast.error("Namespace name is required.");
      return;
    }

    try {
      await createNamespaceAsync({
        name: cleanName,
        description: description.trim() || undefined,
      });
    } catch {
      // handled in onError
    }
  }, [createNamespaceAsync, description, name]);

  React.useEffect(() => {
    setContent?.(
      <div className="flex items-center gap-2 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/content-management/configuration")}
          disabled={isSaving}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("actions.cancel", "Cancel")}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-1" />
          {t("actions.save", "Create Configuration")}
        </Button>
      </div>,
    );

    return () => {
      clearContent?.();
    };
  }, [clearContent, handleSave, isSaving, router, setContent, t]);

  return (
    <div className={cn("mt-4 flex flex-col gap-6 w-full max-w-2xl mx-auto pb-12", className)}>
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t("configuration.createPage.title", "Create Configuration")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define a new configuration namespace
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/content-management/configuration")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Configurations
        </Button>
      </header>

      <div className="space-y-6 bg-card border rounded-lg p-6">
        <div className="space-y-2">
          <Label htmlFor="namespace-name" className="text-sm font-semibold">
            Namespace Identifier
          </Label>
          <Input
            id="namespace-name"
            placeholder="e.g. notifications, billing, analytics"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Lowercase technical identifier without spaces (e.g. map, core, application).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="namespace-description" className="text-sm font-semibold">
            Description
          </Label>
          <Textarea
            id="namespace-description"
            placeholder="Describe what settings and parameters this namespace manages..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-24"
          />
        </div>
      </div>
    </div>
  );
}
