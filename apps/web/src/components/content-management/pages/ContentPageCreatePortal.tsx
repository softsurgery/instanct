import React from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";
import { useBreadcrumb, useFooter, useIntro, useUI } from "@instanct/contexts";
import { FormBuilder } from "@instanct/form-builder";
import { Button, cn } from "@instanct/ui";
import { useMutation } from "@tanstack/react-query";
import { RotateCcw, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CreateContentPageDto, ServerErrorResponse } from "@/types";
import { useContentPageStore } from "@/hooks/stores/useContentPageStore";
import { useContentPageFormStructure } from "./useContentPageFormStructure";

interface ContentPageCreatePortalProps {
  className?: string;
}

export function ContentPageCreatePortal({
  className,
}: ContentPageCreatePortalProps) {
  const router = useRouter();
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
  const contentPageStore = useContentPageStore();
  const { contentPageFormStructure } = useContentPageFormStructure({
    contentPageStore,
    mode: "create",
  });

  React.useEffect(() => {
    contentPageStore.reset();
    return () => {
      useContentPageStore.getState().reset();
    };
  }, []);

  const handleReset = React.useCallback(() => {
    contentPageStore.reset();
    toast.info("Reset form values");
  }, [contentPageStore]);

  const { mutateAsync: createPageAsync, isPending: isSaving } = useMutation({
    mutationFn: (payload: CreateContentPageDto) =>
      api.admin.contentPage.create(payload),
    onSuccess: (created) => {
      toast.success(
        t("pages.messages.createSuccess", "Content page created successfully."),
      );
      router.push(`/content-management/pages/${created.id}`);
    },
    onError: (error: unknown) => {
      const err = error as ServerErrorResponse;
      toast.error(
        err.response?.data?.message ||
          t("pages.messages.createError", "Failed to create content page."),
      );
    },
  });

  const handleSave = React.useCallback(async () => {
    const data = useContentPageStore.getState().createDto;
    if (!data.title?.trim()) {
      toast.error("Page title is required.");
      return;
    }
    if (!data.slug?.trim()) {
      toast.error("Page slug is required.");
      return;
    }

    try {
      await createPageAsync({
        title: data.title.trim(),
        slug: data.slug.trim().toLowerCase().replace(/^\//, ""),
        subtitle: data.subtitle?.trim() || "",
        body: data.body || "",
        locale: data.locale || "fr",
      });
    } catch {
      // handled by onError
    }
  }, [createPageAsync]);

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
        title: t("pages.createPage.title", "Create Content Page"),
        href: "/content-management/pages/create",
      },
    ]);
    setIntro?.(
      t("pages.createPage.title", "Create Content Page"),
      t(
        "pages.createPage.description",
        "Draft and publish a new content page with title, slug and body.",
      ),
    );
    return () => {
      clearRoutes?.();
      clearIntro?.();
    };
  }, [clearIntro, clearRoutes, setIntro, setRoutes, t]);

  React.useEffect(() => {
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
  }, [clearContent, handleReset, handleSave, isSaving, setContent]);

  return (
    <div className={cn("mt-4 flex flex-col gap-6 w-full", className)}>
      <FormBuilder structure={contentPageFormStructure} />
    </div>
  );
}
