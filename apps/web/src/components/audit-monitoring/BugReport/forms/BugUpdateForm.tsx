import React from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  useBreadcrumb,
  useFooter,
  useIntro,
  useUI,
} from "@softsurgery/contexts";
import { cn } from "@softsurgery/ui";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ServerErrorResponse, UpdateBugDto } from "@/types";
import { useBugReportStore } from "@/hooks/stores/useBugReportStore";
import { useUsers } from "@/hooks/content/user/useUsers";
import { FormBuilder, SelectOption } from "@softsurgery/form-builder";
import { Button } from "@softsurgery/ui";
import { useUpdateBugFormStructure } from "./useUpdateBugFormStructure";
import { Save } from "lucide-react";
import { updateBugSchema } from "@/types/validations/bug.validation";
import { Spinner } from "@softsurgery/components";
import { identifyUser } from "@softsurgery/lib";

interface BugUpdateFormProps {
  className?: string;
  id?: string;
  updateBug?: (bug: UpdateBugDto) => void;
  isUpdatePending?: boolean;
  onCancel?: () => void;
}

export const BugUpdateForm: React.FC<BugUpdateFormProps> = ({
  className,
  id,
  updateBug,
  isUpdatePending,
  onCancel,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");
  const effectiveId = (id || (router.query.id as string)) ?? "";

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

  const { data: bug, isLoading: isBugLoading } = useQuery({
    queryKey: ["bug", effectiveId],
    queryFn: () => api.admin.bugReport.findOne(effectiveId),
    enabled: Boolean(effectiveId),
  });

  React.useEffect(() => {
    if (bug) {
      bugReportStore.setForEdit(bug);
    }
  }, [bug]);

  React.useEffect(() => {
    return () => {
      useBugReportStore.getState().reset();
    };
  }, []);

  React.useEffect(() => {
    setRoutes?.([
      { title: "Audit Monitoring", href: "/audit-monitoring" },
      { title: "Bug Reports", href: "/audit-monitoring/bug-report" },
      {
        title: bug?.title ? `Edit: ${bug.title}` : "Edit Bug Report",
        href: `/audit-monitoring/bug-report/${effectiveId}`,
      },
    ]);
    setIntro?.(
      bug?.title ? `Edit: ${bug.title}` : "Edit Bug Report",
      "Update bug details, status, variant, and interested users.",
    );
    return () => {
      clearRoutes?.();
      clearIntro?.();
    };
  }, [bug, clearIntro, clearRoutes, effectiveId, setIntro, setRoutes, t]);

  const { mutate: internalUpdateBug, isPending: isInternalUpdatePending } =
    useMutation({
      mutationFn: (data: UpdateBugDto) =>
        api.admin.bugReport.update(effectiveId, data),
      onSuccess: () => {
        toast.success(
          t(
            "bugReport.messages.updateSuccess",
            "Bug report updated successfully.",
          ),
        );
        queryClient.invalidateQueries({ queryKey: ["bugs"] });
        queryClient.invalidateQueries({ queryKey: ["bug", effectiveId] });
        bugReportStore.reset();
        router.push("/audit-monitoring/bug-report");
      },
      onError: (error: ServerErrorResponse) => {
        toast.error(
          error.response?.data?.message ||
            t("bugReport.messages.updateError", "Failed to update bug report."),
        );
      },
    });

  const isPending = isUpdatePending ?? isInternalUpdatePending;

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

  const { updateBugFormStructure } = useUpdateBugFormStructure({
    bugReportStore,
    userOptions,
  });

  const validateForm = React.useCallback(() => {
    const currentDto = useBugReportStore.getState().updateDto;
    const result = updateBugSchema.safeParse(currentDto);
    if (!result.success) {
      bugReportStore.set("updateDtoErrors", result.error.flatten().fieldErrors);
      return false;
    }
    return true;
  }, [bugReportStore]);

  const handleSubmit = React.useCallback(() => {
    const valid = validateForm();
    if (!valid) return;

    const dto = useBugReportStore.getState().updateDto;
    const payload: UpdateBugDto = {
      ...dto,
      deviceId: null,
    };
    if (updateBug) {
      updateBug(payload);
    } else {
      internalUpdateBug(payload);
    }
  }, [internalUpdateBug, updateBug, validateForm]);

  const handleCancel = React.useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/audit-monitoring/bug-report");
    }
  }, [onCancel, router]);

  React.useEffect(() => {
    if (isBugLoading || !bug) {
      clearContent?.();
      return;
    }

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
          {t("common.buttons.save", "Save Changes")}
          <Spinner show={isPending} />
        </Button>
      </div>,
    );

    return () => {
      clearContent?.();
    };
  }, [
    bug,
    clearContent,
    handleCancel,
    handleSubmit,
    isBugLoading,
    isPending,
    setContent,
    t,
  ]);

  if (isBugLoading) {
    return (
      <div className={cn("flex items-center justify-center p-12", className)}>
        <Spinner show={true} />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col flex-1 gap-6 w-full mt-4", className)}>
      <div className="flex flex-col p-1">
        <FormBuilder structure={updateBugFormStructure} />
      </div>
    </div>
  );
};
