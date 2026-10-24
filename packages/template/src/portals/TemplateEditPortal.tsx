import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useBreadcrumb, useIntro } from "@softsurgery/contexts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, Skeleton } from "@softsurgery/ui";
import { AlertCircle, ArrowLeft } from "lucide-react";
import {
  TemplateEditor,
  type UpdateTemplateDto,
  type TemplateEditPortalProps,
} from "../index";

export const TemplateEditPortal = ({
  id,
  api,
  backRoute = "/content-management/templates",
  onSuccess,
  onCancel,
}: TemplateEditPortalProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, ready } = useTranslation("content-management");
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { setIntro, clearIntro } = useIntro();

  const {
    data: template,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["template", id],
    queryFn: () => api.findById(id),
    enabled: Boolean(id),
  });

  React.useEffect(() => {
    if (template) {
      setRoutes?.([
        {
          title: t("pages.breadcrumbs.contentManagement", "Content Management"),
          href: "/content-management",
        },
        {
          title: t("templates.page.title", "Templates"),
          href: backRoute,
        },
        {
          title: `${t("templates.editPage.title", "Edit Template")}: ${template.name}`,
          href: `${backRoute}/${template.id}`,
        },
      ]);
      setIntro?.(
        `${t("templates.editPage.title", "Edit Template")}: ${template.name}`,
        t(
          "templates.editPage.description",
          "Modify template content and preview the rendered output in real time.",
        ),
      );
    }
    return () => {
      clearRoutes?.();
      clearIntro?.();
    };
  }, [
    t,
    ready,
    template,
    setRoutes,
    clearRoutes,
    setIntro,
    clearIntro,
    backRoute,
  ]);

  const { mutate: updateTemplate, isPending } = useMutation({
    mutationFn: (data: UpdateTemplateDto) => api.update(id, data),
    onSuccess: (res) => {
      toast.success(
        t("templates.messages.updateSuccess", "Template updated successfully."),
      );
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["template", id] });
      if (onSuccess) {
        onSuccess(res);
      } else {
        router.push(backRoute);
      }
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          t("templates.messages.updateError", "Failed to update template."),
      );
    },
  });

  const handleSave = (data: { name: string; content: string }) => {
    updateTemplate({
      name: data.name,
      content: data.content,
    });
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push(backRoute);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 h-full p-6 gap-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-6 w-48 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
          <Skeleton className="h-full w-full rounded-xl" />
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !template) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {t("templates.editPage.notFound", "Template not found")}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {(error as any)?.response?.data?.message ||
            (error as any)?.message ||
            t(
              "templates.messages.loadError",
              "Could not load the requested template details.",
            )}
        </p>
        <Button variant="outline" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("templates.editor.backToTemplates", "Back to Templates")}
        </Button>
      </div>
    );
  }

  return (
    <TemplateEditor
      mode="edit"
      templateId={template.id}
      initialName={template.name}
      initialContent={template.content}
      title={`${t("templates.editPage.title", "Edit Template")}: ${template.name}`}
      description={t(
        "templates.editPage.description",
        "Modify template content and preview the rendered output in real time.",
      )}
      isPending={isPending}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};
