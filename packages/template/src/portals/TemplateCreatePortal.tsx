import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useBreadcrumb, useIntro } from "@instanct/contexts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  TemplateEditor,
  type CreateTemplateDto,
  type TemplateCreatePortalProps,
} from "../index";

export const TemplateCreatePortal = ({
  api,
  backRoute = "/content-management/templates",
  onSuccess,
  onCancel,
}: TemplateCreatePortalProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
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
        href: backRoute,
      },
      {
        title: t("templates.createPage.title", "Create Template"),
        href: `${backRoute}/create`,
      },
    ]);
    setIntro?.(
      t("templates.createPage.title", "Create Template"),
      t(
        "templates.createPage.description",
        "Draft a new email or document template with real-time visualizer preview.",
      ),
    );
    return () => {
      clearRoutes?.();
      clearIntro?.();
    };
  }, [t, ready, setRoutes, clearRoutes, setIntro, clearIntro, backRoute]);

  const { mutate: createTemplate, isPending } = useMutation({
    mutationFn: (data: CreateTemplateDto) => api.create(data),
    onSuccess: (res) => {
      toast.success(
        t("templates.messages.createSuccess", "Template created successfully."),
      );
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      if (onSuccess) {
        onSuccess(res);
      } else {
        router.push(backRoute);
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("templates.messages.createError", "Failed to create template."),
      );
    },
  });

  const handleSave = (data: { name: string; content: string }) => {
    createTemplate({
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

  return (
    <TemplateEditor
      mode="create"
      title={t("templates.createPage.title", "Create Template")}
      description={t(
        "templates.createPage.description",
        "Draft a new email or document template with real-time visualizer preview.",
      )}
      isPending={isPending}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};
