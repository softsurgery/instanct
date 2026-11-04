import React from "react";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useBreadcrumb, useFooter, useIntro, useUI } from "@softsurgery/contexts";
import { cn } from "@softsurgery/ui";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { CreateBugDto, ServerErrorResponse } from "@/types";
import { useBugReportStore } from "@/hooks/stores/useBugReportStore";
import { useUsers } from "@/hooks/content/user/useUsers";
import { FormBuilder, SelectOption } from "@softsurgery/form-builder";
import { Button } from "@softsurgery/ui";
import { useCreateBugFormStructure } from "./useCreateBugFormStructure";
import { Save } from "lucide-react";
import { createBugSchema } from "@/types/validations/bug.validation";
import { Spinner } from "@softsurgery/components";
import { identifyUser } from "@softsurgery/lib";

interface BugCreateFormProps {
  className?: string;
  createBug?: (bug: CreateBugDto) => void;
  isCreatePending?: boolean;
  onCancel?: () => void;
}

export const BugCreateForm: React.FC<BugCreateFormProps> = ({
  className,
  createBug,
  isCreatePending,
  onCancel,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");
  const { setRoutes, clearRoutes } = useBreadcrumb();
  const { setIntro, clearIntro } = useIntro();
  const { setContent, clearContent } = useFooter();
  const {
    setEnableMainOverflow,
    clearEnableMainOverflow,
    setEnableContainer,
    clearEnableContainer,
  } = useUI();
  const bugReportStore = useBugReportStore();
  const { users } = useUsers();

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
    bugReportStore.reset();
    return () => {
      useBugReportStore.getState().reset();
    };
  }, []);

  React.useEffect(() => {
    setRoutes?.([
      { title: "Audit Monitoring", href: "/audit-monitoring" },
      { title: "Bug Reports", href: "/audit-monitoring/bug-report" },
      {
        title: "Create Bug Report",
        href: "/audit-monitoring/bug-report/create",
      },
    ]);
    setIntro?.(
      "Create Bug Report",
      "Report a new bug or issue observed in the application.",
    );
    return () => {
      clearRoutes?.();
      clearIntro?.();
    };
  }, [clearIntro, clearRoutes, setIntro, setRoutes, t]);

  const { mutate: internalCreateBug, isPending: isInternalCreationPending } =
    useMutation({
      mutationFn: (createBugDto: CreateBugDto) =>
        api.admin.bugReport.create(createBugDto),
      onSuccess: () => {
        toast.success(
          t(
            "bugReport.messages.createSuccess",
            "Bug report created successfully.",
          ),
        );
        queryClient.invalidateQueries({ queryKey: ["bugs"] });
        bugReportStore.reset();
        router.push("/audit-monitoring/bug-report");
      },
      onError: (error: ServerErrorResponse) => {
        toast.error(
          error.response?.data?.message ||
            t("bugReport.messages.createError", "Failed to create bug report."),
        );
      },
    });

  const isPending = isCreatePending ?? isInternalCreationPending;

  const userOptions = React.useMemo<SelectOption[]>(() => {
    return users.map((u) => {
      const name = identifyUser(u);
      const email = u.email ? ` (${u.email})` : "";
      return {
        label: `${name}${email}`,
        value: u.id,
        user: u,
      };
    });
  }, [users]);

  const { createBugFormStructure } = useCreateBugFormStructure({
    bugReportStore,
    userOptions,
  });

  const validateForm = React.useCallback(() => {
    const currentDto = useBugReportStore.getState().createDto;
    const result = createBugSchema.safeParse(currentDto);
    if (!result.success) {
      bugReportStore.set("createDtoErrors", result.error.flatten().fieldErrors);
      return false;
    }
    return true;
  }, [bugReportStore]);

  const handleSubmit = React.useCallback(() => {
    const valid = validateForm();
    if (!valid) return;

    const dto = useBugReportStore.getState().createDto;
    const payload: CreateBugDto = {
      ...dto,
      deviceId: null,
    };
    if (createBug) {
      createBug(payload);
    } else {
      internalCreateBug(payload);
    }
  }, [createBug, internalCreateBug, validateForm]);

  const handleCancel = React.useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/audit-monitoring/bug-report");
    }
  }, [onCancel, router]);

  React.useEffect(() => {
    setContent?.(
      <div className="flex items-center gap-2 sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleCancel}
          disabled={isPending}
        >
          {t("common.buttons.cancel", "Cancel")}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={isPending}
        >
          <Save className="h-4 w-4 mr-1" />
          {t("common.buttons.save", "Save")}
          <Spinner show={isPending} />
        </Button>
      </div>,
    );

    return () => {
      clearContent?.();
    };
  }, [clearContent, handleCancel, handleSubmit, isPending, setContent, t]);

  return (
    <div className={cn("flex flex-col flex-1 gap-6 w-full mt-4", className)}>
      <div className="flex flex-col p-1">
        <FormBuilder structure={createBugFormStructure} />
      </div>
    </div>
  );
};
